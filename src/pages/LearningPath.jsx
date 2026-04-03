import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPerformanceData, getQuizHistory } from '../services/storageService';
import { getAdaptiveLearningPath, identifyWeakAreas } from '../services/aiService';
import { resourceBank } from '../data/quizData';
import { LuRoute, LuSparkles, LuTarget, LuBookOpen, LuExternalLink, LuRefreshCw, LuArrowRight, LuLoader } from 'react-icons/lu';
import './LearningPath.css';

export default function LearningPath() {
  const { user } = useAuth();
  const [aiPath, setAiPath] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [performance, setPerformance] = useState(null);
  const [history, setHistory] = useState([]);
  const [weakAreas, setWeakAreas] = useState([]);

  useEffect(() => {
    async function loadDataAndGenerate() {
      if (!user?.id) return;
      try {
        const [perf, hist] = await Promise.all([
          getPerformanceData(user.id),
          getQuizHistory(user.id),
        ]);
        
        setPerformance(perf);
        setHistory(hist);
        
        const weak = identifyWeakAreas(hist);
        setWeakAreas(weak);

        // Auto-generate AI learning path
        setLoading(true);
        const path = await getAdaptiveLearningPath(weak, hist, user.level || 1);
        setAiPath(path);
      } catch (err) {
        console.error("Failed to load learning path data", err);
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    }
    loadDataAndGenerate();
  }, [user?.id, user?.level]);

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

  if (initialLoading) {
     return (
      <div className="learning-path-page animate-fadeIn" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <LuLoader className="pq-spin" style={{ fontSize: '2rem', color: 'var(--accent)' }} />
      </div>
    );
  }

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
            {loading && !!aiPath ? 'Generating...' : 'Regenerate'}
          </button>
        </div>
        
        {loading && !aiPath ? (
          <div className="ai-loading-full">
             <LuLoader className="pq-spin" style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--accent)' }} />
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
            <LuTarget style={{ color: '#E0A546' }} /> Focus Areas
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
                      color: area.accuracy < 40 ? '#f43f5e' : area.accuracy < 60 ? '#E0A546' : '#3b82f6'
                    }}>
                      {area.accuracy}%
                    </div>
                  </div>

                  <div className="progress-bar" style={{ marginBottom: 'var(--s4)' }}>
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
