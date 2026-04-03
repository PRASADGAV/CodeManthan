// AI Service for Topic Explanation and Adaptive Learning Path
// Uses Claude API (Anthropic) for AI-powered features
// Set your API key in the .env file: VITE_CLAUDE_API_KEY=your_key_here

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

// Get API key from environment variable
const getApiKey = () => {
  return import.meta.env.VITE_CLAUDE_API_KEY || '';
};

/**
 * Generate a personalized explanation for a wrongly answered question
 */
export async function getTopicExplanation(question, userAnswer, correctAnswer, topic) {
  const apiKey = getApiKey();
  
  // If no API key, use built-in explanation
  if (!apiKey) {
    return getFallbackExplanation(question, correctAnswer, topic);
  }

  try {
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: `A student answered a ${topic} question incorrectly. 
            
Question: ${question}
Student's Answer: ${userAnswer}
Correct Answer: ${correctAnswer}

Please provide a brief, encouraging explanation (2-3 sentences) that:
1. Explains why the correct answer is right
2. Addresses the misconception behind their wrong answer
3. Gives a quick tip to remember the concept

Keep it concise and student-friendly.`
          }
        ]
      })
    });

    if (!response.ok) throw new Error('API request failed');
    
    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    console.error('AI Explanation error:', error);
    return getFallbackExplanation(question, correctAnswer, topic);
  }
}

/**
 * @param {object} context - Optional: userPrompt, studyDomainIds, studyKeywords, onboardingQuizSummary
 */
export async function getAdaptiveLearningPath(weakAreas, quizHistory, currentLevel, context = {}) {
  const apiKey = getApiKey();
  const {
    userPrompt = '',
    studyDomainIds = [],
    studyKeywords = '',
    onboardingQuizSummary = '',
  } = context;

  const domainLine = studyDomainIds.length
    ? `Student-chosen domains (IDs): ${studyDomainIds.join(', ')}. Keywords they care about: ${studyKeywords || '(none)'}.\n`
    : '';

  const onboardingLine = onboardingQuizSummary
    ? `First personalized onboarding quiz insight: ${onboardingQuizSummary}\n`
    : '';

  const userAsk = userPrompt.trim()
    ? `The student wrote this request for their roadmap: "${userPrompt.trim()}"\nPrioritize aligning the plan with this.\n`
    : '';

  if (!apiKey) {
    return getFallbackLearningPath(weakAreas, context);
  }

  try {
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 900,
        messages: [
          {
            role: 'user',
            content: `Create a personalized study roadmap for a student.

${onboardingLine}${domainLine}${userAsk}Weak Areas (topic-level): ${JSON.stringify(weakAreas)}
Recent quiz summaries: ${JSON.stringify(quizHistory.slice(-6).map((q) => ({
              topic: q.topic,
              subject: q.subject,
              accuracy: q.accuracy,
              correct: q.correctAnswers,
              total: q.totalQuestions,
            })))}
Current Level: ${currentLevel}

Return a structured roadmap with:
1. A short motivational opener (1–2 sentences)
2. Numbered phases (1., 2., 3., …) each with a title, 2–4 bullet actions, and rough time estimate
3. One "fun challenge" to keep engagement
4. Close with how to use CodeManthan quizzes to verify progress

Keep tone upbeat and Gen-Z friendly but professional. No markdown tables.`,
          },
        ],
      }),
    });

    if (!response.ok) throw new Error('API request failed');

    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    console.error('AI Learning Path error:', error);
    return getFallbackLearningPath(weakAreas, context);
  }
}

/**
 * Fallback explanation when API is not available
 */
function getFallbackExplanation(question, correctAnswer, topic) {
  return `The correct answer is "${correctAnswer}". This is a key concept in ${topic}. ` +
    `Review this topic carefully and try to understand the underlying principle. ` +
    `Practice similar problems to strengthen your understanding! 💪`;
}

/**
 * Fallback learning path when API is not available
 */
function getFallbackLearningPath(weakAreas, context = {}) {
  const { userPrompt = '', onboardingQuizSummary = '', studyKeywords = '' } = context;

  let plan = `🚀 **Your roadmap**\n\n`;
  if (onboardingQuizSummary) {
    plan += `Starting from your first quiz: ${onboardingQuizSummary}\n\n`;
  }
  if (studyKeywords) {
    plan += `You said you care about: ${studyKeywords}\n\n`;
  }
  if (userPrompt.trim()) {
    plan += `Your ask: "${userPrompt.trim()}"\n\n`;
  }

  if (!weakAreas || weakAreas.length === 0) {
    plan += `You're doing well on tracked topics. Keep mixing domains, try harder quizzes, and use the prompt above whenever your goals shift.\n`;
    return plan;
  }

  const sorted = [...weakAreas].sort((a, b) => a.accuracy - b.accuracy);

  plan += `**Phased plan**\n\n`;
  sorted.slice(0, 5).forEach((area, index) => {
    const priority = index === 0 ? '🔥' : index === 1 ? '⚡' : '✨';
    const time = area.accuracy < 40 ? '45–60 min' : area.accuracy < 60 ? '30–45 min' : '15–30 min';
    plan += `${index + 1}. ${priority} **${area.topic}** (${area.subject})\n`;
    plan += `   • Accuracy ~${area.accuracy}% — spend ${time} on fundamentals\n`;
    plan += `   • Mini-quiz after revision to lock it in\n\n`;
  });

  plan += `🎮 **Fun challenge:** Teach one concept from your weakest topic to a friend in 2 minutes — gaps show up fast.\n`;
  plan += `\n💡 Re-run this roadmap after your next few quizzes so it stays fresh.`;

  return plan;
}

/**
 * Calculate difficulty adjustment based on rolling accuracy
 */
export function calculateDifficultyAdjustment(recentAnswers, currentDifficulty) {
  if (recentAnswers.length < 3) return currentDifficulty;
  
  const recent = recentAnswers.slice(-5);
  const accuracy = recent.filter(a => a.correct).length / recent.length;
  
  if (accuracy >= 0.8 && currentDifficulty !== 'hard') {
    return currentDifficulty === 'easy' ? 'medium' : 'hard';
  } else if (accuracy <= 0.4 && currentDifficulty !== 'easy') {
    return currentDifficulty === 'hard' ? 'medium' : 'easy';
  }
  
  return currentDifficulty;
}

/**
 * Identify weak areas from quiz history
 */
export function identifyWeakAreas(quizHistory) {
  const topicStats = {};
  
  quizHistory.forEach(quiz => {
    const key = `${quiz.subject}|${quiz.topic}`;
    if (!topicStats[key]) {
      topicStats[key] = { subject: quiz.subject, topic: quiz.topic, correct: 0, total: 0 };
    }
    topicStats[key].correct += quiz.correctAnswers;
    topicStats[key].total += quiz.totalQuestions;
  });

  return Object.values(topicStats)
    .map(stat => ({
      ...stat,
      accuracy: stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0
    }))
    .filter(stat => stat.accuracy < 70)
    .sort((a, b) => a.accuracy - b.accuracy);
}
