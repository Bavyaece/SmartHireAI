from fastapi import APIRouter
from app.schemas import SkillGapRequest, SkillGapResponse
from app.services.skill_gap_service import analyze_skill_gap

router = APIRouter(prefix="/api", tags=["skill-gap"])


@router.post("/skill-gap", response_model=SkillGapResponse)
def skill_gap(request: SkillGapRequest):
    result = analyze_skill_gap(request.target_role, request.skills)
    return SkillGapResponse(**result)


@router.get("/roles")
def list_roles():
    from app.services.skill_extractor import load_role_requirements
    return {"roles": list(load_role_requirements().keys())}
