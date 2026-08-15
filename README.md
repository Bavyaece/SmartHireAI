# SmartHire AI 🚀

**Your Career, Smarter with AI.**

A full-stack AI-powered career assistant platform that analyzes your resume, matches you with relevant job opportunities, identifies skill gaps, and provides personalized career guidance through an intelligent AI mentor.

> ✨ **Fully functional** — Real resume parsing, actual job matching engine, skill gap analysis, and AI career coaching.

## 🌐 Live Deployment

| Platform | URL | Status |
|----------|-----|--------|
| **GitHub** (Repository) | [Bavyaece/SmartHireAI](https://github.com/Bavyaece/SmartHireAI) | ✅ Active |
| **Live Full App** | Deploy to Render (see guide below) | 📦 Ready |
| **Frontend Only** | [GitHub Pages](https://bavyaece.github.io/SmartHireAI/) | 📄 Available |

> 💡 **Note:** For the complete experience with resume upload, job matching, and AI mentoring, deploy locally or use Render (free tier supported).

## ✨ Features

| Feature | Endpoint | What It Does |
|---------|----------|--------------|
| 📄 **Resume Analyzer** | `POST /api/analyze-resume` | Parses PDF/DOCX resumes, extracts skills, calculates ATS score, provides improvement tips |
| 💼 **Job Matcher** | `GET /api/jobs` | Matches your skills against 24 seeded job positions with real match percentages |
| 🎯 **Skill Gap Analysis** | `POST /api/skill-gap` | Identifies missing skills for target roles, creates learning paths |
| 🤖 **AI Mentor** | `POST /api/mentor` | Provides personalized career coaching and guidance (OpenAI powered, with smart fallback) |
| 📊 **Smart Dashboard** | Web UI | Real-time analytics and career insights after resume upload |
| 🔐 **Database** | Supabase/SQLite | Secure data persistence for user profiles and career data |

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Git
- (Optional) Docker & Docker Compose

### Option 1: Windows Quick Start (Fastest)
```bash
start.bat
```
This runs the complete application on `http://localhost:8000`

### Option 2: Manual Setup
```bash
# Navigate to backend
cd backend

# Install dependencies
pip install -r requirements.txt

# Run the application
python run.py
```
Access the app at **http://localhost:8000**

### Option 3: Docker (Recommended for Consistency)
```bash
docker compose up --build
```
The app will be available at **http://localhost:8000**

### Option 4: Vercel Deployment
```bash
# Deploy with Vercel CLI
vercel deploy
```
Uses configuration in `vercel.json`

## 🌍 Deploy to Render (Free Tier)

1. **Ensure your repository is on GitHub** (you already are at `Bavyaece/SmartHireAI`)

2. **Visit Render Dashboard:** Go to [render.com](https://render.com)

3. **Create New Service:**
   - Click "New +" → "Blueprint"
   - Select "Connect a repository"
   - Authorize and select `Bavyaece/SmartHireAI`

4. **Auto-Configuration:** Render automatically detects and uses `render.yaml`

5. **Deploy:** Click "Deploy" and wait for build completion (2-3 minutes)

6. **Your live app:** `https://smarthire-ai.onrender.com`

### Optional: Add OpenAI Integration
- In Render dashboard → Environment
- Add: `OPENAI_API_KEY=sk-your-key-here`
- Redeploy for AI Mentor enhancements

**Free tier includes:**
- 750 compute hours/month
- Automatic sleep after 15 mins of inactivity (wake on request)
- Sufficient for small projects and testing

## 📁 Project Structure

```
SmartHireAI/
│
├── 🌐 Frontend (Root)
│   ├── index.html              # Main landing page
│   ├── css/
│   │   └── styles.css          # Application styling
│   ├── js/
│   │   ├── app.js              # Main application logic
│   │   ├── api.js              # API client/communication
│   │   ├── main.js             # Entry point
│   │   ├── supabase-auth.js    # Authentication module
│   │   └── supabase-config.js  # Supabase configuration
│   └── assets/                 # Images and media files
│
├── 🔧 Backend (Python/FastAPI)
│   ├── backend/
│   │   ├── app/
│   │   │   ├── main.py         # FastAPI application & server
│   │   │   ├── config.py       # Configuration settings
│   │   │   ├── database.py     # Database setup & models
│   │   │   ├── models.py       # SQLAlchemy ORM models
│   │   │   ├── schemas.py      # Pydantic request/response schemas
│   │   │   ├── seed.py         # Database seeding script
│   │   │   │
│   │   │   ├── routers/        # API endpoint routes
│   │   │   │   ├── resume.py      # Resume analysis endpoints
│   │   │   │   ├── jobs.py        # Job matching endpoints
│   │   │   │   ├── skill_gap.py   # Skill gap analysis endpoints
│   │   │   │   └── mentor.py      # AI mentor endpoints
│   │   │   │
│   │   │   ├── services/       # Business logic & processing
│   │   │   │   ├── resume_parser.py      # PDF/DOCX parsing
│   │   │   │   ├── resume_analyzer.py    # Resume analysis
│   │   │   │   ├── job_matcher.py        # Job matching algorithm
│   │   │   │   ├── skill_extractor.py    # Skill extraction
│   │   │   │   ├── skill_gap_service.py  # Gap analysis
│   │   │   │   └── mentor_service.py     # AI mentor logic
│   │   │   │
│   │   │   └── data/           # Static data
│   │   │       ├── skills_taxonomy.json  # Skills database
│   │   │       └── role_requirements.json # Job requirements
│   │   │
│   │   ├── run.py              # Backend startup script
│   │   └── requirements.txt    # Python dependencies
│   │
│   └── api/
│       └── index.py            # Serverless API handler
│
├── 📦 Database & Configuration
│   ├── supabase/
│   │   └── schema.sql          # Supabase database schema
│   └── smarthire.db            # Local SQLite database
│
├── 🐳 Deployment
│   ├── Dockerfile              # Docker container definition
│   ├── docker-compose.yml      # Multi-container orchestration
│   ├── render.yaml             # Render deployment config
│   ├── vercel.json             # Vercel deployment config
│   └── start.bat               # Windows quick-start script
│
└── 📚 Documentation
    ├── README.md               # This file
    ├── SUPABASE.md             # Supabase setup guide
    └── VERCEL.md               # Vercel deployment guide
```

## 📡 API Reference

### Health Check
```bash
GET /api/health
# Returns: {"status": "ok"}
```

### Resume Analysis
```bash
POST /api/analyze-resume
# Upload multipart file (PDF or DOCX)
# Returns: {
#   "skills": ["Python", "SQL", ...],
#   "ats_score": 85,
#   "summary": "...",
#   "improvements": ["..."]
# }
```

### Job Matching
```bash
GET /api/jobs?role=AI Engineer&user_skills=Python,SQL,Machine Learning
# Optional filters: role, user_skills
# Returns: [
#   {
#     "id": 1,
#     "title": "AI Engineer",
#     "company": "TechCorp",
#     "match_percentage": 92,
#     "required_skills": [...],
#     "description": "..."
#   },
#   ...
# ]
```

### Skill Gap Analysis
```bash
POST /api/skill-gap
Content-Type: application/json
{
  "target_role": "AI Engineer",
  "skills": ["Python", "SQL"],
  "experience_years": 3
}

# Returns: {
#   "gap_analysis": {...},
#   "missing_skills": ["Machine Learning", "PyTorch"],
#   "learning_path": ["Beginner", "Intermediate", "Advanced"],
#   "role_readiness_score": 65
# }
```

### AI Mentor Chat
```bash
POST /api/mentor
Content-Type: application/json
{
  "message": "What skills should I learn for AI Engineer role?",
  "skills": ["Python", "SQL"],
  "target_role": "AI Engineer"
}

# Returns: {
#   "response": "Based on your profile, here are recommended skills...",
#   "suggestions": ["Machine Learning", "Deep Learning", "NLP"]
# }
```

### Complete API Documentation
Once running, visit **http://localhost:8000/docs** for interactive Swagger UI documentation.

## 🤖 AI Mentor - OpenAI Integration (Optional)

The AI Mentor works with or without OpenAI. Here's how to enable it:

### Setup OpenAI API Key

1. **Get your API key:**
   - Sign up at [OpenAI](https://platform.openai.com)
   - Generate API key from dashboard
   - Keep it safe (never commit to Git)

2. **Local Development:**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env and add:
   OPENAI_API_KEY=sk-your-key-here
   ```

3. **Render Deployment:**
   - Dashboard → Environment
   - Add environment variable: `OPENAI_API_KEY=sk-your-key-here`
   - Redeploy application

### Without OpenAI (Fallback Mode)
The AI Mentor uses intelligent rule-based responses powered by your resume profile and skills data. This works great for general career guidance and skill recommendations.

### Env Variables Reference
```env
# .env file (backend/)
OPENAI_API_KEY=sk-your-key-here         # Optional - enables advanced AI features
DATABASE_URL=sqlite:///./smarthire.db   # Database connection
DEBUG=True                               # Development mode
```

## 🛠️ Tech Stack

### Frontend
- **Framework:** HTML5, CSS3, JavaScript (Vanilla)
- **Auth:** Supabase Authentication
- **Database Client:** Supabase SDK
- **UI:** Responsive Design, Bootstrap-inspired styling

### Backend
- **Framework:** FastAPI 0.115.6
- **Server:** Uvicorn with standard extensions
- **ORM:** SQLAlchemy 2.0
- **Database:** SQLite (local) / Supabase (production)
- **Data Validation:** Pydantic v2

### Document Processing
- **PDF Parsing:** PyPDF, pdfminer.six, PyMuPDF
- **Document Reading:** python-docx
- **OCR:** RapidOCR with ONNX Runtime
- **Image Processing:** Pillow

### AI & APIs
- **AI Chatting:** OpenAI API (optional)
- **HTTP Client:** httpx
- **Environment:** python-dotenv

### Deployment
- **Containerization:** Docker & Docker Compose
- **Cloud Platforms:** Render, Vercel
- **Version Control:** Git, GitHub

## 📝 Supported Resume Formats
- ✅ PDF
- ✅ DOCX (Microsoft Word)
- ✅ DOC (Legacy Word format)
- ✅ Text-based PDFs with OCR support

## 🐛 Troubleshooting

### Issue: "Module not found" error
```bash
# Solution: Reinstall dependencies
cd backend
pip install --upgrade -r requirements.txt
```

### Issue: Port 8000 already in use
```bash
# Solution: Use different port
cd backend && python run.py --port 8001
# Or kill existing process on port 8000
```

### Issue: Database locked error
```bash
# Solution: Delete and recreate database
rm backend/smarthire.db
python backend/app/seed.py  # Reseed database
```

### Issue: Resume upload fails
- Ensure file is PDF or DOCX format
- Check file size (recommended < 5MB)
- Verify permissions for file access

### Issue: AI Mentor not responding
- Check OpenAI API key is set (if using)
- Verify internet connectivity
- App uses fallback mode without key (still functional)

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork the repository** on GitHub
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** and test thoroughly
4. **Commit with clear messages**
   ```bash
   git commit -m "Add feature: description"
   ```
5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Submit a Pull Request** with detailed description

### Development Guidelines
- Follow PEP 8 for Python code
- Use meaningful variable and function names
- Add docstrings to functions
- Test your changes before submitting
- Update README if adding new features

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 👨‍💻 Author

**SmartHire AI** - Created by [Bavyaece](https://github.com/Bavyaece)

## 🙏 Acknowledgments

- FastAPI community for excellent framework
- Supabase for backend services
- OpenAI for AI capabilities
- All contributors and users

## 📞 Support & Contact

- 📧 Email: bavyaece24@gmail.com
- 🐙 GitHub: [Bavyaece/SmartHireAI](https://github.com/Bavyaece/SmartHireAI)
- 💬 Issues: Report bugs on [GitHub Issues](https://github.com/Bavyaece/SmartHireAI/issues)

---

**⭐ If you find this project useful, please consider giving it a star on GitHub!**

Last Updated: 2026-08-15
