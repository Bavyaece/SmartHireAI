from pathlib import Path
from app.database import SessionLocal
from app.models import Job

SEED_JOBS = [
    {"title": "AI Engineer", "company": "TechCorp", "location": "Remote", "experience": "Mid", "remote": "Remote",
     "skills": ["Python", "Machine Learning", "TensorFlow", "Docker", "SQL"],
     "description": "Build and deploy ML models for production systems."},
    {"title": "Data Analyst", "company": "DataFlow Inc", "location": "Hybrid", "experience": "Entry", "remote": "Hybrid",
     "skills": ["SQL", "Python", "Power BI", "Excel", "Data Analysis"],
     "description": "Analyze business data and create dashboards for stakeholders."},
    {"title": "Software Engineer", "company": "BuildStack", "location": "Remote", "experience": "Mid", "remote": "Remote",
     "skills": ["JavaScript", "React", "Node.js", "Git", "TypeScript"],
     "description": "Develop scalable web applications for global users."},
    {"title": "Machine Learning Engineer", "company": "Neural Labs", "location": "Remote", "experience": "Senior", "remote": "Remote",
     "skills": ["Python", "PyTorch", "Deep Learning", "MLOps", "AWS"],
     "description": "Design ML pipelines and deploy models at scale."},
    {"title": "Full Stack Developer", "company": "StartupHub", "location": "Hybrid", "experience": "Mid", "remote": "Hybrid",
     "skills": ["React", "Node.js", "MongoDB", "JavaScript", "CSS"],
     "description": "Own features end-to-end across frontend and backend."},
    {"title": "Data Scientist", "company": "Insight Analytics", "location": "On-site", "experience": "Mid", "remote": "On-site",
     "skills": ["Python", "Machine Learning", "Statistics", "SQL", "Pandas"],
     "description": "Build predictive models and deliver data-driven insights."},
    {"title": "DevOps Engineer", "company": "CloudNine", "location": "Remote", "experience": "Senior", "remote": "Remote",
     "skills": ["Docker", "Kubernetes", "AWS", "CI/CD", "Linux"],
     "description": "Manage cloud infrastructure and deployment pipelines."},
    {"title": "Frontend Developer", "company": "PixelWorks", "location": "Remote", "experience": "Entry", "remote": "Remote",
     "skills": ["React", "JavaScript", "HTML", "CSS", "TypeScript"],
     "description": "Create responsive, accessible user interfaces."},
    {"title": "Backend Developer", "company": "APIForge", "location": "Hybrid", "experience": "Mid", "remote": "Hybrid",
     "skills": ["Python", "FastAPI", "PostgreSQL", "Docker", "Redis"],
     "description": "Design and build robust REST APIs and microservices."},
    {"title": "AI Engineer", "company": "VisionAI", "location": "Remote", "experience": "Senior", "remote": "Remote",
     "skills": ["Python", "Computer Vision", "Deep Learning", "TensorFlow", "NLP"],
     "description": "Develop computer vision and NLP solutions for enterprise clients."},
    {"title": "Data Analyst", "company": "RetailMetrics", "location": "On-site", "experience": "Entry", "remote": "On-site",
     "skills": ["SQL", "Excel", "Tableau", "Python", "Data Visualization"],
     "description": "Support retail analytics and reporting initiatives."},
    {"title": "Software Engineer", "company": "FinTech Pro", "location": "Hybrid", "experience": "Senior", "remote": "Hybrid",
     "skills": ["Java", "Spring", "SQL", "AWS", "Microservices"],
     "description": "Build secure financial software systems."},
    {"title": "ML Intern", "company": "LearnAI", "location": "Remote", "experience": "Entry", "remote": "Remote",
     "skills": ["Python", "Machine Learning", "Git", "Pandas"],
     "description": "Internship focused on ML model development and research."},
    {"title": "Cloud Engineer", "company": "InfraScale", "location": "Remote", "experience": "Mid", "remote": "Remote",
     "skills": ["AWS", "Terraform", "Docker", "Linux", "Python"],
     "description": "Architect and maintain cloud-native infrastructure."},
    {"title": "Product Data Analyst", "company": "GrowthLoop", "location": "Remote", "experience": "Mid", "remote": "Remote",
     "skills": ["SQL", "Python", "A/B Testing", "Data Analysis", "Power BI"],
     "description": "Drive product decisions with data experiments and analytics."},
    {"title": "React Developer", "company": "WebCraft", "location": "Remote", "experience": "Mid", "remote": "Remote",
     "skills": ["React", "Redux", "JavaScript", "TypeScript", "Git"],
     "description": "Build modern SPA applications for SaaS products."},
    {"title": "AI Research Engineer", "company": "DeepMind Labs", "location": "Hybrid", "experience": "Senior", "remote": "Hybrid",
     "skills": ["Python", "PyTorch", "Deep Learning", "Research", "NLP"],
     "description": "Research and prototype next-generation AI systems."},
    {"title": "Junior Data Analyst", "company": "HealthStats", "location": "On-site", "experience": "Entry", "remote": "On-site",
     "skills": ["SQL", "Excel", "Python", "Statistics"],
     "description": "Support healthcare analytics and reporting."},
    {"title": "Platform Engineer", "company": "ScaleOps", "location": "Remote", "experience": "Senior", "remote": "Remote",
     "skills": ["Kubernetes", "Go", "Docker", "AWS", "CI/CD"],
     "description": "Build internal developer platforms and tooling."},
    {"title": "Python Developer", "company": "CodeStream", "location": "Remote", "experience": "Mid", "remote": "Remote",
     "skills": ["Python", "Django", "PostgreSQL", "REST APIs", "Git"],
     "description": "Develop backend services and automation tools."},
    {"title": "Business Intelligence Analyst", "company": "BizIntel", "location": "Hybrid", "experience": "Mid", "remote": "Hybrid",
     "skills": ["Power BI", "SQL", "Excel", "Data Visualization", "ETL"],
     "description": "Create BI dashboards and data models for executives."},
    {"title": "NLP Engineer", "company": "TextMind", "location": "Remote", "experience": "Mid", "remote": "Remote",
     "skills": ["Python", "NLP", "Machine Learning", "LLM", "TensorFlow"],
     "description": "Build natural language processing applications."},
    {"title": "Software Engineer Intern", "company": "NextGen Tech", "location": "Hybrid", "experience": "Entry", "remote": "Hybrid",
     "skills": ["JavaScript", "React", "Git", "HTML", "CSS"],
     "description": "Summer internship for aspiring software engineers."},
    {"title": "Analytics Engineer", "company": "DataBridge", "location": "Remote", "experience": "Mid", "remote": "Remote",
     "skills": ["SQL", "Python", "dbt", "ETL", "Data Analysis"],
     "description": "Build and maintain analytics data pipelines."},
]


def seed_jobs():
    db = SessionLocal()
    try:
        if db.query(Job).count() == 0:
            for job_data in SEED_JOBS:
                db.add(Job(**job_data))
            db.commit()
    finally:
        db.close()
