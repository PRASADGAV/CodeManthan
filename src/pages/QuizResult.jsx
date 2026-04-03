import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';
import { useAuth } from '../context/AuthContext';
import { getTopicExplanation } from '../services/aiService';
import { resourceBank } from '../data/quizData';
import { LuTrophy, LuTarget, LuClock, LuFlame, LuZap, LuArrowRight, LuRotateCcw, LuBookOpen, LuSparkles, LuExternalLink } from 'react-icons/lu';
import './QuizResult.css';

export default function QuizResult() {
  const { quizResult, currentQuiz, resetQuiz, newBadges, showBadgePopup, setShowBadgePopup } = useQuiz();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [aiExplanation, setAiExplanation] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    if (!quizResult) {
      navigate('/quiz/select');
    }
  }, [quizResult, navigate]);

  // Get AI explanation for wrong answers
  const getAIHelp = async (question, userAnswer, correctAnswer) => {
    setLoadingAI(true);
    const explanation = await getTopicExplanation(
      question.question,
      question.options[userAnswer],
      question.options[correctAnswer],
      currentQuiz?.topic || ''
    );
    setAiExplanation(explanation);
    setLoadingAI(false);
  };

  if (!quizResult) return null;

  const { accuracy, correctAnswers, totalQuestions, timeTaken, xpEarned, maxStreak, answers } = quizResult;
  const resources = resourceBank[quizResult.subject]?.[quizResult.topic] || [];

  const getGrade = () => {
    if (accuracy === 100) return { grade: 'S', color: '#fbbf24', label: 'Perfect!' };
    if (accuracy >= 80) return { grade: 'A', color: '#10b981', label: 'Excellent!' };
    if (accuracy >= 60) return { grade: 'B', color: '#3b82f6', label: 'Good job!' };
    if (accuracy >= 40) return { grade: 'C', color: '#E0A546', label: 'Keep trying!' };
    return { grade: 'D', color: '#f43f5e', label: 'Needs work' };
  };

  const grade = getGrade();

  return (
    <div className="quiz-result animate-fadeIn">
      {/* Badge Popup */}
      {showBadgePopup && newBadges.length > 0 && (
        <div className="badge-popup-overlay" onClick={() => setShowBadgePopup(false)}>
          <div className="badge-popup animate-scaleIn" onClick={e => e.stopPropagation()}>
            <div className="badge-popup-header">🎉 New Badge Unlocked!</div>
            {newBadges.map(badge => (
              <div key={badge.id} className="badge-popup-item">
                <span className="badge-popup-icon">{badge.icon}</span>
                <div>
                  <div className="badge-popup-name">{badge.name}</div>
                  <div className="badge-popup-desc">{badge.description}</div>
                  <div className="badge-popup-xp">+{badge.xpReward} XP</div>
                </div>
              </div>
            ))}
            <button className="btn btn-primary" onClick={() => setShowBadgePopup(false)}>Awesome!</button>
          </div>
        </div>
      )}

      {/* Result Header */}
      <div className="result-header">
        <div className="result-grade-circle" style={{ '--grade-color': grade.color }}>
          <span className="result-grade">{grade.grade}</span>
        </div>
        <div className="result-header-info">
          <h1>{grade.label}</h1>
          <p>{quizResult.subject} • {quizResult.topic}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="result-stats">
        <div className="result-stat-card">
          <LuTarget className="result-stat-icon" style={{ color: grade.color }} />
          <div className="result-stat-value">{accuracy}%</div>
          <div className="result-stat-label">Accuracy</div>
        </div>
        <div className="result-stat-card">
          <LuTrophy className="result-stat-icon" style={{ color: '#10b981' }} />
          <div className="result-stat-value">{correctAnswers}/{totalQuestions}</div>
          <div className="result-stat-label">Correct</div>
        </div>
        <div className="result-stat-card">
          <LuClock className="result-stat-icon" style={{ color: '#3b82f6' }} />
          <div className="result-stat-value">{timeTaken}s</div>
          <div className="result-stat-label">Time</div>
        </div>
        <div className="result-stat-card">
          <LuFlame className="result-stat-icon" style={{ color: '#E0A546' }} />
          <div className="result-stat-value">{maxStreak}</div>
          <div className="result-stat-label">Max Streak</div>
        </div>
        <div className="result-stat-card highlight">
          <LuZap className="result-stat-icon" style={{ color: '#D4645C' }} />
          <div className="result-stat-value">+{xpEarned}</div>
          <div className="result-stat-label">XP Earned</div>
        </div>
      </div>

      {/* Answer Review */}
      <div className="result-section">
        <h2 className="result-section-title">Answer Review</h2>
        <div className="answer-review-list">
          {currentQuiz?.questions.map((q, idx) => {
            const answer = answers[idx];
            if (!answer) return null;
            return (
              <div key={idx} className={`answer-review-item ${answer.correct ? 'correct' : 'incorrect'}`}>
                <div className="answer-review-num">{idx + 1}</div>
                <div className="answer-review-content">
                  <p className="answer-review-question">{q.question}</p>
                  <div className="answer-review-details">
                    {!answer.correct && (
                      <>
                        <span className="your-answer">Your answer: {q.options[answer.selectedOption]}</span>
                        <span className="correct-answer">Correct: {q.options[q.correct]}</span>
                      </>
                    )}
                    {answer.correct && <span className="correct-badge-small">✓ Correct</span>}
                  </div>
                  {!answer.correct && q.explanation && (
                    <p className="answer-explanation">{q.explanation}</p>
                  )}
                  {!answer.correct && (
                    <button
                      className="btn btn-sm btn-secondary ai-explain-btn"
                      onClick={() => getAIHelp(q, answer.selectedOption, q.correct)}
                    >
                      <LuSparkles /> AI Explanation
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* AI Generated Explanation */}
        {(loadingAI || aiExplanation) && (
          <div className="ai-explanation-card">
            <div className="ai-explanation-header">
              <LuSparkles /> AI-Powered Explanation
            </div>
            {loadingAI ? (
              <div className="ai-loading"><div className="spinner" style={{ width: 24, height: 24 }}></div> Generating explanation...</div>
            ) : (
              <p>{aiExplanation}</p>
            )}
          </div>
        )}
      </div>

      {/* Resource Recommendations */}
      {accuracy < 80 && resources.length > 0 && (
        <div className="result-section">
          <h2 className="result-section-title">📚 Recommended Resources</h2>
          <p className="result-section-subtitle">Study these to improve your {quizResult.topic} skills</p>
          <div className="resources-grid">
            {resources.map((res, idx) => (
              <a key={idx} href={res.url} target="_blank" rel="noopener noreferrer" className="resource-card">
                <div className="resource-type-badge">
                  {res.type === 'video' ? '🎥' : res.type === 'article' ? '📄' : '💻'} {res.type}
                </div>
                <h4>{res.title}</h4>
                <div className="resource-rating">
                  ⭐ {res.rating}
                  <LuExternalLink className="resource-link-icon" />
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="result-actions">
        <button className="btn btn-primary btn-lg" onClick={() => { resetQuiz(); navigate('/quiz/select'); }} id="retry-quiz-btn">
          <LuRotateCcw /> Take Another Quiz
        </button>
        <Link to="/student-dashboard" className="btn btn-secondary btn-lg" onClick={resetQuiz} id="goto-dashboard-btn">
          <LuBookOpen /> View Dashboard
        </Link>
      </div>
    </div>
  );
}
