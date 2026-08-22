from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import os
import json
import uuid
from datetime import datetime
from supabase import create_client, Client
import google.generativeai as genai

app = FastAPI(title="Adaptive Handwriting Coach API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

supabase = None
if SUPABASE_URL and SUPABASE_KEY and not SUPABASE_KEY.startswith("fake"):
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)


class ScanResult(BaseModel):
    alignment: int
    spacing: int
    curves: int
    explanation_alignment: str
    explanation_spacing: str
    explanation_curves: str
    is_fallback: bool = False


class ScanResponse(BaseModel):
    id: str
    student_id: str
    image_url: str
    alignment: int
    spacing: int
    curves: int
    explanation_alignment: str
    explanation_spacing: str
    explanation_curves: str
    teacher_confirmed: bool
    created_at: str
    is_fallback: bool = False


class Student(BaseModel):
    id: str
    name: str
    classroom_id: str


class ScanOverride(BaseModel):
    alignment: Optional[int] = None
    spacing: Optional[int] = None
    curves: Optional[int] = None


FALLBACK_RESULT = ScanResult(
    alignment=72,
    spacing=68,
    curves=75,
    explanation_alignment="Writing sits mostly level with slight variation. Try keeping the baseline steady.",
    explanation_spacing="Letters are generally well-spaced. Watch for crowded spots between words.",
    explanation_curves="Curved letters are smooth. Focus on consistent roundness in 'o' and 'a'.",
    is_fallback=True,
)


def get_gemini_scores(image_bytes: bytes) -> ScanResult:
    model = genai.GenerativeModel("gemini-1.5-flash")
    prompt = """Analyze this handwriting worksheet image. Rate three skills from 0-100:
1. alignment: How level the writing sits on the line
2. spacing: Consistency of gaps between letters and words
3. curves: Smoothness of curved strokes

Return ONLY valid JSON with these exact keys:
{"alignment": 0-100, "spacing": 0-100, "curves": 0-100, "explanation_alignment": "brief plain language note", "explanation_spacing": "brief plain language note", "explanation_curves": "brief plain language note"}

Do not include any other text or markdown formatting."""

    try:
        response = model.generate_content(
            [prompt, {"mime_type": "image/jpeg", "data": image_bytes}],
            generation_config=genai.types.GenerationConfig(
                temperature=0.2,
                max_output_tokens=300,
            ),
        )
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        data = json.loads(text.strip())
        scores = ScanResult(
            alignment=max(0, min(100, int(data.get("alignment", 70)))),
            spacing=max(0, min(100, int(data.get("spacing", 70)))),
            curves=max(0, min(100, int(data.get("curves", 70)))),
            explanation_alignment=data.get("explanation_alignment", "Keep writing level on the line."),
            explanation_spacing=data.get("explanation_spacing", "Maintain even gaps between letters."),
            explanation_curves=data.get("explanation_curves", "Practice smooth rounded strokes."),
            is_fallback=False,
        )
        return scores
    except Exception:
        return FALLBACK_RESULT


@app.get("/api/students", response_model=List[Student])
async def get_students():
    if not supabase:
        return [
            {"id": "s0", "name": "Aarav K.", "classroom_id": "c1"},
            {"id": "s1", "name": "Sara M.", "classroom_id": "c1"},
            {"id": "s2", "name": "Diya P.", "classroom_id": "c1"},
            {"id": "s3", "name": "Kabir S.", "classroom_id": "c1"},
        ]
    result = supabase.table("students").select("*").execute()
    return result.data or []


@app.get("/api/students/{student_id}/scans", response_model=List[ScanResponse])
async def get_student_scans(student_id: str):
    if not supabase:
        return []
    result = (
        supabase.table("scans")
        .select("*")
        .eq("student_id", student_id)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data or []


@app.post("/api/scans", response_model=ScanResponse)
async def create_scan(student_id: str, file: UploadFile = File(...)):
    image_bytes = await file.read()
    file_ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"

    if supabase:
        storage_path = f"scans/{student_id}/{uuid.uuid4()}.{file_ext}"
        supabase.storage.from_("scans").upload(storage_path, image_bytes, {"content-type": file.content_type or "image/jpeg"})
        public_url = supabase.storage.from_("scans").get_public_url(storage_path)
    else:
        public_url = "http://example.com/placeholder.jpg"

    scores = get_gemini_scores(image_bytes) if GEMINI_API_KEY else FALLBACK_RESULT

    scan_data = {
        "id": str(uuid.uuid4()),
        "student_id": student_id,
        "image_url": public_url,
        "alignment": scores.alignment,
        "spacing": scores.spacing,
        "curves": scores.curves,
        "explanation_alignment": scores.explanation_alignment,
        "explanation_spacing": scores.explanation_spacing,
        "explanation_curves": scores.explanation_curves,
        "teacher_confirmed": False,
        "created_at": datetime.utcnow().isoformat(),
    }

    if supabase:
        result = supabase.table("scans").insert(scan_data).execute()
        row = result.data[0]
    else:
        row = scan_data

    return ScanResponse(**row, is_fallback=scores.is_fallback)


@app.patch("/api/scans/{scan_id}", response_model=ScanResponse)
async def override_scan(scan_id: str, override: ScanOverride):
    if not supabase:
        raise HTTPException(status_code=501, detail="Database not configured")
    updates = {}
    if override.alignment is not None:
        updates["alignment"] = override.alignment
    if override.spacing is not None:
        updates["spacing"] = override.spacing
    if override.curves is not None:
        updates["curves"] = override.curves
    if override.alignment is not None or override.spacing is not None or override.curves is not None:
        updates["teacher_confirmed"] = True

    result = supabase.table("scans").update(updates).eq("id", scan_id).execute()
    row = result.data[0]
    return ScanResponse(**row)


@app.get("/api/classes/{class_id}/heatmap")
async def get_class_heatmap(class_id: str):
    if not supabase:
        return []
    students_result = supabase.table("students").select("*").eq("classroom_id", class_id).execute()
    students = students_result.data or []

    heatmap = []
    for student in students:
        scans_result = (
            supabase.table("scans")
            .select("*")
            .eq("student_id", student["id"])
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        latest = scans_result.data[0] if scans_result.data else None
        heatmap.append(
            {
                "student_id": student["id"],
                "student_name": student["name"],
                "latest_scan": latest,
            }
        )
    return heatmap


@app.get("/api/worksheets/{skill}")
async def get_worksheet(skill: str):
    skill_urls = {
        "alignment": os.getenv("WORKSHEET_ALIGNMENT_URL", ""),
        "spacing": os.getenv("WORKSHEET_SPACING_URL", ""),
        "curves": os.getenv("WORKSHEET_CURVES_URL", ""),
    }
    url = skill_urls.get(skill.lower())
    if not url:
        raise HTTPException(status_code=404, detail="Worksheet not found")
    return {"url": url}


@app.get("/api/students/{student_id}/report")
async def get_student_report(student_id: str):
    if not supabase:
        return {"student_name": "Demo Student", "total_scans": 0, "latest_scores": {}, "scans": []}
    scans_result = (
        supabase.table("scans")
        .select("*")
        .eq("student_id", student_id)
        .order("created_at", desc=True)
        .execute()
    )
    scans = scans_result.data or []
    student_result = supabase.table("students").select("*").eq("id", student_id).execute()
    student = student_result.data[0] if student_result.data else {"name": "Unknown"}

    return {
        "student_name": student.get("name", "Unknown"),
        "total_scans": len(scans),
        "latest_scores": {
            "alignment": scans[0]["alignment"] if scans else None,
            "spacing": scans[0]["spacing"] if scans else None,
            "curves": scans[0]["curves"] if scans else None,
        },
        "scans": scans,
    }


@app.get("/api/health")
async def health():
    return {"status": "ok"}
