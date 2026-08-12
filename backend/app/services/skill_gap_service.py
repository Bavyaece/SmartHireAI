from app.services.skill_extractor import load_role_requirements


def _normalize(skill: str) -> str:
    return skill.lower().strip()


def analyze_skill_gap(target_role: str, user_skills: list[str]) -> dict:
    roles = load_role_requirements()
    role_key = target_role

    if role_key not in roles:
        for key in roles:
            if key.lower() == target_role.lower():
                role_key = key
                break
        else:
            role_key = "AI Engineer"

    data = roles[role_key]
    required = data["required"]
    preferred = data["preferred"]
    all_role_skills = required + preferred
    user_lower = {_normalize(s) for s in user_skills}

    skill_status = []
    have_count = 0

    for skill in all_role_skills:
        norm = _normalize(skill)
        if norm in user_lower:
            status = "have"
            have_count += 1
        else:
            # Partial: substring match
            partial = any(norm in u or u in norm for u in user_lower)
            if partial:
                status = "partial"
                have_count += 0.5
            else:
                status = "missing"
        skill_status.append({
            "name": skill.title() if skill.islower() else skill,
            "status": status,
        })

    total = len(all_role_skills) or 1
    readiness = round((have_count / total) * 100, 1)

    learning_path = []
    for i, step in enumerate(data.get("learning_path", []), 1):
        step_lower = step.lower()
        completed = any(step_lower in _normalize(s) or _normalize(s) in step_lower for s in user_skills)
        active = not completed and (i == 1 or learning_path[-1]["progress"] == 100)
        progress = 100 if completed else (45 if active else 0)
        learning_path.append({
            "step": i,
            "title": step,
            "progress": progress,
            "status": "completed" if completed else ("active" if active else "pending"),
        })

    # Mark first incomplete as active if none active
    if not any(p["status"] == "active" for p in learning_path):
        for p in learning_path:
            if p["status"] == "pending":
                p["status"] = "active"
                p["progress"] = 20
                break

    return {
        "target_role": role_key,
        "readiness_percent": readiness,
        "skills": skill_status,
        "learning_path": learning_path,
    }
