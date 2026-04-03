"""
API routes for PDF quiz generation and evaluation.
"""
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from services.pdf_parser import extract_text_from_pdf, chunk_text
from services.quiz_generator import generate_quiz
from models.schemas import QuizConfig, EvaluateRequest, EvaluateResponse

router = APIRouter(prefix="/quiz", tags=["Quiz"])

# Max file size: 10 MB
MAX_FILE_SIZE = 10 * 1024 * 1024


@router.post("/from-pdf")
async def generate_quiz_from_pdf(
    file: UploadFile = File(...),
    num_questions: int = Form(default=5),
    difficulty: str = Form(default="medium"),
    quiz_type: str = Form(default="mcq"),
):
    """Upload a PDF and generate a quiz from its content."""

    # Validate file type
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    if file.content_type and file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Invalid file type. Upload a PDF.")

    # Read and validate size
    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Max size is 10 MB.")

    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # Extract text
    try:
        text = extract_text_from_pdf(file_bytes)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to extract text from PDF: {str(e)}")

    if not text or len(text.strip()) < 100:
        raise HTTPException(
            status_code=422,
            detail="Could not extract enough text from the PDF. It may be scanned or image-based.",
        )

    # Chunk if too large — use the first chunk for quiz generation
    chunks = chunk_text(text, max_chars=12000)
    quiz_text = chunks[0]  # Use first substantial chunk

    # Build config
    config = QuizConfig(
        num_questions=min(num_questions, 20),
        difficulty=difficulty,
        quiz_type=quiz_type,
    )

    # Generate quiz
    try:
        quiz_data = generate_quiz(quiz_text, config)
    except ValueError as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Quiz generation failed: {str(e)}")
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")

    return quiz_data


@router.post("/evaluate", response_model=EvaluateResponse)
async def evaluate_quiz(request: EvaluateRequest):
    """Evaluate user answers against correct answers (server-side scoring)."""
    results = []
    correct_count = 0

    for q in request.questions:
        user_answer = request.userAnswers.get(str(q.id), "")
        is_correct = user_answer == q.correctAnswer
        if is_correct:
            correct_count += 1

        results.append({
            "questionId": q.id,
            "question": q.question,
            "userAnswer": user_answer,
            "correctAnswer": q.correctAnswer,
            "isCorrect": is_correct,
            "explanation": q.explanation,
        })

    total = len(request.questions)
    return EvaluateResponse(
        totalQuestions=total,
        correctCount=correct_count,
        accuracy=round((correct_count / total) * 100, 1) if total > 0 else 0,
        results=results,
    )
