import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getLeaderboard } from '../services/storageService';
import { LuTrophy, LuMedal, LuTarget, LuZap, LuFlame } from 'react-icons/lu';
import './Leaderboard.css';

export default function Leaderboard() {
  const { user } = useAuth();

  const leaderboardData = useMemo(() => {
    const classCode = user?.classCode || 'global';
    return getLeaderboard(classCode);
  }, [user]);

  const getMedalIcon = (rank) => {
    if (rank === 0) return <span className="medal gold">🥇</span>;
    if (rank === 1) return <span className="medal silver">🥈</span>;
    if (rank === 2) return <span className="medal bronze">🥉</span>;
    return <span className="rank-number">{rank + 1}</span>;
  };

  return (
    <div className="leaderboard-page animate-fadeIn">
      <div className="page-header">
        <div className="page-header-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24' }}>
          <LuTrophy />
        </div>
        <div>
          <h1>Class Leaderboard</h1>
          <p>Class: {user?.classCode || 'Global'} • Compete with your peers!</p>
        </div>
      </div>

      {/* Top 3 Podium */}
      {leaderboardData.length >= 3 && (
        <div className="podium">
          {/* 2nd Place */}
          <div className="podium-item podium-2 animate-fadeInUp delay-2">
            <div className="podium-avatar">{leaderboardData[1]?.avatar || '🧑‍🎓'}</div>
            <div className="podium-medal">🥈</div>
            <div className="podium-name">{leaderboardData[1]?.name}</div>
            <div className="podium-xp">{leaderboardData[1]?.xp} XP</div>
            <div className="podium-bar podium-bar-2"></div>
          </div>
          {/* 1st Place */}
          <div className="podium-item podium-1 animate-fadeInUp delay-1">
            <div className="podium-crown">👑</div>
            <div className="podium-avatar">{leaderboardData[0]?.avatar || '🧑‍🎓'}</div>
            <div className="podium-medal">🥇</div>
            <div className="podium-name">{leaderboardData[0]?.name}</div>
            <div className="podium-xp">{leaderboardData[0]?.xp} XP</div>
            <div className="podium-bar podium-bar-1"></div>
          </div>
          {/* 3rd Place */}
          <div className="podium-item podium-3 animate-fadeInUp delay-3">
            <div className="podium-avatar">{leaderboardData[2]?.avatar || '🧑‍🎓'}</div>
            <div className="podium-medal">🥉</div>
            <div className="podium-name">{leaderboardData[2]?.name}</div>
            <div className="podium-xp">{leaderboardData[2]?.xp} XP</div>
            <div className="podium-bar podium-bar-3"></div>
          </div>
        </div>
      )}

      {/* Full Rankings Table */}
      <div className="leaderboard-table glass-card">
        <div className="leaderboard-header-row">
          <span className="lb-col-rank">Rank</span>
          <span className="lb-col-name">Student</span>
          <span className="lb-col-stat">XP</span>
          <span className="lb-col-stat">Quizzes</span>
          <span className="lb-col-stat">Accuracy</span>
        </div>

        {leaderboardData.length > 0 ? (
          <div className="leaderboard-body">
            {leaderboardData.map((entry, idx) => (
              <div
                key={entry.userId}
                className={`leaderboard-row ${entry.userId === user?.id ? 'is-me' : ''}`}
                id={`leaderboard-row-${idx}`}
              >
                <span className="lb-col-rank">{getMedalIcon(idx)}</span>
                <span className="lb-col-name">
                  <span className="lb-avatar">{entry.avatar || '🧑‍🎓'}</span>
                  <span className="lb-name-text">
                    {entry.name}
                    {entry.userId === user?.id && <span className="lb-you-badge">You</span>}
                  </span>
                </span>
                <span className="lb-col-stat">
                  <LuZap style={{ color: '#D4645C' }} /> {entry.xp}
                </span>
                <span className="lb-col-stat">
                  <LuTarget style={{ color: '#6ee7b7' }} /> {entry.quizzes}
                </span>
                <span className="lb-col-stat">
                  <LuFlame style={{ color: '#fbbf24' }} /> {entry.accuracy}%
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state" style={{ padding: 'var(--space-12)' }}>
            <LuTrophy style={{ width: 60, height: 60 }} />
            <h3>No rankings yet</h3>
            <p>Complete quizzes to appear on the leaderboard!</p>
          </div>
        )}
      </div>
    </div>
  );
}
