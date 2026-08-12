"""
Vercel serverless entrypoint for SmartHire AI FastAPI backend.
"""
import os
import sys
from pathlib import Path

# Ensure backend package is importable on Vercel
ROOT = Path(__file__).resolve().parent.parent
BACKEND = ROOT / "backend"
if str(BACKEND) not in sys.path:
    sys.path.insert(0, str(BACKEND))

# Serverless-friendly defaults
os.environ.setdefault("VERCEL", "1")
if not os.environ.get("DATABASE_URL"):
    os.environ["DATABASE_URL"] = "sqlite:////tmp/smarthire.db"

from app.main import app  # noqa: E402
