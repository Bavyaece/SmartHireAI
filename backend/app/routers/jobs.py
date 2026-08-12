from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import JobResponse
from app.services.job_matcher import match_jobs

router = APIRouter(prefix="/api", tags=["jobs"])


@router.get("/jobs", response_model=list[JobResponse])
def get_jobs(
    role: str = Query("", alias="role"),
    location: str = Query("", alias="location"),
    experience: str = Query("", alias="experience"),
    remote: str = Query("", alias="remote"),
    skills: str = Query("", alias="skills"),
    user_skills: str = Query("", alias="user_skills"),
    db: Session = Depends(get_db),
):
    skill_list = [s.strip() for s in user_skills.split(",") if s.strip()] if user_skills else []
    results = match_jobs(db, skill_list, role, location, experience, remote, skills)
    return [JobResponse(**j) for j in results]
