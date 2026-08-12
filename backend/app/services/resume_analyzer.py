import re
from app.services.skill_extractor import extract_skills, load_role_requirements


def _word_count(text: str) -> int:
    return len(re.findall(r"\w+", text))


def _has_section(text: str, keywords: list[str]) -> bool:
    lower = text.lower()
    return any(k in lower for k in keywords)


def score_resume(text: str, skills: list[str]) -> dict:
    words = _word_count(text)
    skills_lower = {s.lower() for s in skills}

    score = 40.0
    strengths: list[str] = []
    suggestions: list[str] = []

    # Length
    if words >= 250:
        score += 10
        strengths.append("Good content length")
    elif words >= 120:
        score += 5
        suggestions.append("Add more detail to projects and achievements")
    else:
        suggestions.append("Resume is too short — expand experience and projects")

    # Skills breadth
    if len(skills) >= 8:
        score += 15
        strengths.append("Strong technical skill set")
    elif len(skills) >= 4:
        score += 10
        strengths.append("Solid skill coverage")
    else:
        suggestions.append("Add more relevant technical skills")

    # Sections
    if _has_section(text, ["experience", "work history", "employment"]):
        score += 10
        strengths.append("Experience section present")
    else:
        suggestions.append("Add a clear Experience section")

    if _has_section(text, ["education", "degree", "university", "college"]):
        score += 5
    else:
        suggestions.append("Include Education details")

    if _has_section(text, ["project", "portfolio", "built", "developed"]):
        score += 8
        strengths.append("Project experience highlighted")
    else:
        suggestions.append("Add a Projects section with measurable outcomes")

    if _has_section(text, ["certification", "certified", "certificate"]):
        score += 5
        strengths.append("Certifications listed")

    # Contact / links
    if re.search(r"[\w.+-]+@[\w-]+\.[\w.-]+", text):
        score += 3
    else:
        suggestions.append("Include a professional email address")

    if re.search(r"linkedin\.com", text.lower()):
        score += 4
        strengths.append("LinkedIn profile included")
    else:
        suggestions.append("Add your LinkedIn profile URL")

    # Action verbs
    action_verbs = ["developed", "built", "led", "designed", "implemented", "optimized", "created", "managed"]
    verb_hits = sum(1 for v in action_verbs if v in text.lower())
    if verb_hits >= 4:
        score += 7
        strengths.append("Strong action-oriented language")
    elif verb_hits >= 2:
        score += 3
    else:
        suggestions.append("Use more action verbs (developed, built, led, optimized)")

    # Quantified achievements
    if re.search(r"\d+%|\$\d+|\d+\+|\d+\s*(users|customers|projects)", text.lower()):
        score += 5
        strengths.append("Quantified achievements")
    else:
        suggestions.append("Add metrics to achievements (%, numbers, impact)")

    score = min(100.0, round(score, 1))

    if score >= 80:
        ats_label = "Excellent"
    elif score >= 65:
        ats_label = "Good"
    elif score >= 50:
        ats_label = "Fair"
    else:
        ats_label = "Needs Work"

    ats_score = min(100.0, score + (5 if len(suggestions) <= 2 else 0))

    if not strengths:
        strengths = ["Resume uploaded successfully"]

    return {
        "score": score,
        "strengths": strengths[:6],
        "ats_score": round(ats_score, 1),
        "ats_label": ats_label,
        "ats_suggestions": suggestions[:6],
    }


def recommend_roles(skills: list[str]) -> list[dict]:
    roles_data = load_role_requirements()
    skills_lower = {s.lower() for s in skills}
    recommendations = []

    for role, data in roles_data.items():
        required = [r.lower() for r in data["required"]]
        preferred = [p.lower() for p in data["preferred"]]
        all_skills = required + preferred

        matched = sum(1 for s in all_skills if s in skills_lower)
        total = len(all_skills) or 1
        req_matched = sum(1 for s in required if s in skills_lower)
        req_total = len(required) or 1

        match_pct = round((matched / total) * 70 + (req_matched / req_total) * 30, 1)
        match_pct = min(98.0, match_pct)

        if match_pct >= 35:
            recommendations.append({"role": role, "match_percent": match_pct})

    recommendations.sort(key=lambda x: x["match_percent"], reverse=True)
    return recommendations[:5]
