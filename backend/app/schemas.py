from pydantic import BaseModel, Field
from typing import Optional


class SkillGapRequest(BaseModel):
    target_role: str
    skills: list[str] = Field(default_factory=list)


class MentorRequest(BaseModel):
    message: str
    skills: list[str] = Field(default_factory=list)
    target_role: Optional[str] = None
    resume_score: Optional[float] = None


class JobResponse(BaseModel):
    id: int
    title: str
    company: str
    location: str
    experience: str
    remote: str
    skills: list[str]
    match_percent: float
    description: str

    class Config:
        from_attributes = True


class ResumeAnalysisResponse(BaseModel):
    score: float
    skills: list[str]
    strengths: list[str]
    recommended_roles: list[dict]
    ats_score: float
    ats_label: str
    ats_suggestions: list[str]
    job_matches: list[JobResponse]
    skill_gaps: dict
    filename: str


class SkillGapResponse(BaseModel):
    target_role: str
    readiness_percent: float
    skills: list[dict]
    learning_path: list[dict]


class MentorResponse(BaseModel):
    reply: str
    suggestions: list[str] = Field(default_factory=list)
