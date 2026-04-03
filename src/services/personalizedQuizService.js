/**
 * Personalized onboarding quiz — domains (Engineering, Commerce, Medical) + user keywords.
 * Uses Gemini when VITE_GEMINI_API_KEY is set; otherwise a built-in fallback bank.
 */

import quizData from '../data/quizData.js';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const LIBRARY_SUBJECT_NAMES = Object.keys(quizData);

export const STUDY_DOMAIN_OPTIONS = [
  { id: 'engineering', label: 'Engineering', emoji: '⚙️', hint: 'STEM, tech, mechanics, coding mindset' },
  { id: 'commerce', label: 'Commerce', emoji: '📊', hint: 'Business, finance, accounting, economics' },
  { id: 'medical', label: 'Medical', emoji: '🩺', hint: 'Health, biology, clinical reasoning' },
];

export function domainIdToLabel(id) {
  return STUDY_DOMAIN_OPTIONS.find((d) => d.id === id)?.label || id;
}

function stripJsonFence(text) {
  let t = text.trim();
  t = t.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  return t;
}

function parseGeminiJson(text) {
  const cleaned = stripJsonFence(text);
  let data;
  try {
    data = JSON.parse(cleaned);
  } catch {
    const m = cleaned.match(/\{[\s\S]*\}/);
    if (m) data = JSON.parse(m[0]);
    else throw new Error('Invalid JSON from AI');
  }
  return data;
}

function normalizeQuestions(rawList, domainLabels) {
  return rawList.map((q, i) => {
    let opts = Array.isArray(q.options) ? [...q.options] : [];
    if (opts.length !== 4) {
      throw new Error(`Question ${i + 1} must have exactly 4 options`);
    }
    let correct = q.correct;
    if (correct === undefined && q.correctAnswer !== undefined) {
      const idx = opts.findIndex((o) => o === q.correctAnswer);
      correct = idx >= 0 ? idx : 0;
    }
    if (typeof correct !== 'number' || correct < 0 || correct > 3) correct = 0;

    let domain = q.domain || q.Domain || domainLabels[0];
    if (typeof domain === 'string') {
      const match = domainLabels.find((l) => l.toLowerCase() === domain.toLowerCase());
      domain = match || domainLabels[i % domainLabels.length];
    } else {
      domain = domainLabels[i % domainLabels.length];
    }

    return {
      id: q.id || `pq-${i + 1}`,
      domain,
      question: String(q.question || '').trim(),
      options: opts.map((o) => String(o)),
      correct,
      explanation: String(q.explanation || 'Review this concept and try similar questions.'),
      difficulty: q.difficulty || 'medium',
    };
  });
}

/**
 * @param {{ domainIds: string[], keywords: string }} config
 * @returns {Promise<{ questions: object[], source: 'gemini'|'fallback' }>}
 */
export async function generatePersonalizedQuizQuestions(config) {
  const { domainIds, keywords } = config;
  const domainLabels = domainIds.map(domainIdToLabel).filter(Boolean);
  if (domainLabels.length === 0) {
    throw new Error('Select at least one domain');
  }

  const kw = (keywords || '').trim() || 'general aptitude and reasoning';

  if (GEMINI_API_KEY) {
    try {
      const prompt = `You create educational multiple-choice quizzes.

STUDENT CONTEXT:
- Domains to cover (spread questions evenly): ${domainLabels.join(', ')}.
- Student interests / keywords (use to shape scenarios and wording): ${kw}

RULES:
1. Generate exactly 10 questions.
2. Each question belongs to exactly ONE of these domains: ${domainLabels.join(', ')}. Use the "domain" field with the exact label string.
3. Questions should be logical / conceptual — avoid rote trivia; prefer reasoning suitable for competitive exams and university prep.
4. Four options each; "correct" is the zero-based index 0–3 of the correct option.
5. Return ONLY valid JSON (no markdown), shape:
{"questions":[{"domain":"${domainLabels[0]}","question":"...","options":["","","",""],"correct":0,"explanation":"..."}]}

Generate all 10 questions now.`;

      const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.45, maxOutputTokens: 8192 },
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error?.message || `Gemini error ${response.status}`);
      }

      const result = await response.json();
      const responseText = result?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!responseText) throw new Error('Empty AI response');

      const data = parseGeminiJson(responseText);
      if (!data.questions || !Array.isArray(data.questions) || data.questions.length < 8) {
        throw new Error('AI returned too few questions');
      }

      const questions = normalizeQuestions(data.questions.slice(0, 10), domainLabels);
      return { questions, source: 'gemini' };
    } catch (e) {
      console.warn('Gemini personalized quiz failed, using fallback:', e);
    }
  }

  return { questions: buildFallbackQuiz(domainLabels, kw), source: 'fallback' };
}

function buildFallbackQuiz(domainLabels, keywords) {
  let pool = [...FALLBACK_QUESTIONS, ...FALLBACK_GENERIC].filter((q) => domainLabels.includes(q.domain));
  if (pool.length === 0) {
    pool = [...FALLBACK_QUESTIONS, ...FALLBACK_GENERIC];
  }
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const picked = [];
  for (let i = 0; i < 10; i++) {
    const base = { ...shuffled[i % shuffled.length] };
    base.id = `fb-${i + 1}`;
    base.domain = domainLabels[i % domainLabels.length];
    if (keywords && keywords.length > 2) {
      base.question = `${base.question} (Your focus: ${keywords.slice(0, 80)}.)`;
    }
    picked.push(base);
  }
  return picked;
}

const FALLBACK_GENERIC = [
  {
    domain: 'Engineering',
    question: 'When comparing two design choices, what should you weigh first when safety is involved?',
    options: ['Only cost', 'Risk and failure modes', 'Only speed of delivery', 'Only aesthetics'],
    correct: 1,
    explanation: 'Engineering judgment prioritizes safety and understanding failure modes before optimizing cost or speed.',
  },
  {
    domain: 'Commerce',
    question: 'What does a budget mainly help an individual or business do?',
    options: ['Avoid all expenses', 'Plan income against priorities', 'Ignore cash flow', 'Eliminate taxes'],
    correct: 1,
    explanation: 'Budgets align spending and saving with priorities.',
  },
  {
    domain: 'Medical',
    question: 'Patient autonomy in ethics primarily means:',
    options: ['Doctor decides everything', 'Respecting informed patient choices', 'Ignoring consent', 'Avoiding documentation'],
    correct: 1,
    explanation: 'Autonomy supports informed consent and shared decision-making.',
  },
];

const FALLBACK_QUESTIONS = [
  {
    domain: 'Engineering',
    question: 'A system behaves unpredictably under load. What is the most systematic first step?',
    options: ['Rewrite everything', 'Measure and reproduce the issue', 'Add more servers blindly', 'Skip testing'],
    correct: 1,
    explanation: 'Reproduce and measure before changing design — core debugging practice.',
  },
  {
    domain: 'Engineering',
    question: 'Why are prototypes often built before full-scale production?',
    options: ['To avoid planning', 'To validate assumptions with lower risk', 'To skip documentation', 'To eliminate testing'],
    correct: 1,
    explanation: 'Prototypes reduce risk by testing assumptions early.',
  },
  {
    domain: 'Engineering',
    question: 'What does "scalability" usually refer to?',
    options: ['Only UI size', 'Ability to handle growth in usage or data', 'Color contrast', 'Font choice'],
    correct: 1,
    explanation: 'Scalability is how well a solution grows with demand.',
  },
  {
    domain: 'Engineering',
    question: 'Which habit best prevents technical debt from snowballing?',
    options: ['Never refactor', 'Small continuous improvements and reviews', 'Only fix after failure', 'Copy-paste only'],
    correct: 1,
    explanation: 'Continuous refactoring and review keep systems maintainable.',
  },
  {
    domain: 'Commerce',
    question: 'What is the primary purpose of a cash flow statement?',
    options: ['Show profit only', 'Show inflows and outflows of cash over time', 'List employees', 'Track social media'],
    correct: 1,
    explanation: 'Cash flow tracks actual liquidity movement, not just profit on paper.',
  },
  {
    domain: 'Commerce',
    question: 'When demand rises and supply is fixed in the short run, price tends to:',
    options: ['Fall', 'Rise', 'Stay identical forever', 'Become random'],
    correct: 1,
    explanation: 'Higher demand with constrained supply typically pushes prices up.',
  },
  {
    domain: 'Commerce',
    question: 'Break-even analysis helps a business find:',
    options: ['Maximum logo size', 'The point where revenue covers costs', 'Employee birthdays', 'Server uptime'],
    correct: 1,
    explanation: 'Break-even is where total revenue equals total costs.',
  },
  {
    domain: 'Commerce',
    question: 'Diversifying a portfolio primarily aims to:',
    options: ['Guarantee returns', 'Reduce unsystematic risk through variety', 'Eliminate all risk', 'Pick one stock'],
    correct: 1,
    explanation: 'Diversification spreads exposure to reduce firm-specific risk.',
  },
  {
    domain: 'Medical',
    question: 'In evidence-based practice, what should guide clinical decisions first?',
    options: ['Social media trends', 'Best available research plus patient context', 'Anecdotes only', 'Advertising'],
    correct: 1,
    explanation: 'EBM combines research evidence with clinical expertise and patient values.',
  },
  {
    domain: 'Medical',
    question: 'Why is hand hygiene critical in healthcare settings?',
    options: ['It is optional', 'It reduces transmission of infections', 'It only helps paperwork', 'It replaces vaccines'],
    correct: 1,
    explanation: 'Hand hygiene breaks chains of infection transmission.',
  },
  {
    domain: 'Medical',
    question: 'A double-blind trial primarily reduces:',
    options: ['Patient comfort', 'Bias from participants and researchers', 'Cost always', 'Ethics review'],
    correct: 1,
    explanation: 'Blinding reduces bias in measuring outcomes.',
  },
  {
    domain: 'Medical',
    question: 'Vital signs are monitored to:',
    options: ['Decorate charts', 'Detect changes in baseline physiology', 'Replace diagnosis', 'Avoid talking to patients'],
    correct: 1,
    explanation: 'Vitals help track stability and early warning signs.',
  },
];

/**
 * @param {object[]} questions
 * @param {Record<number, { correct: boolean }>} answersByIndex
 */
export function computeDomainStats(questions, answersByIndex) {
  const stats = {};
  questions.forEach((q, i) => {
    const d = q.domain || 'General';
    if (!stats[d]) stats[d] = { correct: 0, total: 0 };
    stats[d].total += 1;
    if (answersByIndex[i]?.correct) stats[d].correct += 1;
  });
  const scoresPct = {};
  Object.entries(stats).forEach(([d, v]) => {
    scoresPct[d] = v.total > 0 ? Math.round((v.correct / v.total) * 100) : 0;
  });
  return { domainStats: stats, domainScoresPct: scoresPct };
}

/**
 * AI suggestions for what to review next, based on quiz performance and onboarding context.
 * @param {object} context — compact stats + user fields (studyDomains[], studyKeywords, onboardingQuizSummary, onboardingDomainScores, weakAreas, domainWeakAreas, subjectAccuracy, overallAccuracy, totalQuizzes)
 * @returns {Promise<{ summary: string, topics: Array<{ name: string, reason: string }>, source: 'gemini' } | null>}
 */
export async function generateReviewSuggestionsFromQuiz(context) {
  if (!GEMINI_API_KEY) return null;

  const prompt = `You are a concise study coach for a quiz app.

STUDENT CONTEXT (JSON):
${JSON.stringify(context)}

IN-APP LIBRARY SUBJECTS (use exact names when recommending a quiz track): ${LIBRARY_SUBJECT_NAMES.join(', ')}

TASK:
1. Write one short encouraging summary sentence (max 25 words) about their learning trajectory.
2. Suggest exactly 4 specific topics or subtopics to review next. Prioritize weak areas and gaps. Align with their chosen domains/keywords when relevant. Prefer tying 1–2 items to the library subjects above when it fits.

Return ONLY valid JSON (no markdown):
{"summary":"...","topics":[{"name":"short label","reason":"one clear sentence"}]}`;

  try {
    const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 2048 },
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Gemini error ${response.status}`);
    }

    const result = await response.json();
    const responseText = result?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!responseText) throw new Error('Empty AI response');

    const data = parseGeminiJson(responseText);
    const topics = Array.isArray(data.topics) ? data.topics : [];
    const normalized = topics
      .map((t) => ({
        name: String(t.name || t.topic || '').trim(),
        reason: String(t.reason || t.detail || '').trim(),
      }))
      .filter((t) => t.name && t.reason)
      .slice(0, 6);

    if (normalized.length === 0) throw new Error('No topics in AI response');

    return {
      summary: String(data.summary || '').trim() || 'Here are focused topics to review from your recent quiz data.',
      topics: normalized,
      source: 'gemini',
    };
  } catch (e) {
    console.warn('Gemini review suggestions failed:', e);
    return null;
  }
}
