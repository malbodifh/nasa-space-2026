"""Astral Codes API — Mission Trainer (trivia de astronauta junior)."""

from __future__ import annotations

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from app import quiz

APP_VERSION = "0.2.0"
STATIC_DIR = quiz.BASE_DIR / "src" / "backend" / "static"

app = FastAPI(
    title="Astral Codes API",
    description="Mission Trainer: trivia educativa con datos de NASA.",
    version=APP_VERSION,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnswerIn(BaseModel):
    id: str
    choice: int = Field(ge=0, le=3)


@app.get("/api/health")
def health() -> dict:
    return {
        "status": "ok",
        "service": "mission-trainer",
        "version": APP_VERSION,
        "questions": len(quiz.load_questions()),
    }


@app.get("/api/categories")
def categories() -> dict:
    return {"categories": quiz.categories(quiz.load_questions())}


@app.get("/api/quiz")
def get_quiz(n: int = Query(default=10, ge=1, le=32), category: str | None = None) -> dict:
    questions = quiz.load_questions()
    if category and category not in quiz.CATEGORY_LABELS:
        raise HTTPException(status_code=404, detail="Categoría desconocida")
    picked = quiz.pick_quiz(questions, n=n, category=category)
    return {"questions": [quiz.public_view(q) for q in picked], "total": len(picked)}


@app.post("/api/answer")
def answer(payload: AnswerIn) -> dict:
    questions = {q["id"]: q for q in quiz.load_questions()}
    question = questions.get(payload.id)
    if question is None:
        raise HTTPException(status_code=404, detail="Pregunta desconocida")
    return quiz.check_answer(question, payload.choice)


@app.get("/api/questions")
def all_questions() -> dict:
    """Banco completo, para debug y validación."""
    return {"questions": quiz.load_questions()}


if STATIC_DIR.is_dir():
    app.mount("/", StaticFiles(directory=str(STATIC_DIR), html=True), name="static")
