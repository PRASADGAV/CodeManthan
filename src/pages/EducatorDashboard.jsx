import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getClassStudents, getStudentPerformance, getAllUsers } from '../services/storageService';
import { LuUsers, LuTarget, LuTrendingUp, LuTriangleAlert, LuZap } from 'react-icons/lu';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

export default function EducatorDashboard() {
  const { user } = useAuth();

  const students = useMemo(() => {
    if (!user?.classCode) return getAllUsers().filter(u => u.role === 'student');
    return getClassStudents(user.classCode);
  }, [user]);

  const classData = useMemo(() => {
    const topicHeatmap = {};
    let totalAccuracy = 0;
    let totalQuizzes = 0;

    const studentDetails = students.map(student => {
      const perf = getStudentPerformance(student.id);
      totalAccuracy += perf.overallAccuracy;
      totalQuizzes += perf.totalQuizzes;

      // Aggregate topic performance
      (perf.topicPerformance || []).forEach(tp => {
        if (!topicHeatmap[tp.topic]) {
          topicHeatmap[tp.topic] = { totalAccuracy: 0, count: 0 };
        }
        topicHeatmap[tp.topic].totalAccuracy += tp.accuracy;
        topicHeatmap[tp.topic].count += 1;
      });

      return {
        ...student,
        performance: perf,
      };
    });

    const heatmapData = Object.entries(topicHeatmap).map(([topic, data]) => ({
      topic: topic.split(' > ').pop() || topic,
      avgAccuracy: Math.round(data.totalAccuracy / data.count),
    }));

    return {
      students: studentDetails,
      totalStudents: students.length,
      avgAccuracy: students.length > 0 ? Math.round(totalAccuracy / students.length) : 0,
      totalQuizzes,
      heatmapData,
    };
  }, [students]);

  const getHeatmapColor = (accuracy) => {
    if (accuracy >= 80) return { bg: 'rgba(16, 185, 129, 0.15)', color: '#6ee7b7' };
    if (accuracy >= 60) return { bg: 'rgba(59, 130, 246, 0.15)', color: '#93c5fd' };
    if (accuracy >= 40) return { bg: 'rgba(245, 158, 11, 0.15)', color: '#fcd34d' };
    return { bg: 'rgba(244, 63, 94, 0.15)', color: '#fda4af' };
  };

  const chartTooltipStyle = {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#f1f5f9',
    fontSize: '0.8rem',
  };

  // Per-student bar chart data
  const studentChartData = classData.students.map(s => ({
    name: s.name?.split(' ')[0] || 'Student',
    accuracy: s.performance.overallAccuracy,
    quizzes: s.performance.totalQuizzes,
  }));

  return (
    <div className="dashboard animate-fadeIn">
      <div className="dashboard-welcome">
        <div>
          <h1>Educator Dashboard 🧑‍🏫</h1>
          <p>Class Code: <strong>{user?.classCode || 'All Students'}</strong></p>
        </div>
      </div>

      {/* Stats */}
      <div className="educator-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8' }}>
            <LuUsers />
          </div>
          <div className="stat-value">{classData.totalStudents}</div>
          <div className="stat-label">Total Students</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#6ee7b7' }}>
            <LuTarget />
          </div>
          <div className="stat-value">{classData.avgAccuracy}%</div>
          <div className="stat-label">Average Accuracy</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#fcd34d' }}>
            <LuTrendingUp />
          </div>
          <div className="stat-value">{classData.totalQuizzes}</div>
          <div className="stat-label">Total Quizzes Taken</div>
        </div>
      </div>

      {/* Class-wide Heatmap */}
      <div className="chart-card" style={{ marginBottom: 'var(--space-8)' }}>
        <h3 className="chart-title">
          <LuTriangleAlert style={{ color: '#f59e0b' }} /> Class-Wide Weak Areas Heatmap
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 'var(--space-4)' }}>
          Color intensity shows average class accuracy per topic. Red = weak, Green = strong.
        </p>
        {classData.heatmapData.length > 0 ? (
          <div className="heatmap-grid">
            {classData.heatmapData.map((cell, idx) => {
              const colors = getHeatmapColor(cell.avgAccuracy);
              return (
                <div
                  key={idx}
                  className="heatmap-cell"
                  style={{ background: colors.bg }}
                >
                  <div className="heatmap-topic">{cell.topic}</div>
                  <div className="heatmap-value" style={{ color: colors.color }}>{cell.avgAccuracy}%</div>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', padding: 'var(--space-6) 0', textAlign: 'center' }}>
            No data yet. Students need to take quizzes first.
          </p>
        )}
      </div>

      {/* Per-Student Performance Chart */}
      {studentChartData.length > 0 && (
        <div className="chart-card" style={{ marginBottom: 'var(--space-8)' }}>
          <h3 className="chart-title">Student Performance Comparison</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={studentChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Bar dataKey="accuracy" fill="#818cf8" radius={[4, 4, 0, 0]} name="Accuracy %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Student List */}
      <div className="chart-card">
        <h3 className="chart-title">
          <LuUsers /> Student Drill-Down
        </h3>
        {classData.students.length > 0 ? (
          <div className="student-list">
            {classData.students.map(student => (
              <div key={student.id} className="student-row">
                <div className="student-row-info">
                  <div className="student-row-avatar">{student.avatar}</div>
                  <div>
                    <div className="student-row-name">{student.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Level {student.level || 1}</div>
                  </div>
                </div>
                <div className="student-row-stats">
                  <span><LuTarget /> {student.performance.overallAccuracy}%</span>
                  <span><LuTrendingUp /> {student.performance.totalQuizzes} quizzes</span>
                  <span><LuZap /> {student.xp || 0} XP</span>
                  {student.performance.weakAreas.length > 0 && (
                    <span style={{ color: 'var(--warning-400)' }}>
                      <LuTriangleAlert /> {student.performance.weakAreas.length} weak areas
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--space-8)' }}>
            No students found in this class.
          </p>
        )}
      </div>
    </div>
  );
}
