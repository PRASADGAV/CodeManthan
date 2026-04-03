import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPerformanceData, getQuizHistory } from '../services/storageService';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import {
  LuTarget, LuTrophy, LuZap, LuFlame, LuBookOpen, LuTrendingUp, LuTriangleAlert, LuRoute,
  LuLoader, LuSparkles, LuCompass, LuLightbulb, LuCircleCheck,
} from 'react-icons/lu';
import {
  getSkillRadarRows,
  getDomainRadarRows,
  getGuidanceSteps,
  getImprovementSuggestions,
} from '../utils/dashboardInsights';
import './Dashboard.css';

function RadarSkillTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  let detail = 'Not practiced yet — take a quiz';
  if (row.baselineOnly) detail = `${row.accuracy}% · baseline from your first quiz`;
  else if (row.practiced) detail = `${row.accuracy}% accuracy`;
  return (
    <div className="sd-chart-tooltip">
      <strong>{row.skill}</strong>
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
  }, [user?.id, user?.introQuizCompleted, user?.studyDomainIds, user?.studyKeywords, user?.onboardingQuizSummary, user?.onboardingDomainScores]);

  const skillRadarRows = useMemo(
    () => getSkillRadarRows(performance?.subjectAccuracy),
    [performance?.subjectAccuracy],
  );

  const domainRadarRows = useMemo(
    () => getDomainRadarRows(user, performance) ?? [],
    [user, performance],
  );
  const showDomainRadar = domainRadarRows.length > 0;

  const guidanceSteps = useMemo(
    () => (performance ? getGuidanceSteps(performance, user) : []),
    [performance, user],
  );

  const suggestions = useMemo(
    () => (performance ? getImprovementSuggestions(performance) : []),
    [performance],
  );

  const practicedSkills = useMemo(
    () => skillRadarRows.filter((r) => r.practiced).length,
    [skillRadarRows],
  );

  const practicedDomains = useMemo(
    () => domainRadarRows.filter((r) => r.practiced || r.baselineOnly).length,
    [domainRadarRows],
  );

  if (loading || !performance) {
    return (
      <div className="dashboard sd-dashboard sd-dashboard--loading animate-fadeIn">
        <LuLoader className="pq-spin sd-loader" aria-hidden />
        <p className="sd-loader-text">Loading your insights…</p>
      </div>
    );
  }

  const hasQuizActivity = performance.totalQuizzes > 0;

  const trendData = performance.recentTrend;

  const subjectData = Object.entries(performance.subjectAccuracy || {}).map(([subject, data]) => ({
    subject: subject.replace('Computer Science', 'CS'),
    accuracy: Math.round((data.correct / data.total) * 100),
  }));

  const difficultyData = Object.entries(performance.difficultyBreakdown || {}).map(([diff, data]) => ({
    difficulty: diff.charAt(0).toUpperCase() + diff.slice(1),
    correct: data.correct,
    total: data.total,
    accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
  }));

  const chartTooltipStyle = {
    backgroundColor: 'var(--card)',
    border: '1px solid var(--card-border)',
    borderRadius: '12px',
    color: 'var(--text)',
    fontSize: '0.8rem',
    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
  };

  const firstName = user?.name?.split(' ')[0] || 'Student';

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
                  ? 'Track domains + library skills, spot gaps, and follow next steps from your quizzes.'
                  : 'Complete onboarding to see domain radar and tailored guidance.'}
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
            <p>Your skill radar and suggestions below use demo baselines until you complete quizzes. One short quiz is enough to personalize everything.</p>
          </div>
          <Link to="/quiz/select" className="btn btn-primary btn-sm">Browse quizzes</Link>
        </div>
      )}

      {/* Stats */}
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

      {/* Radar + guidance + suggestions */}
      <section className="sd-main-grid">
        <div className="sd-radar-column">
          {showDomainRadar && (
            <div className="chart-card sd-radar-card sd-radar-card--domain">
              <div className="sd-radar-head">
                <h3 className="chart-title sd-radar-title">
                  <LuSparkles /> Your domains
                </h3>
                <p className="sd-radar-caption">
                  Based on what you chose{practicedDomains > 0 ? ` · ${practicedDomains} signals` : ''}. Scores blend your onboarding quiz and any follow-up attempts.
                </p>
              </div>
              <div className="sd-radar-chart-wrap sd-radar-chart-wrap--compact">
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={domainRadarRows} cx="50%" cy="52%" outerRadius="78%">
                    <defs>
                      <linearGradient id="sdRadarFillDomain" x1="0" y1="0" x2="1" y2="1">
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
                      fill="url(#sdRadarFillDomain)"
                      fillOpacity={1}
                      dot={{ r: 4, fill: '#a78bfa', strokeWidth: 0 }}
                      isAnimationActive
                      animationDuration={900}
                      animationEasing="ease-out"
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="chart-card sd-radar-card">
            <div className="sd-radar-head">
              <h3 className="chart-title sd-radar-title">
                <LuTarget /> Library skills
              </h3>
              <p className="sd-radar-caption">
                CodeManthan topic quizzes{practicedSkills > 0 ? ` · ${practicedSkills} subjects with data` : ''}. Take topic quizzes to grow this shape.
              </p>
            </div>
            <div className="sd-radar-chart-wrap">
              <ResponsiveContainer width="100%" height={showDomainRadar ? 260 : 320}>
                <RadarChart data={skillRadarRows} cx="50%" cy="52%" outerRadius="78%">
                  <defs>
                    <linearGradient id="sdRadarFill" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#D4645C" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#5B8FB9" stopOpacity={0.2} />
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
                    name="Accuracy"
                    dataKey="accuracy"
                    stroke="#D4645C"
                    strokeWidth={2.5}
                    fill="url(#sdRadarFill)"
                    fillOpacity={1}
                    dot={{ r: 4, fill: '#D4645C', strokeWidth: 0 }}
                    isAnimationActive
                    animationDuration={900}
                    animationEasing="ease-out"
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="sd-insights-stack">
          <div className="glass-card sd-guidance-card">
            <h3 className="card-title sd-card-title">
              <LuCompass /> Guidance
            </h3>
            <ol className="sd-guidance-steps">
              {guidanceSteps.map((s) => (
                <li key={s.n} className="sd-guidance-step">
                  <span className="sd-guidance-num">{s.n}</span>
                  <div>
                    <strong>{s.title}</strong>
                    <p>{s.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="glass-card sd-suggestions-card">
            <h3 className="card-title sd-card-title">
              <LuLightbulb /> Suggestions to improve
            </h3>
            <ul className="sd-suggestion-list">
              {suggestions.map((s) => (
                <li key={s.id} className={`sd-suggestion sd-suggestion--${s.kind}`}>
                  <span className="sd-suggestion-icon" aria-hidden>
                    {s.kind === 'focus' && <LuTriangleAlert />}
                    {s.kind === 'explore' && <LuBookOpen />}
                    {s.kind === 'habit' && <LuTrendingUp />}
                    {s.kind === 'celebrate' && <LuCircleCheck />}
                  </span>
                  <div>
                    <strong>{s.title}</strong>
                    <p>{s.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {hasQuizActivity && (
        <>
          <div className="dashboard-charts sd-charts-row">
            <div className="chart-card sd-chart-animate">
              <h3 className="chart-title">
                <LuTrendingUp /> Recent performance
              </h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
                    <XAxis dataKey="quiz" stroke="var(--text-muted)" fontSize={12} />
                    <YAxis stroke="var(--text-muted)" fontSize={12} domain={[0, 100]} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Line
                      type="monotone"
                      dataKey="accuracy"
                      stroke="#D4645C"
                      strokeWidth={2.5}
                      dot={{ fill: '#D4645C', r: 4 }}
                      activeDot={{ r: 6, fill: '#B04A43' }}
                      isAnimationActive
                      animationDuration={700}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card sd-chart-animate">
              <h3 className="chart-title">Difficulty mix</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={difficultyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
                    <XAxis dataKey="difficulty" stroke="var(--text-muted)" fontSize={12} />
                    <YAxis stroke="var(--text-muted)" fontSize={12} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Bar dataKey="correct" fill="#4CAF82" radius={[4, 4, 0, 0]} name="Correct" />
                    <Bar dataKey="total" fill="rgba(0,0,0,0.06)" radius={[4, 4, 0, 0]} name="Total" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="dashboard-charts">
            <div className="chart-card sd-chart-animate">
              <h3 className="chart-title">Subject accuracy</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={subjectData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
                    <XAxis type="number" domain={[0, 100]} stroke="var(--text-muted)" fontSize={12} />
                    <YAxis dataKey="subject" type="category" stroke="var(--text-muted)" fontSize={11} width={100} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Bar dataKey="accuracy" fill="#5B8FB9" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="dashboard-bottom sd-bottom">
        <div className="glass-card weak-areas-card sd-panel">
          <h3 className="card-title">
            <LuTriangleAlert style={{ color: '#E0A546' }} /> Topics to review
          </h3>
          {performance.weakAreas.length > 0 ? (
            <div className="weak-areas-list">
              {performance.weakAreas.slice(0, 5).map((area, idx) => (
                <div key={idx} className="weak-area-item">
                  <div className="weak-area-info">
                    <span className="weak-area-name">{area.topic}</span>
                    <span className="weak-area-accuracy">{area.accuracy}% accuracy</span>
                  </div>
                  <div className="progress-bar" style={{ width: '100px' }}>
                    <div
                      className="progress-fill"
                      style={{
                        width: `${area.accuracy}%`,
                        background: area.accuracy < 40 ? 'var(--danger)' : 'linear-gradient(90deg, var(--accent), var(--accent-light))',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-weak-areas">No topics flagged below threshold. Keep practicing across subjects.</p>
          )}
          <Link to="/learning-path" className="btn btn-secondary btn-sm sd-panel-link">
            <LuRoute /> Open learning path
          </Link>
        </div>

        <div className="glass-card recent-quizzes-card sd-panel">
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
