"""
Quiz generation service using Google Gemini API (REST).
Sends PDF text + config to the LLM and parses structured JSON output.
"""
import os
import json
import re
import httpx
from models.schemas import QuizConfig


GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"


def build_prompt(text: str, config: QuizConfig) -> str:
    """Build the LLM prompt for quiz generation."""
    difficulty_guide = {
        "easy": "basic recall and simple understanding",
        "medium": "application and analysis of concepts",
        "hard": "critical thinking, edge cases, and deep reasoning",
    }

    quiz_type_guide = {
        "mcq": "multiple choice questions with exactly 4 options each",
        "true_false": "true/false questions (use ['True', 'False', 'True', 'False'] as options)",
        "mixed": "a mix of multiple choice and true/false questions",
    }

    return f"""You are a precise quiz generator. Generate a quiz ONLY from the provided document text below.

STRICT RULES:
1. Generate exactly {config.num_questions} questions.
2. Difficulty level: {config.difficulty} — focus on {difficulty_guide[config.difficulty]}.
3. Question type: {quiz_type_guide[config.quiz_type]}.
4. Every question MUST have exactly 4 options labeled as text (not A/B/C/D).
5. The correctAnswer field must exactly match one of the options strings.
6. Include a short explanation (1-2 sentences) for each correct answer.
7. Questions must come ONLY from the document text. Do NOT use outside knowledge.
8. Do NOT hallucinate facts not present in the document.
9. Return ONLY valid JSON. No markdown fences, no extra text.

REQUIRED JSON FORMAT:
{{
  "title": "Quiz based on [document topic]",
  "sourceSummary": "Brief 1-2 sentence summary of the document",
  "questions": [
    {{
      "id": 1,
      "question": "Question text here?",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": "Option 1",
      "explanation": "Brief explanation of why this is correct."
    }}
  ]
}}

DOCUMENT TEXT:
{text}

Generate the quiz now. Return ONLY the JSON object:"""


def parse_llm_response(response_text: str) -> dict:
    """Parse and validate the LLM response as JSON."""
    cleaned = response_text.strip()
    cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
    cleaned = re.sub(r"\s*```$", "", cleaned)
    cleaned = cleaned.strip()

    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError:
        match = re.search(r"\{[\s\S]*\}", cleaned)
        if match:
            data = json.loads(match.group())
        else:
            raise ValueError("LLM response is not valid JSON")

    if "questions" not in data:
        raise ValueError("Response missing 'questions' field")

    if not isinstance(data["questions"], list) or len(data["questions"]) == 0:
        raise ValueError("No questions generated")

    for i, q in enumerate(data["questions"]):
        q["id"] = i + 1
        required = ["question", "options", "correctAnswer", "explanation"]
        for field in required:
            if field not in q:
                raise ValueError(f"Question {i+1} missing '{field}'")
        if len(q["options"]) != 4:
            raise ValueError(f"Question {i+1} must have exactly 4 options")
        if q["correctAnswer"] not in q["options"]:
            q["correctAnswer"] = q["options"][0]

    data.setdefault("title", "Generated Quiz")
    data.setdefault("sourceSummary", "Quiz generated from uploaded document.")

    return data


def generate_quiz(text: str, config: QuizConfig) -> dict:
    """Main function: takes PDF text + config, returns structured quiz JSON via Gemini REST API."""
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is not set in .env file")

    prompt = build_prompt(text, config)

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.4,
            "maxOutputTokens": 4096,
        }
    }

    url = f"{GEMINI_URL}?key={GEMINI_API_KEY}"

    with httpx.Client(timeout=120.0) as client:
        response = client.post(url, json=payload)

    if response.status_code != 200:
        error_detail = response.text
        try:
            error_json = response.json()
            error_detail = error_json.get("error", {}).get("message", response.text)
        except Exception:
            pass
        raise ValueError(f"{response.status_code} {error_detail}")

    result = response.json()

    # Extract text from Gemini response
    try:
        text_content = result["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError):
        raise ValueError("Empty or malformed response from Gemini API")

    return parse_llm_response(text_content)
