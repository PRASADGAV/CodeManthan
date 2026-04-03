import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPerformanceData, getQuizHistory } from '../services/storageService';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { LuTarget, LuTrophy, LuZap, LuFlame, LuBookOpen, LuTrendingUp, LuTriangleAlert, LuArrowRight, LuRoute } from 'react-icons/lu';
import './Dashboard.css';

export default function StudentDashboard() {
  const { user } = useAuth();

  const performance = useMemo(() => getPerformanceData(user?.id), [user?.id]);
  const history = useMemo(() => getQuizHistory(user?.id), [user?.id]);

  // Chart data
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

  const radarData = (performance.topicPerformance || []).slice(0, 8).map(t => ({
    topic: t.topic.split(' > ').pop()?.substring(0, 12) || t.topic.substring(0, 12),
    accuracy: t.accuracy,
    fullMark: 100,
  }));

  const chartTooltipStyle = {
    backgroundColor: '#FFFFFF',
    border: '1px solid rgba(0,0,0,0.08)',
    borderRadius: '12px',
    color: '#2E2B27',
    fontSize: '0.8rem',
    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
  };

  if (performance.totalQuizzes === 0) {
    return (
      <div className="dashboard animate-fadeIn">
        <div className="dashboard-welcome">
          <h1>Welcome, {user?.name?.split(' ')[0]}! 👋</h1>
          <p>Start your personalized learning journey by taking your first quiz.</p>
        </div>
        <div className="empty-dashboard">
          <div className="empty-dashboard-card">
            <span className="empty-icon">🎯</span>
            <h3>No quizzes taken yet</h3>
            <p>Take your first quiz to see your personalized analytics dashboard.</p>
            <Link to="/quiz/select" className="btn btn-primary btn-lg">
              <LuBookOpen /> Take Your First Quiz
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard animate-fadeIn">
      {/* Welcome */}
      <div className="dashboard-welcome">
        <div>
          <h1>Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
          <p>Here's your learning progress overview</p>
        </div>
        <Link to="/quiz/select" className="btn btn-primary" id="dashboard-take-quiz">
          <LuBookOpen /> Take Quiz
        </Link>
      </div>

      {/* Stats Row */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(212,100,92,0.08)', color: '#D4645C' }}>
            <LuTarget />
          </div>
          <div className="stat-value">{performance.overallAccuracy}%</div>
          <div className="stat-label">Overall Accuracy</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(76,175,130,0.08)', color: '#4CAF82' }}>
            <LuTrophy />
          </div>
          <div className="stat-value">{performance.totalQuizzes}</div>
          <div className="stat-label">Quizzes Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(224,165,70,0.08)', color: '#E0A546' }}>
            <LuZap />
          </div>
          <div className="stat-value">{user?.xp || 0}</div>
          <div className="stat-label">Total XP</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(212,100,92,0.06)', color: '#D4645C' }}>
            <LuFlame />
          </div>
          <div className="stat-value">{performance.totalCorrect}/{performance.totalQuestions}</div>
          <div className="stat-label">Correct Answers</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="dashboard-charts">
        {/* Accuracy Trend */}
        <div className="chart-card">
          <h3 className="chart-title">
            <LuTrendingUp /> Performance Trend
          </h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="quiz" stroke="#B5AFA4" fontSize={12} />
                <YAxis stroke="#B5AFA4" fontSize={12} domain={[0, 100]} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#D4645C"
                  strokeWidth={2.5}
                  dot={{ fill: '#D4645C', r: 4 }}
                  activeDot={{ r: 6, fill: '#B04A43' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Topic Coverage Radar */}
        {radarData.length >= 3 && (
          <div className="chart-card">
            <h3 className="chart-title">
              <LuTarget /> Topic Coverage
            </h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(0,0,0,0.06)" />
                  <PolarAngleAxis dataKey="topic" stroke="#B5AFA4" fontSize={11} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="rgba(0,0,0,0.04)" fontSize={10} />
                  <Radar dataKey="accuracy" stroke="#D4645C" fill="#D4645C" fillOpacity={0.12} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Difficulty Breakdown + Subject Performance */}
      <div className="dashboard-charts">
        <div className="chart-card">
          <h3 className="chart-title">Difficulty Breakdown</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={difficultyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="difficulty" stroke="#B5AFA4" fontSize={12} />
                <YAxis stroke="#B5AFA4" fontSize={12} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Bar dataKey="correct" fill="#4CAF82" radius={[4, 4, 0, 0]} name="Correct" />
                <Bar dataKey="total" fill="rgba(0,0,0,0.06)" radius={[4, 4, 0, 0]} name="Total" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Subject Accuracy</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={subjectData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis type="number" domain={[0, 100]} stroke="#B5AFA4" fontSize={12} />
                <YAxis dataKey="subject" type="category" stroke="#B5AFA4" fontSize={12} width={80} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Bar dataKey="accuracy" fill="#D4645C" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Weak Areas + Quick Actions */}
      <div className="dashboard-bottom">
        {/* Weak Areas */}
        <div className="glass-card weak-areas-card">
          <h3 className="card-title">
            <LuTriangleAlert style={{ color: '#E0A546' }} /> Weak Areas
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
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-weak-areas">🎉 No weak areas detected! Keep it up!</p>
          )}
          <Link to="/learning-path" className="btn btn-secondary btn-sm" style={{ marginTop: 'var(--s4)' }}>
            <LuRoute /> View AI Learning Path
          </Link>
        </div>

        {/* Recent Quizzes */}
        <div className="glass-card recent-quizzes-card">
          <h3 className="card-title">Recent Quizzes</h3>
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
        </div>
      </div>
    </div>
  );
}
