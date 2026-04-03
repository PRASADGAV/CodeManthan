from pydantic import BaseModel, Field
from typing import List, Optional


class QuizConfig(BaseModel):
    num_questions: int = Field(default=5, ge=1, le=20)
    difficulty: str = Field(default="medium", pattern="^(easy|medium|hard)$")
    quiz_type: str = Field(default="mcq", pattern="^(mcq|true_false|mixed)$")


class QuizQuestion(BaseModel):
    id: int
    question: str
    options: List[str]
    correctAnswer: str
    explanation: str


class GeneratedQuiz(BaseModel):
    title: str
    sourceSummary: str
    questions: List[QuizQuestion]


class EvaluateRequest(BaseModel):
    questions: List[QuizQuestion]
    userAnswers: dict  # { questionId: selectedAnswer }


class EvaluateResponse(BaseModel):
    totalQuestions: int
    correctCount: int
    accuracy: float
    results: list
