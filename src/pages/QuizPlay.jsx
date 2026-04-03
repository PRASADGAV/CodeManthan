import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';
import { LuClock, LuZap, LuFlame, LuCheck, LuX, LuArrowRight, LuGauge } from 'react-icons/lu';
import './QuizPlay.css';

export default function QuizPlay() {
  const {
    currentQuiz,
    currentQuestion,
    currentQuestionIndex,
    quizComplete,
    currentDifficulty,
    streak,
    progress,
    answerQuestion,
  } = useQuiz();
  const navigate = useNavigate();

  const [selected, setSelected] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);

  // Redirect if no quiz
  useEffect(() => {
    if (!currentQuiz) {
      navigate('/quiz/select');
    }
  }, [currentQuiz, navigate]);

  // Redirect on quiz complete
  useEffect(() => {
    if (quizComplete) {
      navigate('/quiz/result');
    }
  }, [quizComplete, navigate]);

  // Timer
  useEffect(() => {
    if (!showFeedback && currentQuestion) {
      const interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [showFeedback, currentQuestion, currentQuestionIndex]);

  // Reset on new question
  useEffect(() => {
    setSelected(null);
    setShowFeedback(false);
    setTimer(0);
  }, [currentQuestionIndex]);

  if (!currentQuiz || !currentQuestion) return null;

  const handleSelect = (optionIdx) => {
    if (showFeedback) return;
    setSelected(optionIdx);
  };

  const handleSubmit = () => {
    if (selected === null) return;
    
    const correct = selected === currentQuestion.correct;
    setIsCorrect(correct);
    setShowFeedback(true);

    // Auto-advance after 1.5s
    setTimeout(() => {
      answerQuestion(selected);
    }, 1500);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const difficultyColors = {
    easy: '#10b981',
    medium: '#E0A546',
    hard: '#f43f5e',
  };

  return (
    <div className="quiz-play animate-fadeIn">
      {/* Top Bar */}
      <div className="quiz-topbar">
        <div className="quiz-info-bar">
          <div className="quiz-meta">
            <span className="quiz-subject-tag">{currentQuiz.subject}</span>
            <span className="quiz-topic-tag">{currentQuiz.topic}</span>
          </div>
          <div className="quiz-stats-bar">
            <div className="quiz-stat-item" title="Time">
              <LuClock />
              <span>{formatTime(timer)}</span>
            </div>
            <div className="quiz-stat-item" title="Streak">
              <LuFlame style={{ color: streak > 0 ? '#E0A546' : undefined }} />
              <span>{streak}</span>
            </div>
            <div className="quiz-stat-item" title="Difficulty" style={{ color: difficultyColors[currentDifficulty] }}>
              <LuGauge />
              <span>{currentDifficulty}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="quiz-progress-wrapper">
          <div className="quiz-progress-bar">
            <div
              className="quiz-progress-fill"
              style={{
                width: `${((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100}%`,
                background: 'var(--gradient-primary)',
              }}
            ></div>
          </div>
          <span className="quiz-progress-text">
            {currentQuestionIndex + 1} / {currentQuiz.questions.length}
          </span>
        </div>
      </div>

      {/* Question Card */}
      <div className="quiz-question-card animate-scaleIn" key={currentQuestionIndex}>
        <div className="question-difficulty-badge" style={{ color: difficultyColors[currentQuestion.difficulty] }}>
          {currentQuestion.difficulty.toUpperCase()}
        </div>
        <h2 className="quiz-question-text">{currentQuestion.question}</h2>

        {/* Options */}
        <div className="quiz-options">
          {currentQuestion.options.map((option, idx) => {
            let optionClass = 'quiz-option';
            if (showFeedback) {
              if (idx === currentQuestion.correct) optionClass += ' correct';
              else if (idx === selected && idx !== currentQuestion.correct) optionClass += ' incorrect';
            } else if (selected === idx) {
              optionClass += ' selected';
            }

            return (
              <button
                key={idx}
                className={optionClass}
                onClick={() => handleSelect(idx)}
                disabled={showFeedback}
                id={`option-${idx}`}
              >
                <span className="option-letter">{String.fromCharCode(65 + idx)}</span>
                <span className="option-text">{option}</span>
                {showFeedback && idx === currentQuestion.correct && (
                  <LuCheck className="option-feedback-icon correct-icon" />
                )}
                {showFeedback && idx === selected && idx !== currentQuestion.correct && (
                  <LuX className="option-feedback-icon incorrect-icon" />
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {showFeedback && (
          <div className={`quiz-feedback ${isCorrect ? 'feedback-correct' : 'feedback-incorrect'}`}>
            <div className="feedback-header">
              {isCorrect ? (
                <>
                  <LuCheck /> Correct! +{currentQuiz.difficulty === 'hard' ? 15 : currentQuiz.difficulty === 'medium' ? 12 : 10} XP
                  {streak >= 2 && <span className="streak-bonus">🔥 {streak + 1} streak!</span>}
                </>
              ) : (
                <>
                  <LuX /> Incorrect
                </>
              )}
            </div>
            {!isCorrect && currentQuestion.explanation && (
              <p className="feedback-explanation">{currentQuestion.explanation}</p>
            )}
          </div>
        )}

        {/* Submit Button */}
        {!showFeedback && (
          <button
            className="btn btn-primary btn-lg quiz-submit-btn"
            onClick={handleSubmit}
            disabled={selected === null}
            id="submit-answer-btn"
          >
            Submit Answer
            <LuArrowRight />
          </button>
        )}
      </div>
    </div>
  );
}
