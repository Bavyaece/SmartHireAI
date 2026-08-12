# SmartHire AI

**Your Career, Smarter with AI.**

Full-stack AI career platform with a working Python/FastAPI backend — not a demo. Upload a real resume, get real analysis, job matches, skill gaps, and AI career guidance.

## Live Demo

| Deployment | URL |
|------------|-----|
| GitHub Pages (UI only) | [bavyaece.github.io/SmartHireAI](https://bavyaece.github.io/SmartHireAI/) |
| **Full App (Backend + UI)** | Run locally or deploy to [Render](https://render.com) |

> **Note:** GitHub Pages hosts the frontend only. For the **full working app** (resume upload, job matching, AI mentor), run the backend locally or deploy to Render.

## Features (Fully Working)

| Feature | Backend Endpoint | Description |
|---------|------------------|-------------|
| Resume Analyzer | `POST /api/analyze-resume` | Parses PDF/DOCX, extracts skills, scores resume, ATS tips |
| Job Matching | `GET /api/jobs` | 24 seeded jobs with real match % based on your skills |
| Skill Gap | `POST /api/skill-gap` | Role readiness, missing skills, learning path |
| AI Mentor | `POST /api/mentor` | Career chat (OpenAI optional, smart fallback built-in) |
| Dashboard | Auto-updates | Live stats after resume upload |

## Quick Start (Local — Full App)

### Option 1: One-click (Windows)

```bash
start.bat
```

### Option 2: Manual

```bash
cd backend
pip install -r requirements.txt
python run.py
```

Open **http://localhost:8000** — frontend and API run together.

### Option 3: Docker

```bash
docker compose up --build
```

## Deploy to Render (Free)

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → New → Blueprint
3. Connect `Bavyaece/SmartHireAI` — uses `render.yaml` automatically
4. Your full app will be live at `https://smarthire-ai.onrender.com`

Optional: Add `OPENAI_API_KEY` in Render environment variables for enhanced AI Mentor.

## Project Structure

```
SmartHireAI/
├── index.html              # Frontend landing page
├── css/ js/ assets/        # Frontend assets
├── backend/
│   ├── app/
│   │   ├── main.py         # FastAPI app + static serving
│   │   ├── routers/        # API routes
│   │   ├── services/       # Resume parser, job matcher, AI mentor
│   │   └── data/           # Skills taxonomy, role requirements
│   ├── requirements.txt
│   └── run.py
├── Dockerfile
├── docker-compose.yml
└── render.yaml
```

## API Reference

```bash
# Health check
GET /api/health

# Analyze resume (multipart file upload)
POST /api/analyze-resume

# Get jobs with filters
GET /api/jobs?role=AI Engineer&user_skills=Python,SQL

# Skill gap analysis
POST /api/skill-gap
{"target_role": "AI Engineer", "skills": ["Python", "SQL"]}

# AI Mentor chat
POST /api/mentor
{"message": "What skills should I learn?", "skills": ["Python"], "target_role": "AI Engineer"}
```

## Optional: OpenAI Integration

Copy `backend/.env.example` to `backend/.env` and add:

```
OPENAI_API_KEY=sk-your-key-here
```

Without a key, the AI Mentor uses intelligent rule-based responses powered by your resume profile.

## Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Python 3.12, FastAPI, SQLAlchemy, SQLite
- **Resume Parsing:** pypdf, python-docx
- **Deployment:** Docker, Render, GitHub Pages (UI)

© 2026 SmartHire AI. All rights reserved.
