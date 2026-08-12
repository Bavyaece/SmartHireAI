# SmartHire AI

**Your Career, Smarter with AI.**

SmartHire AI is an AI-powered career assistant that helps students, graduates, job seekers, and professionals analyze their resumes, discover suitable job opportunities, identify skill gaps, and receive personalized career guidance.

🌐 **Live Site:** [https://bavyaece.github.io/SmartHireAI/](https://bavyaece.github.io/SmartHireAI/)

## Features

- **Resume Intelligence** — Scoring, skill extraction, ATS suggestions, strength analysis
- **Smart Job Matching** — Match percentage, skill comparison, recommended roles
- **Skill Gap Analysis** — Current vs required skills with learning paths
- **AI Career Mentor** — Personalized career guidance and interview prep

## Tech Stack

- HTML5, CSS3, Vanilla JavaScript
- Glassmorphism dark AI aesthetic
- Fully responsive (desktop, tablet, mobile)
- GitHub Pages deployment

## Project Structure

```
├── index.html          # Main landing page
├── css/styles.css      # Premium dark theme styles
├── js/main.js          # Interactions & API stubs
└── assets/logo.svg     # Brand logo
```

## Local Development

```bash
npx serve .
```

Then open `http://localhost:3000`

## API Integration (Future)

The `SmartHireAPI` object in `js/main.js` provides stub methods for backend integration:

- `analyzeResume(file)` — Resume upload & AI analysis
- `getJobs(filters)` — Job matching
- `getSkillGap(targetRole)` — Skill gap analysis
- `askMentor(message)` — AI career mentor chat

Connect these to your backend or Wix Velo serverless functions. **Never expose API keys on the frontend.**

## Brand Colors

| Token | Hex |
|-------|-----|
| Background | `#070A13`, `#0B1020` |
| Primary | `#8B5CF6` |
| Secondary | `#6366F1` |
| Accent | `#3B82F6` |
| Text | `#FFFFFF` |
| Muted | `#A1A1AA` |

## License

© 2026 SmartHire AI. All rights reserved.
