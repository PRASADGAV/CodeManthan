import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPerformanceData, getQuizHistory } from '../services/storageService';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip,
} from 'recharts';
import {
  LuTarget, LuTrophy, LuZap, LuFlame, LuBookOpen, LuTriangleAlert,
  LuLoader, LuSparkles, LuCompass, LuLightbulb, LuRoute,
} from 'react-icons/lu';
import {
  getKeywordRadarRows,
  buildFallbackReviewTopics,
} from '../utils/dashboardInsights';
import { generateReviewSuggestionsFromQuiz, domainIdToLabel } from '../services/personalizedQuizService';
import './Dashboard.css';

function RadarSkillTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  const title = row.fullLabel || row.skill;
  let detail = 'Add library quizzes that match this keyword for a sharper score';
  if (row.baselineOnly) detail = `${row.accuracy}% · baseline from your first quiz`;
  else if (row.practiced) detail = `${row.accuracy}% · blended from your activity`;
  return (
    <div className="sd-chart-tooltip">
      <strong>{title}</strong>
      <span>{detail}</span>
    </div>
  );
}

const defaultPerformance = {
  totalQuizzes: 0,
  totalQuestions: 0,
  totalCorrect: 0,
  overallAccuracy: 0,
  topicAccuracy: {},
  subjectAccuracy: {},
  difficultyBreakdown: {
    easy: { correct: 0, total: 0 },
    medium: { correct: 0, total: 0 },
    hard: { correct: 0, total: 0 },
  },
  recentTrend: [],
  weakAreas: [],
  strongAreas: [],
  topicPerformance: [],
  domainAccuracy: {},
  domainWeakAreas: [],
  domainPerformance: [],
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const [performance, setPerformance] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewPack, setReviewPack] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!user?.id) return;
      try {
        const [perf, hist] = await Promise.all([
          getPerformanceData(user.id),
          getQuizHistory(user.id),
        ]);
        setPerformance(perf);
        setHistory(hist);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setPerformance(defaultPerformance);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user?.id, user?.introQuizCompleted, user?.studyDomainIds, user?.studyKeywords, user?.onboardingQuizSummary, user?.onboardingDomainScores, user?.onboardingIntroAccuracy]);

  const keywordRadarRows = useMemo(
    () => getKeywordRadarRows(user, performance) ?? [],
    [user, performance],
  );
  const showKeywordRadar = keywordRadarRows.length > 0;

  const keywordSignals = useMemo(
    () => keywordRadarRows.filter((r) => r.practiced || r.baselineOnly).length,
    [keywordRadarRows],
  );

  useEffect(() => {
    if (!user || !performance) return;
    let cancelled = false;

    const subjectAccuracyCompact = Object.fromEntries(
      Object.entries(performance.subjectAccuracy || {})
        .filter(([, v]) => v && v.total > 0)
        .map(([k, v]) => [k, { pct: Math.round((v.correct / v.total) * 100), n: v.total }]),
    );

    const context = {
      studyDomains: (user.studyDomainIds || []).map(domainIdToLabel),
      studyKeywords: user.studyKeywords || '',
      onboardingQuizSummary: user.onboardingQuizSummary || '',
      onboardingDomainScores: user.onboardingDomainScores || {},
      overallAccuracy: performance.overallAccuracy,
      totalQuizzes: performance.totalQuizzes,
      domainWeakAreas: (performance.domainWeakAreas || []).slice(0, 4),
      weakAreas: (performance.weakAreas || []).slice(0, 5),
      subjectAccuracy: subjectAccuracyCompact,
    };

    async function run() {
      setReviewLoading(true);
      try {
        const ai = await generateReviewSuggestionsFromQuiz(context);
        if (cancelled) return;
        if (ai) {
          setReviewPack(ai);
        } else {
          setReviewPack(buildFallbackReviewTopics(performance));
        }
      } catch (e) {
        if (!cancelled) setReviewPack(buildFallbackReviewTopics(performance));
      } finally {
        if (!cancelled) setReviewLoading(false);
      }
    }
    const timeoutId = setTimeout(() => {
      run();
    }, 500);

    return () => {
      clearTimeout(timeoutId);
      cancelled = true;
    };
  }, [user, performance]);

  if (loading || !performance) {
    return (
      <div className="dashboard sd-dashboard sd-dashboard--loading animate-fadeIn">
        <LuLoader className="pq-spin sd-loader" aria-hidden />
        <p className="sd-loader-text">Loading your insights…</p>
      </div>
    );
  }

  const hasQuizActivity = performance.totalQuizzes > 0;
  const firstName = user?.name?.split(' ')[0] || 'Student';
  const displayReview = reviewPack || buildFallbackReviewTopics(performance);

  return (
    <div className="dashboard sd-dashboard sd-dashboard--genz animate-fadeIn">
      <section className="sd-hero">
        <div className="sd-hero-bg" aria-hidden />
        <div className="sd-hero-inner">
          <div className="sd-hero-copy">
            <p className="sd-hero-eyebrow">
              <LuSparkles aria-hidden /> Your learning cockpit
            </p>
            <h1>Welcome back, {firstName}</h1>
            <p className="sd-hero-sub">
              {user?.studyKeywords
                ? <>Your focus: <em className="sd-kw-chip">{user.studyKeywords.slice(0, 120)}{user.studyKeywords.length > 120 ? '…' : ''}</em></>
                : hasQuizActivity
                  ? 'Your radar uses the keywords you typed at setup; suggestions follow your quizzes.'
                  : 'Finish onboarding—split keywords with commas so each shows on the radar.'}
            </p>
          </div>
          <div className="sd-hero-actions">
            <Link to="/quiz/select" className="btn btn-primary sd-hero-cta" id="dashboard-take-quiz">
              <LuBookOpen /> {hasQuizActivity ? 'Take a quiz' : 'Start first quiz'}
            </Link>
            {hasQuizActivity && (
              <Link to="/learning-path" className="btn btn-secondary sd-hero-secondary">
                <LuRoute /> Learning path
              </Link>
            )}
          </div>
        </div>
      </section>

      {!hasQuizActivity && (
        <div className="sd-empty-banner glass-card">
          <LuCompass className="sd-empty-banner-icon" aria-hidden />
          <div>
            <strong>No quiz history yet</strong>
            <p>Your radar uses your first-quiz score on each keyword until library quizzes add more detail.</p>
          </div>
          <Link to="/quiz/select" className="btn btn-primary btn-sm">Browse quizzes</Link>
        </div>
      )}

      <div className="dashboard-stats sd-stats">
        <div className="stat-card sd-stat-card">
          <div className="stat-icon sd-stat-icon" style={{ background: 'rgba(212,100,92,0.12)', color: '#D4645C' }}>
            <LuTarget />
          </div>
          <div className="stat-value">{performance.overallAccuracy}%</div>
          <div className="stat-label">Overall accuracy</div>
        </div>
        <div className="stat-card sd-stat-card">
          <div className="stat-icon sd-stat-icon" style={{ background: 'rgba(76,175,130,0.12)', color: '#4CAF82' }}>
            <LuTrophy />
          </div>
          <div className="stat-value">{performance.totalQuizzes}</div>
          <div className="stat-label">Quizzes completed</div>
        </div>
        <div className="stat-card sd-stat-card">
          <div className="stat-icon sd-stat-icon" style={{ background: 'rgba(224,165,70,0.12)', color: '#E0A546' }}>
            <LuZap />
          </div>
          <div className="stat-value">{user?.xp || 0}</div>
          <div className="stat-label">Total XP</div>
        </div>
        <div className="stat-card sd-stat-card">
          <div className="stat-icon sd-stat-icon" style={{ background: 'rgba(91,143,185,0.12)', color: '#5B8FB9' }}>
            <LuFlame />
          </div>
          <div className="stat-value">{performance.totalCorrect}/{performance.totalQuestions}</div>
          <div className="stat-label">Correct answers</div>
        </div>
      </div>

      <section className="sd-main-grid">
        <div className="sd-radar-column">
          <div className="chart-card sd-radar-card sd-radar-card--domain">
            <div className="sd-radar-head">
              <h3 className="chart-title sd-radar-title">
                <LuTarget /> Your keywords
              </h3>
              <p className="sd-radar-caption">
                {showKeywordRadar
                  ? `Corners come from the keywords you entered before the first quiz (use commas to separate). ${keywordSignals > 0 ? `${keywordSignals} with a score signal.` : ''} Matches to quiz topics refine each spoke.`
                  : 'Add keywords when you build your first quiz—each phrase can become a corner (split with commas).'}
              </p>
            </div>
            <div className="sd-radar-chart-wrap sd-radar-chart-wrap--compact">
              {showKeywordRadar ? (
                <ResponsiveContainer width="100%" height={320}>
                  <RadarChart data={keywordRadarRows} cx="50%" cy="52%" outerRadius="78%">
                    <defs>
                      <linearGradient id="sdRadarFillFocus" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.2} />
                      </linearGradient>
                    </defs>
                    <PolarGrid stroke="var(--border)" strokeDasharray="3 6" />
                    <PolarAngleAxis
                      dataKey="skill"
                      tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontWeight: 600 }}
                      tickLine={false}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 100]}
                      tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                      tickCount={5}
                      stroke="var(--border)"
                    />
                    <Tooltip content={<RadarSkillTooltip />} />
                    <Radar
                      dataKey="accuracy"
                      stroke="#a78bfa"
                      strokeWidth={2.5}
                      fill="url(#sdRadarFillFocus)"
                      fillOpacity={1}
                      dot={{ r: 4, fill: '#a78bfa', strokeWidth: 0 }}
                      isAnimationActive
                      animationDuration={900}
                      animationEasing="ease-out"
                    />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="sd-radar-empty glass-card">
                  <p className="sd-muted">Complete onboarding and add at least one keyword (comma-separated for several corners).</p>
                  <Link to="/quiz/select" className="btn btn-primary btn-sm">Start setup quiz</Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="sd-insights-stack">
          <div className="glass-card sd-suggestions-card sd-suggestions-card--single">
            <h3 className="card-title sd-card-title">
              <LuLightbulb /> Suggestions
              {reviewLoading && <LuLoader className="sd-inline-loader pq-spin" aria-hidden />}
            </h3>
            <p className="sd-review-summary">{displayReview.summary}</p>
            <p className="sd-review-meta sd-muted">
              {displayReview.source === 'gemini' ? 'Personalized with Gemini from your quiz data.' : 'Suggestions from your scores (add VITE_GEMINI_API_KEY for AI wording).'}
            </p>
            <ul className="sd-suggestion-list sd-review-topic-list">
              {displayReview.topics.map((t, idx) => (
                <li key={`${t.name}-${idx}`} className="sd-suggestion sd-suggestion--focus">
                  <span className="sd-suggestion-icon" aria-hidden>
                    <LuTriangleAlert />
                  </span>
                  <div>
                    <strong>{t.name}</strong>
                    <p>{t.reason}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <div className="dashboard-bottom sd-bottom sd-bottom--single">
        <div className="glass-card recent-quizzes-card sd-panel sd-panel--wide">
          <h3 className="card-title">Recent quizzes</h3>
          {history.length > 0 ? (
            <div className="recent-quizzes-list">
              {history.slice(-5).reverse().map((quiz, idx) => (
                <div key={idx} className="recent-quiz-item">
                  <div className="recent-quiz-info">
                    <span className="recent-quiz-topic">{quiz.topic}</span>
                    <span className="recent-quiz-date">{new Date(quiz.timestamp).toLocaleDateString()}</span>
                  </div>
                  <div className={`recent-quiz-score ${quiz.correctAnswers / quiz.totalQuestions >= 0.7 ? 'good' : 'needs-work'}`}>
                    {Math.round((quiz.correctAnswers / quiz.totalQuestions) * 100)}%
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="sd-muted">Your completed quizzes will appear here.</p>
          )}
        </div>
      </div>
    </div>
  );
}
