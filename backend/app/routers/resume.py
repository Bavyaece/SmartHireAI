from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from app.database import get_db
from app.models import AnalysisRecord
from app.schemas import ResumeAnalysisResponse, JobResponse
from app.services.resume_parser import extract_text, normalize_text, extraction_quality
from app.services.skill_extractor import extract_skills
from app.services.resume_analyzer import score_resume, recommend_roles
from app.services.job_matcher import match_jobs
from app.services.skill_gap_service import analyze_skill_gap
from app.config import get_settings

router = APIRouter(prefix="/api", tags=["resume"])


class AnalyzeTextRequest(BaseModel):
    text: str = Field(..., min_length=1)
    filename: str = "pasted-resume.txt"


def _analyze_text_content(text: str, filename: str, db: Session) -> ResumeAnalysisResponse:
    text = normalize_text(text)
    quality = extraction_quality(text)

    if quality["letters"] < 30 or quality["words"] < 8:
        raise HTTPException(
            status_code=422,
            detail=(
                "Resume text is too short. Paste at least a few lines including your skills and experience, "
                "or upload a text-based PDF/DOCX/TXT."
            ),
        )

    skills = extract_skills(text)
    analysis = score_resume(text, skills)
    roles = recommend_roles(skills)
    jobs = match_jobs(db, skills)[:12]
    top_role = roles[0]["role"] if roles else "AI Engineer"
    skill_gaps = analyze_skill_gap(top_role, skills)

    record = AnalysisRecord(
        filename=filename,
        score=analysis["score"],
        skills=skills,
        strengths=analysis["strengths"],
        recommended_roles=roles,
        ats_score=analysis["ats_score"],
    )
    db.add(record)
    db.commit()

    return ResumeAnalysisResponse(
        score=analysis["score"],
        skills=skills,
        strengths=analysis["strengths"],
        recommended_roles=roles,
        ats_score=analysis["ats_score"],
        ats_label=analysis["ats_label"],
        ats_suggestions=analysis["ats_suggestions"],
        job_matches=[JobResponse(**j) for j in jobs],
        skill_gaps=skill_gaps,
        filename=filename,
    )


@router.post("/analyze-resume", response_model=ResumeAnalysisResponse)
async def analyze_resume(file: UploadFile = File(...), db: Session = Depends(get_db)):
    settings = get_settings()

    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    content = await file.read()
    max_bytes = settings.max_upload_mb * 1024 * 1024
    if len(content) > max_bytes:
        raise HTTPException(status_code=400, detail=f"File exceeds {settings.max_upload_mb}MB limit")

    try:
        raw_text = extract_text(file.filename, content)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Could not parse file: {e}") from e

    text = normalize_text(raw_text)
    quality = extraction_quality(text)

    if quality["letters"] < 30 or quality["words"] < 8:
        name = (file.filename or "").lower()
        if name.endswith(".pdf"):
            detail = (
                "Could not read text from this PDF even with OCR. "
                "Please paste your resume in the text box below (Ctrl+A in Word → Copy → Paste), "
                "or upload a DOCX/TXT file."
            )
        else:
            detail = (
                "Resume text is too short or could not be extracted. "
                "Paste your resume text below, or upload DOCX/TXT."
            )
        raise HTTPException(status_code=422, detail=detail)

    return _analyze_text_content(raw_text, file.filename, db)


@router.post("/analyze-text", response_model=ResumeAnalysisResponse)
def analyze_text(request: AnalyzeTextRequest, db: Session = Depends(get_db)):
    return _analyze_text_content(request.text, request.filename or "pasted-resume.txt", db)
