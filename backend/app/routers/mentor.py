from fastapi import APIRouter
from app.schemas import MentorRequest, MentorResponse
from app.services.mentor_service import get_mentor_response

router = APIRouter(prefix="/api", tags=["mentor"])


@router.post("/mentor", response_model=MentorResponse)
async def mentor_chat(request: MentorRequest):
    result = await get_mentor_response(
        message=request.message,
        skills=request.skills,
        target_role=request.target_role,
        resume_score=request.resume_score,
    )
    return MentorResponse(**result)
