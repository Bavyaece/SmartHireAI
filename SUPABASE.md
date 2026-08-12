# Create Supabase for SmartHire AI

## 1. Create the project (2 minutes)

1. Open **[https://supabase.com/dashboard](https://supabase.com/dashboard)**
2. Sign in with **GitHub**
3. Click **New project**
4. Settings:
   - **Name:** `SmartHireAI`
   - **Database password:** save it somewhere safe
   - **Region:** closest to you (e.g. Mumbai / Singapore)
5. Click **Create new project** → wait until it’s ready

## 2. Copy API keys

1. Go to **Project Settings** (gear) → **API**
2. Copy:
   - **Project URL** → `https://xxxxx.supabase.co`
   - **anon public** key

## 3. Paste keys into the app

Open `js/supabase-config.js` and fill:

```js
window.SMART_HIRE_SUPABASE = {
  url: 'https://YOUR_PROJECT_ID.supabase.co',
  anonKey: 'YOUR_ANON_KEY'
};
```

## 4. Create database tables

1. In Supabase → **SQL Editor** → **New query**
2. Paste everything from `supabase/schema.sql`
3. Click **Run**

## 5. Enable Google login (optional)

1. Supabase → **Authentication** → **Providers** → **Google**
2. Enable Google and add Client ID / Secret from Google Cloud Console
3. Add redirect URL:
   - `http://localhost:8000`
   - your Vercel / GitHub Pages URL

Also under **Authentication → URL Configuration**, set Site URL to your live site.

## 6. Disable email confirm (for quick testing)

**Authentication → Providers → Email** → turn off **Confirm email**  
(so Sign Up works immediately without inbox)

## 7. Test

```bash
start.bat
```

Open http://localhost:8000 → **Get Started** → create account.

---

## What Supabase stores

| Table | Purpose |
|-------|---------|
| `profiles` | User name / email / target role |
| `resume_analyses` | Saved resume analysis history |
| `saved_jobs` | Jobs the user saved |
| `mentor_messages` | Optional chat history |

Auth (login / signup / Google) is handled by Supabase Auth.
PDF analysis still runs on your FastAPI backend.
