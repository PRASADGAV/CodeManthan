/**
 * PDF Quiz API Service
 * Communicates with the FastAPI backend for PDF-to-quiz generation.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Upload a PDF and generate a quiz.
 * @param {File} file - The PDF file
 * @param {object} config - { numQuestions, difficulty, quizType }
 * @returns {Promise<object>} Generated quiz JSON
 */
export async function generateQuizFromPdf(file, config = {}) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('num_questions', config.numQuestions || 5);
  formData.append('difficulty', config.difficulty || 'medium');
  formData.append('quiz_type', config.quizType || 'mcq');

  const res = await fetch(`${API_BASE}/quiz/from-pdf`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Server error' }));
    throw new Error(err.detail || `Server returned ${res.status}`);
  }

  return res.json();
}

/**
 * Evaluate quiz answers on the server (optional, for future use).
 * @param {Array} questions - Quiz questions
 * @param {object} userAnswers - { questionId: selectedAnswer }
 * @returns {Promise<object>} Evaluation result
 */
export async function evaluateQuiz(questions, userAnswers) {
  const res = await fetch(`${API_BASE}/quiz/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ questions, userAnswers }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Evaluation failed' }));
    throw new Error(err.detail || `Server returned ${res.status}`);
  }

  return res.json();
}
