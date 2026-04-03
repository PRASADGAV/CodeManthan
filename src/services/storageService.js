// Utility functions for local storage operations
// This replaces Firebase for now - can be swapped later

const STORAGE_KEYS = {
  USERS: 'codemanthan_users',
  CURRENT_USER: 'codemanthan_current_user',
  QUIZ_HISTORY: 'codemanthan_quiz_history',
  PERFORMANCE: 'codemanthan_performance',
  BADGES: 'codemanthan_badges',
  LEADERBOARD: 'codemanthan_leaderboard',
  EDUCATORS: 'codemanthan_educators',
  CUSTOM_QUIZZES: 'codemanthan_custom_quizzes',
};

// ===== Generic Storage Helpers =====
function getItem(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function setItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

// ===== User Management =====
export function getAllUsers() {
  return getItem(STORAGE_KEYS.USERS) || [];
}

export function getCurrentUser() {
  return getItem(STORAGE_KEYS.CURRENT_USER);
}

export function saveCurrentUser(user) {
  setItem(STORAGE_KEYS.CURRENT_USER, user);
  // Also update in users list
  const users = getAllUsers();
  const idx = users.findIndex(u => u.id === user.id);
  if (idx >= 0) {
    users[idx] = user;
  } else {
    users.push(user);
  }
  setItem(STORAGE_KEYS.USERS, users);
}

export function registerUser(userData) {
  const users = getAllUsers();
  const existing = users.find(u => u.email === userData.email);
  if (existing) return { success: false, message: 'Email already registered' };

  const newUser = {
    id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    name: userData.name,
    email: userData.email,
    password: userData.password, // In production, use proper hashing
    role: userData.role || 'student',
    classCode: userData.classCode || '',
    xp: 0,
    level: 1,
    badges: [],
    loginStreak: 0,
    lastLogin: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    avatar: userData.avatar || getRandomAvatar(),
  };

  users.push(newUser);
  setItem(STORAGE_KEYS.USERS, users);
  return { success: true, user: newUser };
}

export function loginUser(email, password) {
  const users = getAllUsers();
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return { success: false, message: 'Invalid email or password' };

  // Update login streak
  const lastLogin = new Date(user.lastLogin);
  const now = new Date();
  const diffDays = Math.floor((now - lastLogin) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) {
    user.loginStreak = (user.loginStreak || 0) + 1;
  } else if (diffDays > 1) {
    user.loginStreak = 1;
  }
  user.lastLogin = now.toISOString();

  saveCurrentUser(user);
  return { success: true, user };
}

export function logoutUser() {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

function getRandomAvatar() {
  const avatars = ['🧑‍🎓', '👩‍🎓', '🧑‍💻', '👨‍🔬', '👩‍🔬', '🧑‍🏫', '👨‍🎓', '👩‍💻'];
  return avatars[Math.floor(Math.random() * avatars.length)];
}

// ===== Quiz History =====
export function getQuizHistory(userId) {
  const history = getItem(STORAGE_KEYS.QUIZ_HISTORY) || {};
  return history[userId] || [];
}

export function saveQuizResult(userId, result) {
  const history = getItem(STORAGE_KEYS.QUIZ_HISTORY) || {};
  if (!history[userId]) history[userId] = [];
  
  const quizResult = {
    id: `quiz_${Date.now()}`,
    ...result,
    timestamp: new Date().toISOString(),
  };
  
  history[userId].push(quizResult);
  setItem(STORAGE_KEYS.QUIZ_HISTORY, history);
  
  // Update leaderboard
  updateLeaderboard(userId, result);
  
  return quizResult;
}

// ===== Performance Analytics =====
export function getPerformanceData(userId) {
  const history = getQuizHistory(userId);
  
  if (history.length === 0) {
    return {
      totalQuizzes: 0,
      totalQuestions: 0,
      totalCorrect: 0,
      overallAccuracy: 0,
      topicAccuracy: {},
      subjectAccuracy: {},
      difficultyBreakdown: { easy: { correct: 0, total: 0 }, medium: { correct: 0, total: 0 }, hard: { correct: 0, total: 0 } },
      streakData: [],
      recentTrend: [],
      timePerQuestion: [],
      weakAreas: [],
      strongAreas: [],
    };
  }

  let totalCorrect = 0;
  let totalQuestions = 0;
  const topicAccuracy = {};
  const subjectAccuracy = {};
  const difficultyBreakdown = { easy: { correct: 0, total: 0 }, medium: { correct: 0, total: 0 }, hard: { correct: 0, total: 0 } };
  
  history.forEach(quiz => {
    totalCorrect += quiz.correctAnswers;
    totalQuestions += quiz.totalQuestions;
    
    // Topic accuracy
    const topicKey = `${quiz.subject} > ${quiz.topic}`;
    if (!topicAccuracy[topicKey]) topicAccuracy[topicKey] = { correct: 0, total: 0 };
    topicAccuracy[topicKey].correct += quiz.correctAnswers;
    topicAccuracy[topicKey].total += quiz.totalQuestions;
    
    // Subject accuracy
    if (!subjectAccuracy[quiz.subject]) subjectAccuracy[quiz.subject] = { correct: 0, total: 0 };
    subjectAccuracy[quiz.subject].correct += quiz.correctAnswers;
    subjectAccuracy[quiz.subject].total += quiz.totalQuestions;
    
    // Difficulty breakdown
    if (quiz.difficulty && difficultyBreakdown[quiz.difficulty]) {
      difficultyBreakdown[quiz.difficulty].correct += quiz.correctAnswers;
      difficultyBreakdown[quiz.difficulty].total += quiz.totalQuestions;
    }
  });

  // Calculate weak and strong areas
  const topicPerformance = Object.entries(topicAccuracy).map(([topic, data]) => ({
    topic,
    accuracy: Math.round((data.correct / data.total) * 100),
    total: data.total,
  }));

  const weakAreas = topicPerformance.filter(t => t.accuracy < 60).sort((a, b) => a.accuracy - b.accuracy);
  const strongAreas = topicPerformance.filter(t => t.accuracy >= 80).sort((a, b) => b.accuracy - a.accuracy);

  // Recent trend (last 10 quizzes)
  const recentTrend = history.slice(-10).map((quiz, idx) => ({
    quiz: idx + 1,
    accuracy: Math.round((quiz.correctAnswers / quiz.totalQuestions) * 100),
    date: new Date(quiz.timestamp).toLocaleDateString(),
    topic: quiz.topic,
  }));

  return {
    totalQuizzes: history.length,
    totalQuestions,
    totalCorrect,
    overallAccuracy: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
    topicAccuracy,
    subjectAccuracy,
    difficultyBreakdown,
    recentTrend,
    weakAreas,
    strongAreas,
    topicPerformance,
  };
}

// ===== Leaderboard =====
function updateLeaderboard(userId, quizResult) {
  const leaderboard = getItem(STORAGE_KEYS.LEADERBOARD) || {};
  const users = getAllUsers();
  const user = users.find(u => u.id === userId);
  if (!user) return;

  const classCode = user.classCode || 'global';
  if (!leaderboard[classCode]) leaderboard[classCode] = {};

  if (!leaderboard[classCode][userId]) {
    leaderboard[classCode][userId] = {
      name: user.name,
      avatar: user.avatar,
      xp: 0,
      quizzes: 0,
      accuracy: 0,
      totalCorrect: 0,
      totalQuestions: 0,
    };
  }

  const entry = leaderboard[classCode][userId];
  entry.xp = user.xp || 0;
  entry.quizzes += 1;
  entry.totalCorrect += quizResult.correctAnswers;
  entry.totalQuestions += quizResult.totalQuestions;
  entry.accuracy = Math.round((entry.totalCorrect / entry.totalQuestions) * 100);

  setItem(STORAGE_KEYS.LEADERBOARD, leaderboard);
}

export function getLeaderboard(classCode = 'global') {
  const leaderboard = getItem(STORAGE_KEYS.LEADERBOARD) || {};
  const classData = leaderboard[classCode] || {};
  
  return Object.entries(classData)
    .map(([userId, data]) => ({ userId, ...data }))
    .sort((a, b) => b.xp - a.xp);
}

// ===== Badge Management =====
export function getUserBadges(userId) {
  const badges = getItem(STORAGE_KEYS.BADGES) || {};
  return badges[userId] || [];
}

export function awardBadge(userId, badgeId) {
  const badges = getItem(STORAGE_KEYS.BADGES) || {};
  if (!badges[userId]) badges[userId] = [];
  
  if (!badges[userId].includes(badgeId)) {
    badges[userId].push(badgeId);
    setItem(STORAGE_KEYS.BADGES, badges);
    return true;
  }
  return false;
}

// ===== XP Management =====
export function addXP(userId, amount) {
  const users = getAllUsers();
  const user = users.find(u => u.id === userId);
  if (!user) return null;

  user.xp = (user.xp || 0) + amount;
  user.level = Math.floor(user.xp / 250) + 1;
  
  const idx = users.findIndex(u => u.id === userId);
  users[idx] = user;
  setItem(STORAGE_KEYS.USERS, users);
  
  // Update current user if same
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === userId) {
    saveCurrentUser(user);
  }

  return user;
}

// ===== Custom Quiz Management (Educator) =====
export function getCustomQuizzes(educatorId) {
  const quizzes = getItem(STORAGE_KEYS.CUSTOM_QUIZZES) || {};
  return quizzes[educatorId] || [];
}

export function saveCustomQuiz(educatorId, quiz) {
  const quizzes = getItem(STORAGE_KEYS.CUSTOM_QUIZZES) || {};
  if (!quizzes[educatorId]) quizzes[educatorId] = [];
  
  const newQuiz = {
    id: `custom_${Date.now()}`,
    ...quiz,
    createdAt: new Date().toISOString(),
  };
  
  quizzes[educatorId].push(newQuiz);
  setItem(STORAGE_KEYS.CUSTOM_QUIZZES, quizzes);
  return newQuiz;
}

// ===== Educator: Get All Students Data =====
export function getClassStudents(classCode) {
  const users = getAllUsers();
  return users.filter(u => u.role === 'student' && u.classCode === classCode);
}

export function getStudentPerformance(studentId) {
  return getPerformanceData(studentId);
}

// ===== Seed Demo Data =====
export function seedDemoData() {
  const users = getAllUsers();
  if (users.length > 0) return; // Already seeded

  // Create demo students
  const demoStudents = [
    { name: 'Alice Johnson', email: 'alice@demo.com', password: 'demo123', role: 'student', classCode: 'CLASS001', avatar: '👩‍🎓' },
    { name: 'Bob Smith', email: 'bob@demo.com', password: 'demo123', role: 'student', classCode: 'CLASS001', avatar: '🧑‍💻' },
    { name: 'Carol Davis', email: 'carol@demo.com', password: 'demo123', role: 'student', classCode: 'CLASS001', avatar: '👩‍🔬' },
    { name: 'David Lee', email: 'david@demo.com', password: 'demo123', role: 'student', classCode: 'CLASS001', avatar: '🧑‍🎓' },
    { name: 'Emma Wilson', email: 'emma@demo.com', password: 'demo123', role: 'student', classCode: 'CLASS001', avatar: '👩‍💻' },
  ];

  // Create demo educator
  const demoEducator = { name: 'Prof. Smith', email: 'prof@demo.com', password: 'demo123', role: 'educator', classCode: 'CLASS001', avatar: '🧑‍🏫' };
  
  demoStudents.forEach(s => registerUser(s));
  registerUser(demoEducator);

  // Seed some quiz history for demo students
  const subjects = ['Mathematics', 'Science', 'Computer Science'];
  const topics = {
    Mathematics: ['Algebra', 'Geometry', 'Calculus'],
    Science: ['Physics', 'Chemistry', 'Biology'],
    'Computer Science': ['Data Structures', 'Programming Basics', 'Databases'],
  };
  const difficulties = ['easy', 'medium', 'hard'];

  const allUsers = getAllUsers();
  const students = allUsers.filter(u => u.role === 'student');

  students.forEach(student => {
    const numQuizzes = Math.floor(Math.random() * 8) + 3;
    for (let i = 0; i < numQuizzes; i++) {
      const subject = subjects[Math.floor(Math.random() * subjects.length)];
      const topic = topics[subject][Math.floor(Math.random() * topics[subject].length)];
      const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
      const totalQuestions = Math.floor(Math.random() * 5) + 5;
      const correctAnswers = Math.floor(Math.random() * (totalQuestions + 1));
      
      saveQuizResult(student.id, {
        subject,
        topic,
        difficulty,
        totalQuestions,
        correctAnswers,
        timeTaken: Math.floor(Math.random() * 300) + 60,
        xpEarned: correctAnswers * 10,
      });
    }

    // Add some XP
    addXP(student.id, Math.floor(Math.random() * 500) + 100);
  });
}
