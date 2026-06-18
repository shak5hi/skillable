"""
ai_services/resume_service/main.py
FastAPI microservice for resume analysis and improvement recommendations.
"""
from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import re
import io

app = FastAPI(title="SkillAble Resume Analysis Service")


class Suggestion(BaseModel):
    category: str     # "skills" | "formatting" | "experience" | "keywords"
    suggestion: str
    priority: str     # "high" | "medium" | "low"


class AnalysisResponse(BaseModel):
    score: float
    missing_skills: List[str]
    suggestions: List[Suggestion]
    role_compatibility: Dict[str, Any]
    improved_resume_text: str


# ---- Common tech skill corpus (extend with real NLP in production) ----

TECH_SKILLS = {
    "python", "django", "react", "javascript", "sql", "postgresql", "docker",
    "kubernetes", "aws", "git", "rest api", "machine learning", "communication",
    "teamwork", "leadership", "problem solving", "data analysis",
}


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Use pdfplumber or PyMuPDF in production."""
    try:
        import pdfplumber
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            return "\n".join(p.extract_text() or "" for p in pdf.pages)
    except Exception:
        return ""


def extract_text_from_docx(file_bytes: bytes) -> str:
    """Use python-docx in production."""
    try:
        from docx import Document
        doc = Document(io.BytesIO(file_bytes))
        return "\n".join(p.text for p in doc.paragraphs)
    except Exception:
        return ""


def analyse_resume(text: str) -> AnalysisResponse:
    text_lower = text.lower()
    found_skills = {s for s in TECH_SKILLS if s in text_lower}
    missing = list(TECH_SKILLS - found_skills)[:8]

    suggestions = []
    if len(text.split()) < 200:
        suggestions.append(Suggestion(category="content", suggestion="Resume is too short. Aim for at least 400 words.", priority="high"))
    if "objective" not in text_lower and "summary" not in text_lower:
        suggestions.append(Suggestion(category="formatting", suggestion="Add a professional summary at the top.", priority="high"))
    if not re.search(r"\b(19|20)\d{2}\b", text):
        suggestions.append(Suggestion(category="experience", suggestion="Include years for your work experience entries.", priority="medium"))
    if len(found_skills) < 5:
        suggestions.append(Suggestion(category="skills", suggestion=f"Add more skills. Missing: {', '.join(missing[:3])}.", priority="high"))

    score = min(100.0, round(30.0 + len(found_skills) * 6 + (len(text.split()) / 10), 1))

    # Naive role compatibility check
    roles = {
        "Software Engineer": sum(1 for s in ["python", "django", "react", "git"] if s in text_lower) / 4,
        "Data Analyst": sum(1 for s in ["sql", "data analysis", "python"] if s in text_lower) / 3,
        "Product Manager": sum(1 for s in ["leadership", "communication", "teamwork"] if s in text_lower) / 3,
    }
    best_role = max(roles, key=roles.get)
    role_compatibility = {"role": best_role, "score": round(roles[best_role], 2), "all": roles}

    improved = text + "\n\n[AI Suggestion: Consider restructuring with clear sections: Summary, Skills, Experience, Education.]"

    return AnalysisResponse(
        score=score,
        missing_skills=missing,
        suggestions=suggestions,
        role_compatibility=role_compatibility,
        improved_resume_text=improved,
    )


@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_resume(resume: UploadFile = File(...)):
    content = await resume.read()
    if not content:
        raise HTTPException(status_code=400, detail="Empty file.")

    name = resume.filename.lower()
    if name.endswith(".pdf"):
        text = extract_text_from_pdf(content)
    elif name.endswith((".doc", ".docx")):
        text = extract_text_from_docx(content)
    else:
        raise HTTPException(status_code=422, detail="Unsupported file type. Upload PDF or Word document.")

    if not text.strip():
        raise HTTPException(status_code=422, detail="Could not extract text from the resume.")

    return analyse_resume(text)


@app.get("/health")
def health():
    return {"status": "ok"}
