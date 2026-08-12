import os
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.config import get_settings
from app.database import engine, Base
from app.seed import seed_jobs
from app.routers import resume, jobs, skill_gap, mentor


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    seed_jobs()
    # Warm OCR model so first PDF upload is faster
    try:
        from app.services.resume_parser import _get_ocr_engine
        _get_ocr_engine()
    except Exception:
        pass
    yield


settings = get_settings()
app = FastAPI(title=settings.app_name, version="1.0.0", lifespan=lifespan)

origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(resume.router)
app.include_router(jobs.router)
app.include_router(skill_gap.router)
app.include_router(mentor.router)


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "app": settings.app_name,
        "ai_enabled": bool(settings.openai_api_key),
    }


# Serve frontend static files
ROOT = Path(__file__).resolve().parent.parent.parent
if ROOT.exists():
    app.mount("/css", StaticFiles(directory=ROOT / "css"), name="css")
    app.mount("/js", StaticFiles(directory=ROOT / "js"), name="js")
    app.mount("/assets", StaticFiles(directory=ROOT / "assets"), name="assets")


@app.get("/")
def serve_index():
    index = ROOT / "index.html"
    if index.exists():
        return FileResponse(index)
    return {"message": "SmartHire AI API is running. Visit /api/health"}
