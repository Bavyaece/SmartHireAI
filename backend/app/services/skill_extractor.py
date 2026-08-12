import json
import re
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"


def _load_taxonomy() -> dict[str, list[str]]:
    with open(DATA_DIR / "skills_taxonomy.json", encoding="utf-8") as f:
        return json.load(f)


def _title_case(skill: str) -> str:
    special = {"sql": "SQL", "aws": "AWS", "gcp": "GCP", "nlp": "NLP", "llm": "LLM", "ci/cd": "CI/CD"}
    lower = skill.lower()
    if lower in special:
        return special[lower]
    if " " in skill:
        return " ".join(w.capitalize() for w in skill.split())
    return skill.capitalize()


def extract_skills(text: str) -> list[str]:
    taxonomy = _load_taxonomy()
    text_lower = text.lower()
    found: set[str] = set()

    for skills in taxonomy.values():
        for skill in skills:
            pattern = r"\b" + re.escape(skill.lower()) + r"\b"
            if re.search(pattern, text_lower):
                found.add(_title_case(skill))

    # Common tech variants
    aliases = {
        r"\bjs\b": "JavaScript",
        r"\bts\b": "TypeScript",
        r"\bml\b": "Machine Learning",
        r"\bdl\b": "Deep Learning",
        r"\bk8s\b": "Kubernetes",
        r"\bpostgres\b": "PostgreSQL",
        r"\bmongo\b": "MongoDB",
    }
    for pattern, name in aliases.items():
        if re.search(pattern, text_lower):
            found.add(name)

    return sorted(found, key=str.lower)


def load_role_requirements() -> dict:
    with open(DATA_DIR / "role_requirements.json", encoding="utf-8") as f:
        return json.load(f)
