# Adaptive Handwriting Coach — MVP

Phone-camera photo → Gemini Vision scores → practice worksheets → progress tracking.

## Stack
- **Frontend:** React + Vite + Tailwind + React Router + Recharts
- **Backend:** FastAPI (Python)
- **Database / Storage:** Supabase (PostgreSQL + Storage)
- **AI:** Google Gemini 1.5 Flash

## Local Setup

### 1. Supabase
1. Create a project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** and run `supabase-schema.sql`.
3. Create two public storage buckets: `scans` and `worksheets`.
4. Upload 3 static PDFs into `worksheets` (alignment.pdf, spacing.pdf, curves.pdf).
5. Copy your **Project URL** and **anon key** from Settings → API.

### 2. Backend
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
# Edit .env with your Supabase URL, key, and Gemini API key
uvicorn main:app --reload --port 8000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000` and proxies `/api` to `http://localhost:8000`.

## Environment Variables

### Backend (.env)
| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_KEY` | Supabase anon/public key |
| `GEMINI_API_KEY` | Google Gemini API key |
| `WORKSHEET_ALIGNMENT_URL` | Public URL for alignment PDF |
| `WORKSHEET_SPACING_URL` | Public URL for spacing PDF |
| `WORKSHEET_CURVES_URL` | Public URL for curves PDF |

## API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/students` | List all students |
| GET | `/api/students/{id}/scans` | Scan history for student |
| POST | `/api/scans?student_id={id}` | Upload image, get Gemini scores |
| PATCH | `/api/scans/{id}` | Teacher override scores |
| GET | `/api/classes/{id}/heatmap` | Class heatmap data |
| GET | `/api/worksheets/{skill}` | Get worksheet PDF URL |
| GET | `/api/health` | Health check |

## Deploy
- **Backend:** Deploy `backend/` to Render (Python service, build command: `pip install -r requirements.txt`, start: `uvicorn main:app --host 0.0.0.0 --port $PORT`)
- **Frontend:** Deploy `frontend/` to Vercel
