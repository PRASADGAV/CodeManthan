import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserBadges, getPerformanceData } from '../services/storageService';
import { badgeDefinitions } from '../data/quizData';
import { LuUser, LuZap, LuStar, LuTrophy, LuTarget, LuFlame, LuCalendar } from 'react-icons/lu';
import './Profile.css';

export default function Profile() {
  const { user } = useAuth();

  const earnedBadgeIds = useMemo(() => getUserBadges(user?.id), [user?.id]);
  const performance = useMemo(() => getPerformanceData(user?.id), [user?.id]);

  const xpForNextLevel = 250;
  const currentLevelXP = (user?.xp || 0) % xpForNextLevel;
  const xpProgress = (currentLevelXP / xpForNextLevel) * 100;

  return (
    <div className="profile-page animate-fadeIn">
      {/* Profile Card */}
      <div className="profile-card glass-card">
        <div className="profile-avatar-section">
          <div className="profile-avatar-large">{user?.avatar || '🧑‍🎓'}</div>
          <div className="profile-info">
            <h1>{user?.name}</h1>
            <p className="profile-email">{user?.email}</p>
            <div className="profile-badges-inline">
              <span className="badge badge-primary">{user?.role}</span>
              {user?.classCode && <span className="badge badge-accent">Class: {user.classCode}</span>}
            </div>
          </div>
        </div>

        <div className="profile-stats-row">
          <div className="profile-stat">
            <LuZap className="profile-stat-icon" style={{ color: '#818cf8' }} />
            <div>
              <div className="profile-stat-value">{user?.xp || 0}</div>
              <div className="profile-stat-label">Total XP</div>
            </div>
          </div>
          <div className="profile-stat">
            <LuStar className="profile-stat-icon" style={{ color: '#10b981' }} />
            <div>
              <div className="profile-stat-value">Level {user?.level || 1}</div>
              <div className="profile-stat-label">Current Level</div>
            </div>
          </div>
          <div className="profile-stat">
            <LuTrophy className="profile-stat-icon" style={{ color: '#f59e0b' }} />
            <div>
              <div className="profile-stat-value">{earnedBadgeIds.length}</div>
              <div className="profile-stat-label">Badges</div>
            </div>
          </div>
          <div className="profile-stat">
            <LuTarget className="profile-stat-icon" style={{ color: '#f43f5e' }} />
            <div>
              <div className="profile-stat-value">{performance.overallAccuracy}%</div>
              <div className="profile-stat-label">Accuracy</div>
            </div>
          </div>
          <div className="profile-stat">
            <LuFlame className="profile-stat-icon" style={{ color: '#f59e0b' }} />
            <div>
              <div className="profile-stat-value">{user?.loginStreak || 0}</div>
              <div className="profile-stat-label">Day Streak</div>
            </div>
          </div>
          <div className="profile-stat">
            <LuCalendar className="profile-stat-icon" style={{ color: '#3b82f6' }} />
            <div>
              <div className="profile-stat-value">{performance.totalQuizzes}</div>
              <div className="profile-stat-label">Quizzes</div>
            </div>
          </div>
        </div>

        {/* XP Progress */}
        <div className="xp-progress-section">
          <div className="xp-progress-header">
            <span>Level {user?.level || 1}</span>
            <span>{currentLevelXP} / {xpForNextLevel} XP</span>
            <span>Level {(user?.level || 1) + 1}</span>
          </div>
          <div className="progress-bar" style={{ height: '12px' }}>
            <div className="progress-fill" style={{ width: `${xpProgress}%`, background: 'var(--gradient-primary)' }}></div>
          </div>
        </div>
      </div>

      {/* Badges Section */}
      <div className="badges-section">
        <h2 className="badges-title">
          <LuTrophy style={{ color: '#fbbf24' }} /> Badges & Achievements
        </h2>
        <p className="badges-subtitle">
          {earnedBadgeIds.length} / {badgeDefinitions.length} badges earned
        </p>

        <div className="badges-grid">
          {badgeDefinitions.map(badge => {
            const isEarned = earnedBadgeIds.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={`badge-card ${isEarned ? 'earned' : 'locked'}`}
                id={`badge-${badge.id}`}
              >
                <div className="badge-card-icon">{badge.icon}</div>
                <div className="badge-card-info">
                  <div className="badge-card-name">{badge.name}</div>
                  <div className="badge-card-desc">{badge.description}</div>
                  <div className="badge-card-reward">+{badge.xpReward} XP</div>
                </div>
                {isEarned && <div className="badge-earned-check">✓</div>}
                {!isEarned && <div className="badge-locked-icon">🔒</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
