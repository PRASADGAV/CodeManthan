import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';
import { LuBookOpen, LuArrowRight, LuBrain, LuFlaskConical, LuMonitor, LuLanguages, LuStar, LuGauge } from 'react-icons/lu';
import './QuizSelect.css';

const SUBJECT_ICONS = {
  Mathematics: <LuBrain />,
  Science: <LuFlaskConical />,
  'Computer Science': <LuMonitor />,
  English: <LuLanguages />,
};

const SUBJECT_COLORS = {
  Mathematics: { bg: 'rgba(99, 102, 241, 0.1)', border: 'rgba(99, 102, 241, 0.2)', color: '#818cf8' },
  Science: { bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7' },
  'Computer Science': { bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.2)', color: '#fcd34d' },
  English: { bg: 'rgba(244, 63, 94, 0.1)', border: 'rgba(244, 63, 94, 0.2)', color: '#fda4af' },
};

const DIFFICULTY_INFO = {
  easy: { label: 'Easy', desc: 'Basic concepts, great for revision', color: '#10b981', xpMult: '1x XP' },
  medium: { label: 'Medium', desc: 'Standard difficulty, good challenge', color: '#f59e0b', xpMult: '1.2x XP' },
  hard: { label: 'Hard', desc: 'Advanced problems, maximum challenge', color: '#f43f5e', xpMult: '1.5x XP' },
};

export default function QuizSelect() {
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium');
  const [numQuestions, setNumQuestions] = useState(5);
  const { getSubjects, getTopics, startQuiz } = useQuiz();
  const navigate = useNavigate();

  const subjects = getSubjects();

  const handleStartQuiz = () => {
    if (!selectedSubject || !selectedTopic) return;
    const success = startQuiz(selectedSubject, selectedTopic, selectedDifficulty, numQuestions);
    if (success) navigate('/quiz/play');
  };

  return (
    <div className="quiz-select animate-fadeIn">
      <div className="page-header">
        <div className="page-header-icon">
          <LuBookOpen />
        </div>
        <div>
          <h1>Take a Quiz</h1>
          <p>Choose your subject, topic, and difficulty to start learning</p>
        </div>
      </div>

      {/* Step 1: Subject Selection */}
      <div className="select-section">
        <h2 className="select-section-title">
          <span className="step-badge">1</span>
          Choose Subject
        </h2>
        <div className="subject-grid">
          {subjects.map(subject => {
            const colors = SUBJECT_COLORS[subject];
            return (
              <button
                key={subject}
                className={`subject-card ${selectedSubject === subject ? 'active' : ''}`}
                onClick={() => { setSelectedSubject(subject); setSelectedTopic(null); }}
                style={{
                  '--card-bg': colors.bg,
                  '--card-border': colors.border,
                  '--card-color': colors.color,
                }}
                id={`subject-${subject.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className="subject-icon">{SUBJECT_ICONS[subject]}</div>
                <span className="subject-name">{subject}</span>
                <span className="subject-topics-count">{getTopics(subject).length} topics</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Topic Selection */}
      {selectedSubject && (
        <div className="select-section animate-fadeInUp">
          <h2 className="select-section-title">
            <span className="step-badge">2</span>
            Choose Topic
          </h2>
          <div className="topic-grid">
            {getTopics(selectedSubject).map(topic => (
              <button
                key={topic}
                className={`topic-card ${selectedTopic === topic ? 'active' : ''}`}
                onClick={() => setSelectedTopic(topic)}
                id={`topic-${topic.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <LuStar className="topic-icon" />
                <span>{topic}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Difficulty & Settings */}
      {selectedTopic && (
        <div className="select-section animate-fadeInUp">
          <h2 className="select-section-title">
            <span className="step-badge">3</span>
            Settings
          </h2>

          <div className="settings-grid">
            <div className="difficulty-section">
              <label className="settings-label">
                <LuGauge /> Difficulty
              </label>
              <div className="difficulty-options">
                {Object.entries(DIFFICULTY_INFO).map(([key, info]) => (
                  <button
                    key={key}
                    className={`difficulty-btn ${selectedDifficulty === key ? 'active' : ''}`}
                    onClick={() => setSelectedDifficulty(key)}
                    style={{ '--diff-color': info.color }}
                    id={`difficulty-${key}`}
                  >
                    <span className="diff-label">{info.label}</span>
                    <span className="diff-desc">{info.desc}</span>
                    <span className="diff-xp">{info.xpMult}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="questions-section">
              <label className="settings-label">Number of Questions</label>
              <div className="questions-selector">
                {[3, 5, 8, 10].map(num => (
                  <button
                    key={num}
                    className={`question-count-btn ${numQuestions === num ? 'active' : ''}`}
                    onClick={() => setNumQuestions(num)}
                    id={`questions-${num}`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="quiz-summary">
            <div className="summary-item">
              <span>Subject:</span>
              <strong>{selectedSubject}</strong>
            </div>
            <div className="summary-item">
              <span>Topic:</span>
              <strong>{selectedTopic}</strong>
            </div>
            <div className="summary-item">
              <span>Difficulty:</span>
              <strong style={{ color: DIFFICULTY_INFO[selectedDifficulty].color }}>
                {DIFFICULTY_INFO[selectedDifficulty].label}
              </strong>
            </div>
            <div className="summary-item">
              <span>Questions:</span>
              <strong>{numQuestions}</strong>
            </div>
          </div>

          <button className="btn btn-primary btn-lg start-quiz-btn" onClick={handleStartQuiz} id="start-quiz-btn">
            Start Quiz
            <LuArrowRight />
          </button>
        </div>
      )}
    </div>
  );
}
