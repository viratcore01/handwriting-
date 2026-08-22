# Adaptive Handwriting Coach — MVP

**Phone-camera photo → Gemini Vision scores → practice worksheets → progress tracking.**

A pragmatic, production-ready MVP for scoring handwriting worksheets and generating matched practice sheets. Built for speed, reliability, and deployability.

---

## What It Does

1. **Select a student** from a seeded demo class
2. **Take a photo** of a completed paper worksheet using the phone camera
3. **Get 3 scores instantly** — Alignment, Spacing, Curves — with plain-language explanations
4. **Download a practice PDF** targeted at the weakest skill
5. **Track progress** over time with charts
6. **Teacher override** scores on any scan
7. **Class heatmap** view for teachers

---

## Tech Stack & Why

| Layer | Choice | Why This One | Why Not Others |
|-------|--------|--------------|----------------|
| **Frontend** | React + Vite + Tailwind | Fastest local dev, zero-config HMR, smallest bundle for MVP | Next.js adds server complexity we don’t need; plain HTML/JS would require rebuilding UI from scratch |
| **Routing** | React Router v6 | Client-side routing fits a single-page app with no SSR needs | Next.js file routing would force a framework migration for no MVP benefit |
| **Styling** | Tailwind CSS | Utility-first, consistent design tokens, no custom CSS architecture | CSS Modules would duplicate design tokens; styled-components adds runtime cost |
| **Charts** | Recharts | Declarative, works with React, no extra config | Chart.js would work but needs manual React binding; D3 is overkill for 3 line charts |
| **Backend** | FastAPI (Python) | Auto-generated docs, Pydantic validation, native async, fastest Python API framework | Flask needs manual validation; Django is too heavy; Express requires more boilerplate |
| **AI / Vision** | Google Gemini 1.5 Flash | Best-in-class image understanding, zero custom CV code, single API call | OpenCV/NumPy pipelines add 1000+ lines and still need scoring logic; ML Kit requires native setup |
| **Database** | Supabase (PostgreSQL) | Instant REST API, auth-ready, generous free tier, built-in Storage | Firebase would require Firestore data modeling; MongoDB needs a separate backend service |
| **Storage** | Supabase Storage | Same auth context as DB, public/private buckets, CDN-backed | S3 requires IAM config; Cloudflare R2 needs separate auth |
| **Deploy** | Vercel monorepo | Single repo, frontend + backend in one place, automatic previews | Render for backend + Vercel for frontend works but splits config and env management |
| **AI Client** | Direct `httpx` REST calls | Avoids `grpcio` compile failures on Vercel’s Alpine Linux; `httpx` is already a transitive dependency | `google-generativeai` SDK depends on `grpcio` which fails on Vercel’s build image |

### Key Architectural Decision: No Custom Computer Vision

**We intentionally do not use:** OpenCV, NumPy kinematics, HTML5 canvas tracing, or ML Kit.

**Why:** Gemini Vision replaces an entire CV pipeline with one API call. A custom CV stack would require:
- Image preprocessing (thresholding, deskewing)
- Stroke extraction and resampling
- DTW/knn scoring heuristics
- Hundreds of lines of brittle math

Gemini gives us explainable 0-100 scores in a single round-trip, with plain-language explanations. For an MVP, this is strictly better: less code, faster iteration, and surprisingly accurate “vibes” scoring.

---

## Project Structure

```
handwriting-coach/
├── backend/
│   ├── main.py              # FastAPI app (1 file, 7 endpoints)
│   ├── requirements.txt     # Pinned deps, no grpcio
│   ├── .env.example         # Template for local setup
│   └── .python-version      # Python 3.12 for Vercel
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Router + API base
│   │   ├── index.css        # Tailwind + design tokens
│   │   └── pages/
│   │       ├── Welcome.jsx          # Role selector
│   │       ├── StudentHome.jsx      # Student dashboard
│   │       ├── Scan.jsx             # Camera capture + upload
│   │       ├── Results.jsx          # 3 skill bars + recommendations
│   │       ├── Practice.jsx         # PDF worksheet viewer
│   │       ├── Progress.jsx         # Recharts line chart
│   │       ├── TeacherDashboard.jsx # Class heatmap
│   │       └── StudentProfile.jsx   # Score override
│   ├── package.json
│   ├── vite.config.js       # Dev proxy to backend
│   └── tailwind.config.js   # Design system
├── supabase-schema.sql      # Tables + seed data + RLS
├── vercel.json              # Monorepo routing
└── README.md
```

---

## What We Built (Exact Status)

| Component | Status |
|-----------|--------|
| FastAPI backend (7 endpoints) | ✅ Running locally on `:8000` |
| React frontend (8 routes) | ✅ Built and served on `:3000` |
| Supabase schema + 4 demo students | ✅ `supabase-schema.sql` ready to run |
| Demo mode (no env vars) | ✅ Backend returns fallback scores |
| Gemini REST API integration | ✅ Direct `httpx` calls, no SDK |
| Teacher heatmap + override | ✅ Implemented |
| Progress charts (Recharts) | ✅ Implemented |
| Vercel monorepo config | ✅ `vercel.json` pushed |
| Static worksheet endpoint | ✅ Ready for PDF URLs |
| CORS + multipart uploads | ✅ Working |

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/students` | List all students |
| `GET` | `/api/students/{id}/scans` | Scan history for student |
| `POST` | `/api/scans?student_id={id}` | Upload image, call Gemini, save scan |
| `PATCH` | `/api/scans/{id}` | Teacher override scores |
| `GET` | `/api/classes/{id}/heatmap` | Class heatmap with latest scans |
| `GET` | `/api/worksheets/{skill}` | Get static worksheet PDF URL |
| `GET` | `/api/health` | Health check |

---

## Local Setup

### 1. Clone
```bash
git clone https://github.com/viratcore01/handwriting-.git
cd handwriting-coach
```

### 2. Backend
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
# Add your GEMINI_API_KEY to .env
uvicorn main:app --reload --port 8000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000` and proxies `/api` → `http://localhost:8000`.

### 4. Supabase (optional for full data)
1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase-schema.sql` in SQL Editor
3. Create `scans` and `worksheets` public buckets
4. Upload 3 PDFs to `worksheets`
5. Add env vars to `backend/.env`

---

## Environment Variables

### Backend (.env)
| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google Gemini API key |
| `SUPABASE_URL` | No | Supabase project URL (app runs without it) |
| `SUPABASE_KEY` | No | Supabase anon key |
| `WORKSHEET_ALIGNMENT_URL` | No | Public URL for alignment PDF |
| `WORKSHEET_SPACING_URL` | No | Public URL for spacing PDF |
| `WORKSHEET_CURVES_URL` | No | Public URL for curves PDF |

**Note:** The backend runs in demo mode without Supabase credentials. It returns hardcoded fallback scores and demo student data.

---

## Deploy

### Vercel (Monorepo)
1. Connect repo to Vercel
2. Vercel auto-detects `vercel.json`:
   - `/api/*` → FastAPI backend (Python 3.12)
   - `/*` → Vite frontend
3. Add environment variables in Vercel dashboard for the backend service:
   - `GEMINI_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `WORKSHEET_ALIGNMENT_URL`
   - `WORKSHEET_SPACING_URL`
   - `WORKSHEET_CURVES_URL`

### Alternative: Render (Backend) + Vercel (Frontend)
If Vercel monorepo has issues, deploy backend to Render:
- **Build command:** `pip install -r requirements.txt`
- **Start command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Update `frontend/src/App.jsx` to point `API_BASE` to the Render URL

---

## What’s Out of Scope (MVP)

Per the MVP Audit, we explicitly excluded:
- Live tablet tracing / HTML5 canvas kinematics
- OpenCV / NumPy custom CV pipelines
- Google ML Kit
- Arcade games
- Real authentication (hardcoded role selector instead)
- Dynamic worksheet generation (static PDFs instead)

---

## License

MIT
