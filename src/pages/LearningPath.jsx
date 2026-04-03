import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getQuizHistory } from '../services/storageService';
import { getAdaptiveLearningPath, identifyWeakAreas } from '../services/aiService';
import { resourceBank } from '../data/quizData';
import { parseRoadmapSteps } from '../utils/learningPathParse';
import {
  LuRoute, LuSparkles, LuTarget, LuBookOpen, LuExternalLink, LuArrowRight, LuLoader,
  LuRocket,
} from 'react-icons/lu';
import './LearningPath.css';

export default function LearningPath() {
  const { user, updateUser } = useAuth();
  const [aiPath, setAiPath] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [weakAreas, setWeakAreas] = useState([]);
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!user?.id) return;
      setInitialLoading(true);
      try {
        const hist = await getQuizHistory(user.id);
        if (cancelled) return;
        setHistory(hist);
        const weak = identifyWeakAreas(hist);
        setWeakAreas(weak);
        const p = user?.learningPathPrompt || '';
        setPrompt(p);
        setLoading(true);
        const path = await getAdaptiveLearningPath(weak, hist, user?.level || 1, {
          userPrompt: p,
          studyDomainIds: user?.studyDomainIds || [],
          studyKeywords: user?.studyKeywords || '',
          onboardingQuizSummary: user?.onboardingQuizSummary || '',
        });
        if (!cancelled) setAiPath(path);
      } catch (err) {
        console.error('Failed to load learning path data', err);
      } finally {
        if (!cancelled) {
          setLoading(false);
          setInitialLoading(false);
        }
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.level, user?.learningPathPrompt, user?.onboardingQuizSummary, user?.studyDomainIds, user?.studyKeywords]);

  const generatePath = async () => {
    setLoading(true);
    await updateUser({ learningPathPrompt: prompt.trim() });
    try {
      const path = await getAdaptiveLearningPath(weakAreas, history, user?.level || 1, {
        userPrompt: prompt.trim(),
        studyDomainIds: user?.studyDomainIds || [],
        studyKeywords: user?.studyKeywords || '',
        onboardingQuizSummary: user?.onboardingQuizSummary || '',
      });
      setAiPath(path);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const roadmapSteps = parseRoadmapSteps(aiPath);

  const getResourcesForTopic = (subject, topic) => resourceBank[subject]?.[topic] || [];

  if (initialLoading) {
    return (
      <div className="learning-path-page lp-page lp-loading animate-fadeIn">
        <LuLoader className="pq-spin lp-spin" aria-hidden />
        <p>Building your path…</p>
      </div>
    );
  }

  return (
    <div className="learning-path-page lp-page animate-fadeIn">
      <div className="lp-hero">
        <div className="lp-hero-glow" aria-hidden />
        <div className="page-header lp-header">
          <div className="page-header-icon lp-icon-bounce">
            <LuRoute />
          </div>
          <div>
            <h1>Your roadmap</h1>
            <p className="lp-sub">Shaped by your first quiz + your goals. Tweak the prompt anytime.</p>
          </div>
        </div>
      </div>

      {(user?.onboardingQuizSummary || user?.studyKeywords) && (
        <div className="lp-context glass-card">
          {user?.onboardingQuizSummary && (
            <p className="lp-context-line"><LuSparkles /> <strong>First quiz:</strong> {user.onboardingQuizSummary}</p>
          )}
          {user?.studyKeywords && (
            <p className="lp-context-line"><LuTarget /> <strong>Keywords:</strong> {user.studyKeywords}</p>
          )}
        </div>
      )}

      <div className="lp-prompt glass-card">
        <label htmlFor="lp-prompt-input" className="lp-prompt-label">
          <LuSparkles /> What do you want to study? Need a roadmap for…
        </label>
        <textarea
          id="lp-prompt-input"
          className="lp-prompt-input"
          rows={3}
          placeholder="e.g. Crack JEE Physics in 90 days, balance CA prep with college, NEET biology deep dive…"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <div className="lp-prompt-actions">
          <button type="button" className="btn btn-primary lp-btn-magic" onClick={generatePath} disabled={loading}>
            {loading ? <LuLoader className="lp-spin" /> : <LuRocket />}
            {loading ? 'Generating…' : 'Regenerate roadmap'}
          </button>
        </div>
      </div>

      <div className="lp-ai-card glass-card">
        <div className="ai-path-header">
          <div className="ai-path-title">
            <LuSparkles className="lp-star" />
            <h2>Your adaptive plan</h2>
          </div>
        </div>

        {loading && !aiPath ? (
          <div className="ai-loading-full">
            <LuLoader className="pq-spin lp-spin" />
            <p>Aligning phases to your history and prompt…</p>
          </div>
        ) : (
          <>
            <div className="lp-roadmap">
              {roadmapSteps.length === 0 ? (
                <div className="ai-path-content lp-fallback-text">
                  {(aiPath || '').split('\n').map((line, idx) => (
                    <p key={idx} className={line.includes('**') ? 'ai-path-bold' : ''}>
                      {line.replace(/\*\*/g, '')}
                    </p>
                  ))}
                </div>
              ) : (
                roadmapSteps.map((step, idx) => (
                  <div key={step.id} className="lp-node" style={{ animationDelay: `${idx * 0.08}s` }}>
                    <div className="lp-node-rail" aria-hidden />
                    <div className="lp-node-badge">{idx + 1}</div>
                    <div className="lp-node-body">
                      <h3>{step.title}</h3>
                      {step.lines?.length > 0 && (
                        <ul>
                          {step.lines.map((line, j) => (
                            <li key={j}>{line}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {weakAreas.length > 0 && (
        <div className="weak-detail-section">
          <h2 className="section-title-small lp-section-title">
            <LuTarget style={{ color: '#E0A546' }} /> Focus areas (from quizzes)
          </h2>
          <div className="weak-detail-grid">
            {weakAreas.map((area, idx) => {
              const resources = getResourcesForTopic(area.subject, area.topic);
              return (
                <div key={idx} className="weak-detail-card glass-card lp-card-pop">
                  <div className="weak-detail-header">
                    <div>
                      <span className="weak-detail-subject">{area.subject}</span>
                      <h3>{area.topic}</h3>
                    </div>
                    <div
                      className="weak-detail-accuracy"
                      style={{
                        color: area.accuracy < 40 ? '#f43f5e' : area.accuracy < 60 ? '#E0A546' : '#3b82f6',
                      }}
                    >
                      {area.accuracy}%
                    </div>
                  </div>

                  <div className="progress-bar" style={{ marginBottom: 'var(--s4)' }}>
                    <div
                      className="progress-fill"
                      style={{
                        width: `${area.accuracy}%`,
                        background: area.accuracy < 40 ? 'var(--gradient-danger)' : 'var(--gradient-warm)',
                      }}
                    />
                  </div>

                  <div className="weak-detail-stats">
                    <span>Correct: {area.correct}/{area.total}</span>
                    <span>Priority: {area.accuracy < 40 ? 'High' : area.accuracy < 60 ? 'Medium' : 'Low'}</span>
                  </div>

                  {resources.length > 0 && (
                    <div className="weak-detail-resources">
                      <h4>Recommended resources</h4>
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
        <div className="all-good-card glass-card lp-all-good">
          <span className="all-good-icon">🎉</span>
          <h3>Looking strong</h3>
          <p>No big weak areas from library quizzes yet. Keep going, or take a quiz to sharpen the roadmap.</p>
          <Link to="/quiz/select" className="btn btn-primary lp-btn-magic">
            <LuBookOpen /> Take a quiz
            <LuArrowRight />
          </Link>
        </div>
      )}
    </div>
  );
}
