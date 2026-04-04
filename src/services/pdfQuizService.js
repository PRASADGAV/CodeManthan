/**
 * PDF Quiz Service — Direct Gemini API (no Python backend needed)
 * Extracts text from PDF in browser using pdf.js, then calls Gemini REST API.
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

/**
 * Extract text from a PDF file using the browser's PDF.js (via pdf-lib-like approach).
 * Uses FileReader + a lightweight text extraction approach.
 */
async function extractTextFromPdf(file) {
  // Dynamically import pdfjs-dist
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const textParts = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => item.str).join(' ');
    if (pageText.trim()) textParts.push(pageText);
  }

  return textParts.join('\n\n');
}

/**
 * Build the quiz generation prompt
 */
function buildPrompt(text, config) {
  const difficultyGuide = {
    easy: 'basic recall and simple understanding',
    medium: 'application and analysis of concepts',
    hard: 'critical thinking, edge cases, and deep reasoning',
  };

  const quizTypeGuide = {
    mcq: 'multiple choice questions with exactly 4 options each',
    true_false: "true/false questions (use ['True', 'False', 'True', 'False'] as options)",
    mixed: 'a mix of multiple choice and true/false questions',
  };

  // Limit text to ~10000 chars to stay within token limits
  const trimmedText = text.length > 10000 ? text.substring(0, 10000) : text;

  return `You are a precise quiz generator. Generate a quiz ONLY from the provided document text below.

STRICT RULES:
1. Generate exactly ${config.numQuestions || 5} questions.
2. Difficulty level: ${config.difficulty || 'medium'} — focus on ${difficultyGuide[config.difficulty] || difficultyGuide.medium}.
3. Question type: ${quizTypeGuide[config.quizType] || quizTypeGuide.mcq}.
4. Every question MUST have exactly 4 options labeled as text (not A/B/C/D).
5. The correctAnswer field must exactly match one of the options strings.
6. Include a short explanation (1-2 sentences) for each correct answer.
7. Questions must come ONLY from the document text. Do NOT use outside knowledge.
8. Do NOT hallucinate facts not present in the document.
9. Return ONLY valid JSON. No markdown fences, no extra text.

REQUIRED JSON FORMAT:
{
  "title": "Quiz based on [document topic]",
  "sourceSummary": "Brief 1-2 sentence summary of the document",
  "questions": [
    {
      "id": 1,
      "question": "Question text here?",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": "Option 1",
      "explanation": "Brief explanation of why this is correct."
    }
  ]
}

DOCUMENT TEXT:
${trimmedText}

Generate the quiz now. Return ONLY the JSON object:`;
}

/**
 * Parse and validate the LLM response
 */
function parseLLMResponse(responseText) {
  let cleaned = responseText.trim();
  // Strip markdown fences (```json ... ``` or ``` ... ```)
  cleaned = cleaned.replace(/^```(?:json)?\s*/g, '').replace(/\s*```$/g, '').trim();

  // Remove trailing commas before ] or } (common LLM mistake)
  function removeTrailingCommas(str) {
    return str.replace(/,\s*([\]}])/g, '$1');
  }

  let data;
  try {
    data = JSON.parse(cleaned);
  } catch {
    // Try after removing trailing commas
    try {
      data = JSON.parse(removeTrailingCommas(cleaned));
    } catch {
      // Try extracting the JSON object from the response
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          data = JSON.parse(match[0]);
        } catch {
          data = JSON.parse(removeTrailingCommas(match[0]));
        }
      } else {
        throw new Error('AI response is not valid JSON. Please try again.');
      }
    }
  }

  if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
    throw new Error('No questions generated');
  }

  // Validate & fix each question
  data.questions.forEach((q, i) => {
    q.id = i + 1;
    const required = ['question', 'options', 'correctAnswer', 'explanation'];
    for (const field of required) {
      if (!q[field]) throw new Error(`Question ${i + 1} missing '${field}'`);
    }
    if (q.options.length !== 4) throw new Error(`Question ${i + 1} must have 4 options`);
    if (!q.options.includes(q.correctAnswer)) q.correctAnswer = q.options[0];
  });

  data.title = data.title || 'Generated Quiz';
  data.sourceSummary = data.sourceSummary || 'Quiz generated from uploaded document.';

  return data;
}

/**
 * Upload a PDF and generate a quiz — all in the browser.
 * @param {File} file - The PDF file
 * @param {object} config - { numQuestions, difficulty, quizType }
 * @returns {Promise<object>} Generated quiz JSON
 */
export async function generateQuizFromPdf(file, config = {}) {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured. Add VITE_GEMINI_API_KEY to your .env file.');
  }

  // Step 1: Extract text from PDF in browser
  const text = await extractTextFromPdf(file);

  if (!text || text.trim().length < 100) {
    throw new Error('Could not extract enough text from the PDF. It may be scanned or image-based.');
  }

  // Step 2: Call Gemini API directly (with delay for rate limits)
  const prompt = buildPrompt(text, config);

  await new Promise(resolve => setTimeout(resolve, 1000));

  const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 4096,
      },
    }),
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Gemini API Free Tier Limit Reached (15 requests/min). Please wait 60 seconds and try again!');
    }
    const errData = await response.json().catch(() => ({}));
    const errMsg = errData?.error?.message || `Gemini API error (${response.status})`;
    throw new Error(errMsg);
  }

  const result = await response.json();

  // Extract text from response
  const responseText = result?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!responseText) {
    throw new Error('Empty response from AI. Please try again.');
  }

  // Step 3: Parse and validate
  return parseLLMResponse(responseText);
}

/**
 * Evaluate quiz answers (client-side — no backend needed)
 */
export function evaluateQuiz(questions, userAnswers) {
  let correctCount = 0;
  const results = questions.map((q) => {
    const userAnswer = userAnswers[String(q.id)] || '';
    const isCorrect = userAnswer === q.correctAnswer;
    if (isCorrect) correctCount++;
    return {
      questionId: q.id,
      question: q.question,
      userAnswer,
      correctAnswer: q.correctAnswer,
      isCorrect,
      explanation: q.explanation,
    };
  });

  return {
    totalQuestions: questions.length,
    correctCount,
    accuracy: questions.length > 0 ? Math.round((correctCount / questions.length) * 100 * 10) / 10 : 0,
    results,
  };
}
