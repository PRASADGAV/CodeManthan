import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPerformanceData, getQuizHistory } from '../services/storageService';
import { getAdaptiveLearningPath, identifyWeakAreas } from '../services/aiService';
import { resourceBank } from '../data/quizData';
import { LuRoute, LuSparkles, LuTarget, LuBookOpen, LuExternalLink, LuRefreshCw, LuArrowRight } from 'react-icons/lu';
import './LearningPath.css';

export default function LearningPath() {
  const { user } = useAuth();
  const [aiPath, setAiPath] = useState('');
  const [loading, setLoading] = useState(false);

  const performance = useMemo(() => getPerformanceData(user?.id), [user?.id]);
  const history = useMemo(() => getQuizHistory(user?.id), [user?.id]);

  const weakAreas = useMemo(() => {
    return identifyWeakAreas(history);
  }, [history]);

  // Generate AI learning path on load
  useEffect(() => {
    generatePath();
  }, []);

  const generatePath = async () => {
    setLoading(true);
    const path = await getAdaptiveLearningPath(weakAreas, history, user?.level || 1);
    setAiPath(path);
    setLoading(false);
  };

  // Get resources for weak topics
  const getResourcesForTopic = (subject, topic) => {
    return resourceBank[subject]?.[topic] || [];
  };

  return (
    <div className="learning-path-page animate-fadeIn">
      <div className="page-header">
        <div className="page-header-icon">
          <LuRoute />
        </div>
        <div>
          <h1>AI Learning Path</h1>
          <p>Your personalized study plan powered by AI</p>
        </div>
      </div>

      {/* AI Generated Study Plan */}
      <div className="ai-path-card glass-card">
        <div className="ai-path-header">
          <div className="ai-path-title">
            <LuSparkles style={{ color: '#a78bfa' }} />
            <h2>Your Adaptive Study Plan</h2>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={generatePath} disabled={loading}>
            <LuRefreshCw className={loading ? 'spin-icon' : ''} />
            {loading ? 'Generating...' : 'Regenerate'}
          </button>
        </div>
        
        {loading ? (
          <div className="ai-loading-full">
            <div className="spinner"></div>
            <p>Analyzing your performance and generating a personalized study plan...</p>
          </div>
        ) : (
          <div className="ai-path-content">
            {aiPath.split('\n').map((line, idx) => (
              <p key={idx} className={line.startsWith('**') ? 'ai-path-bold' : ''}>
                {line.replace(/\*\*/g, '')}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Weak Areas Detail */}
      {weakAreas.length > 0 && (
        <div className="weak-detail-section">
          <h2 className="section-title-small">
            <LuTarget style={{ color: '#f59e0b' }} /> Focus Areas
          </h2>
          <div className="weak-detail-grid">
            {weakAreas.map((area, idx) => {
              const resources = getResourcesForTopic(area.subject, area.topic);
              return (
                <div key={idx} className="weak-detail-card glass-card">
                  <div className="weak-detail-header">
                    <div>
                      <span className="weak-detail-subject">{area.subject}</span>
                      <h3>{area.topic}</h3>
                    </div>
                    <div className="weak-detail-accuracy" style={{
                      color: area.accuracy < 40 ? '#f43f5e' : area.accuracy < 60 ? '#f59e0b' : '#3b82f6'
                    }}>
                      {area.accuracy}%
                    </div>
                  </div>

                  <div className="progress-bar" style={{ marginBottom: 'var(--space-4)' }}>
                    <div className="progress-fill" style={{
                      width: `${area.accuracy}%`,
                      background: area.accuracy < 40 ? 'var(--gradient-danger)' : 'var(--gradient-warm)',
                    }}></div>
                  </div>

                  <div className="weak-detail-stats">
                    <span>Correct: {area.correct}/{area.total}</span>
                    <span>Priority: {area.accuracy < 40 ? '🔴 High' : area.accuracy < 60 ? '🟡 Medium' : '🟢 Low'}</span>
                  </div>

                  {resources.length > 0 && (
                    <div className="weak-detail-resources">
                      <h4>📚 Recommended Resources</h4>
                      {resources.map((res, ridx) => (
                        <a key={ridx} href={res.url} target="_blank" rel="noopener noreferrer" className="resource-link">
                          <span>{res.type === 'video' ? '🎥' : res.type === 'article' ? '📄' : '💻'} {res.title}</span>
                          <LuExternalLink />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {weakAreas.length === 0 && (
        <div className="all-good-card glass-card">
          <span className="all-good-icon">🎉</span>
          <h3>You're doing great!</h3>
          <p>No significant weak areas detected. Keep practicing to maintain your skills, or try harder difficulty levels!</p>
          <Link to="/quiz/select" className="btn btn-primary">
            <LuBookOpen /> Take a Quiz
            <LuArrowRight />
          </Link>
        </div>
      )}
    </div>
  );
}
