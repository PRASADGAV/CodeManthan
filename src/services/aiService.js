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
 * Generate an adaptive learning path based on student's weak areas and quiz history
 */
export async function getAdaptiveLearningPath(weakAreas, quizHistory, currentLevel) {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    return getFallbackLearningPath(weakAreas);
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
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: `Based on a student's learning data, create a personalized study plan.

Weak Areas: ${JSON.stringify(weakAreas)}
Recent Performance: ${JSON.stringify(quizHistory.slice(-5))}
Current Level: ${currentLevel}

Please provide a structured study plan with:
1. Priority topics to focus on (ranked by weakness)
2. Recommended study order
3. Estimated time for each topic
4. Specific tips for improvement

Format as a clear, actionable plan. Keep it concise.`
          }
        ]
      })
    });

    if (!response.ok) throw new Error('API request failed');
    
    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    console.error('AI Learning Path error:', error);
    return getFallbackLearningPath(weakAreas);
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
function getFallbackLearningPath(weakAreas) {
  if (!weakAreas || weakAreas.length === 0) {
    return `🎉 Great job! You're doing well across all topics. Keep practicing to maintain your skills. Try attempting harder difficulty levels to challenge yourself!`;
  }

  const sorted = [...weakAreas].sort((a, b) => a.accuracy - b.accuracy);
  
  let plan = `📋 **Your Personalized Study Plan**\n\n`;
  plan += `Based on your quiz performance, here are your recommended focus areas:\n\n`;
  
  sorted.forEach((area, index) => {
    const priority = index === 0 ? '🔴 HIGH' : index === 1 ? '🟡 MEDIUM' : '🟢 LOW';
    const time = area.accuracy < 40 ? '45-60 min' : area.accuracy < 60 ? '30-45 min' : '15-30 min';
    
    plan += `**${index + 1}. ${area.topic}** (${area.subject}) - ${priority} Priority\n`;
    plan += `   • Current Accuracy: ${area.accuracy}%\n`;
    plan += `   • Recommended Study Time: ${time}\n`;
    plan += `   • Focus on: Review fundamentals, practice ${area.accuracy < 40 ? 'easy' : 'medium'} level questions first\n\n`;
  });

  plan += `\n💡 **Tips:**\n`;
  plan += `• Start with your weakest topic and work your way up\n`;
  plan += `• Take a quiz after studying each topic to measure improvement\n`;
  plan += `• Use the recommended resources for each topic\n`;
  plan += `• Aim for at least 70% accuracy before moving to the next topic`;

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
