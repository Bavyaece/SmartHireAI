from sqlalchemy.orm import Session
from app.models import Job


def compute_match(job_skills: list[str], user_skills: list[str]) -> float:
    if not job_skills:
        return 0.0
    user_lower = {s.lower() for s in user_skills}
    matched = sum(1 for s in job_skills if s.lower() in user_lower)
    base = (matched / len(job_skills)) * 100
    # Bonus for high overlap
    if matched == len(job_skills):
        base = min(98.0, base + 5)
    return round(base, 1)


def match_jobs(db: Session, user_skills: list[str], role: str = "", location: str = "",
               experience: str = "", remote: str = "", skills_filter: str = "") -> list[dict]:
    query = db.query(Job)

    if role and role != "All Roles":
        query = query.filter(Job.title.ilike(f"%{role}%"))
    if location and location != "All Locations":
        if location == "Remote":
            query = query.filter(Job.remote.ilike("%remote%"))
        elif location == "Hybrid":
            query = query.filter(Job.location.ilike("%hybrid%"))
        elif location == "On-site":
            query = query.filter(~Job.location.ilike("%remote%"), ~Job.location.ilike("%hybrid%"))
    if experience and experience != "All Levels":
        query = query.filter(Job.experience.ilike(f"%{experience}%"))
    if remote and remote == "Remote Only":
        query = query.filter(Job.remote.ilike("%remote%"))
    elif remote and remote == "Not Remote":
        query = query.filter(~Job.remote.ilike("%remote%"))
    if skills_filter and skills_filter != "All Skills":
        # Filter in Python for SQLite JSON simplicity
        pass

    jobs = query.all()
    results = []

    for job in jobs:
        job_skill_list = job.skills or []
        if skills_filter and skills_filter != "All Skills":
            if not any(skills_filter.lower() in s.lower() for s in job_skill_list):
                continue

        match_pct = compute_match(job_skill_list, user_skills)
        if not user_skills:
            match_pct = 50.0

        results.append({
            "id": job.id,
            "title": job.title,
            "company": job.company,
            "location": job.location,
            "experience": job.experience,
            "remote": job.remote,
            "skills": job_skill_list,
            "match_percent": match_pct,
            "description": job.description or "",
        })

    results.sort(key=lambda x: x["match_percent"], reverse=True)
    return results
