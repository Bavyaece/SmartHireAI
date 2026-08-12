import httpx
from app.config import get_settings
from app.services.skill_extractor import load_role_requirements


CAREER_TIPS = {
    "interview": [
        "Research the company and role thoroughly before the interview.",
        "Prepare STAR-format stories for behavioral questions.",
        "Practice explaining your projects with measurable outcomes.",
        "Prepare 2-3 thoughtful questions to ask the interviewer.",
    ],
    "resume": [
        "Tailor your resume keywords to match the job description.",
        "Lead with impact: quantify achievements with numbers.",
        "Keep formatting ATS-friendly — avoid tables and graphics.",
        "Highlight projects that demonstrate relevant skills.",
    ],
    "skills": [
        "Focus on one skill gap at a time with hands-on projects.",
        "Build a portfolio project that uses your target stack.",
        "Contribute to open source to gain real-world experience.",
        "Pair online courses with practical application within 48 hours.",
    ],
    "career": [
        "Set a 90-day learning plan aligned with your target role.",
        "Network on LinkedIn with professionals in your target field.",
        "Seek informational interviews to understand role expectations.",
        "Track your progress weekly and adjust your roadmap.",
    ],
}


def _detect_topic(message: str) -> str:
    lower = message.lower()
    if any(w in lower for w in ["interview", "hr", "question", "prepare"]):
        return "interview"
    if any(w in lower for w in ["resume", "cv", "ats"]):
        return "resume"
    if any(w in lower for w in ["learn", "skill", "course", "study", "roadmap"]):
        return "skills"
    return "career"


def _fallback_response(message: str, skills: list[str], target_role: str | None, score: float | None) -> dict:
    topic = _detect_topic(message)
    tips = CAREER_TIPS[topic]
    role = target_role or "AI Engineer"
    roles = load_role_requirements()
    role_data = roles.get(role, roles.get("AI Engineer", {}))
    missing = [s for s in role_data.get("required", []) + role_data.get("preferred", [])
               if s.lower() not in {sk.lower() for sk in skills}]

    skill_str = ", ".join(skills[:8]) if skills else "your current skill set"
    score_str = f"Your resume score is {score}/100. " if score else ""

    if "skill" in message.lower() or "learn" in message.lower() or "become" in message.lower():
        path = role_data.get("learning_path", [])
        path_str = " → ".join(path[:5]) if path else "fundamentals to advanced topics"
        missing_str = ", ".join(m.title() for m in missing[:5]) if missing else "advanced specialization topics"
        reply = (
            f"{score_str}Based on your profile ({skill_str}), to become a {role}, "
            f"I recommend focusing on: {missing_str}. "
            f"Follow this learning path: {path_str}. "
            f"Build one portfolio project per skill to demonstrate practical ability."
        )
    elif topic == "interview":
        reply = (
            f"{score_str}For interview prep as a {role} candidate, emphasize {skill_str}. "
            f"Practice explaining how you've applied these skills in real projects. "
            f"{tips[0]}"
        )
    elif topic == "resume":
        reply = (
            f"{score_str}To improve your resume, ensure these skills are prominent: {skill_str}. "
            f"{tips[1]} {tips[2]}"
        )
    else:
        reply = (
            f"{score_str}As you work toward a {role} role, your key strengths include {skill_str}. "
            f"Priority areas to develop: {', '.join(m.title() for m in missing[:4]) or 'continued practice'}. "
            f"{tips[0]}"
        )

    return {"reply": reply, "suggestions": tips[:3]}


async def get_mentor_response(
    message: str,
    skills: list[str] | None = None,
    target_role: str | None = None,
    resume_score: float | None = None,
) -> dict:
    settings = get_settings()
    skills = skills or []
    context = (
        f"User skills: {', '.join(skills) or 'none yet'}. "
        f"Target role: {target_role or 'not specified'}. "
        f"Resume score: {resume_score or 'N/A'}/100."
    )

    if settings.openai_api_key:
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {settings.openai_api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": settings.openai_model,
                        "messages": [
                            {
                                "role": "system",
                                "content": (
                                    "You are SmartHire AI Career Mentor — a professional, encouraging "
                                    "career coach for students and job seekers. Give specific, actionable "
                                    "advice in 3-5 sentences. Use the user's profile context."
                                ),
                            },
                            {"role": "user", "content": f"Context: {context}\n\nQuestion: {message}"},
                        ],
                        "max_tokens": 400,
                        "temperature": 0.7,
                    },
                )
                response.raise_for_status()
                data = response.json()
                reply = data["choices"][0]["message"]["content"].strip()
                topic = _detect_topic(message)
                return {"reply": reply, "suggestions": CAREER_TIPS[topic][:3]}
        except Exception:
            pass

    return _fallback_response(message, skills, target_role, resume_score)
