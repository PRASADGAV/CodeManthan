import quizData from '../data/quizData.js';
import { domainIdToLabel } from '../services/personalizedQuizService.js';

/** Radar axes = subjects in the quiz bank only (quizData). */
const SUBJECT_SHORT_LABELS = {
  'Full Stack Web Development': 'Full Stack',
  DSA: 'DSA',
  'OOPs using Java': 'OOP',
  'Software Engineering': 'SW Eng.',
  Finance: 'Finance',
};

export const SKILL_AXES = Object.keys(quizData).map((match) => ({
  match,
  label: SUBJECT_SHORT_LABELS[match] || match,
}));

export function getSkillRadarRows(subjectAccuracy = {}) {
  return SKILL_AXES.map(({ match, label }) => {
    const row = subjectAccuracy[match];
    const practiced = !!(row && row.total > 0);
    const accuracy = practiced ? Math.round((row.correct / row.total) * 100) : 0;
    return {
      skill: label,
      subjectKey: match,
      accuracy,
      practiced,
    };
  });
}

/** @returns {null | Array<{ skill: string, accuracy: number, practiced: boolean, baselineOnly?: boolean }>} */
export function getDomainRadarRows(user, performance) {
  const ids = user?.studyDomainIds;
  if (!ids || !ids.length) return null;
  const labels = ids.map(domainIdToLabel);
  const acc = performance?.domainAccuracy || {};
  const onboarding = user?.onboardingDomainScores || {};

  return labels.map((label) => {
    const row = acc[label];
    const fromQuizzes = !!(row && row.total > 0);
    let accuracy = 0;
    let practiced = false;
    let baselineOnly = false;
    if (fromQuizzes) {
      accuracy = Math.round((row.correct / row.total) * 100);
      practiced = true;
    } else if (typeof onboarding[label] === 'number') {
      accuracy = onboarding[label];
      baselineOnly = true;
    }
    return {
      skill: label,
      accuracy,
      practiced,
      baselineOnly,
    };
  });
}

export function getGuidanceSteps(performance, user) {
  const steps = [];
  const weakDomain = performance.domainWeakAreas?.[0];
  const weak = performance.weakAreas?.[0];

  if (user?.studyDomainIds?.length && weakDomain) {
    steps.push({
      n: 1,
      title: `Boost ${weakDomain.topic}`,
      detail: `Your personalized domain scores suggest extra practice in ${weakDomain.topic} (${weakDomain.accuracy}%). Short revision plus targeted questions work best.`,
    });
  } else if (weak) {
    steps.push({
      n: 1,
      title: 'Prioritize one weak topic',
      detail: `Your lowest recent score is on "${weak.topic}". Spend one short session on explanations, then retry a small quiz on that topic.`,
    });
  } else {
    steps.push({
      n: 1,
      title: 'Keep momentum',
      detail: 'No critical weak spots right now. Rotate subjects so skills stay balanced over time.',
    });
  }

  const hard = performance.difficultyBreakdown?.hard;
  const hardRatio = hard?.total > 0 ? hard.correct / hard.total : 1;
  steps.push({
    n: 2,
    title: hard?.total >= 2 && hardRatio < 0.55 ? 'Level up difficulty carefully' : 'Stretch with harder questions',
    detail:
      hard?.total >= 2 && hardRatio < 0.55
        ? 'Hard questions are still challenging. Master medium sets first, then return to hard mode in short bursts.'
        : 'When easy quizzes feel comfortable, move to medium or hard in the same topic to deepen understanding.',
  });

  steps.push({
    n: 3,
    title: 'Use your learning path',
    detail: 'The learning path turns patterns in your history into next steps. Check it after every few quizzes.',
  });

  return steps;
}

/**
 * @returns {Array<{ id: string, kind: 'focus' | 'explore' | 'habit' | 'celebrate', title: string, detail: string }>}
 */
export function getImprovementSuggestions(performance) {
  const out = [];
  const {
    weakAreas = [],
    strongAreas = [],
    overallAccuracy = 0,
    subjectAccuracy = {},
    difficultyBreakdown = {},
    domainWeakAreas = [],
  } = performance;

  domainWeakAreas.slice(0, 2).forEach((area, i) => {
    out.push({
      id: `domain-weak-${i}-${area.topic}`,
      kind: 'focus',
      title: `Domain focus: ${area.topic}`,
      detail: `About ${area.accuracy}% on recent attempts in this area—add drills and spaced review before moving on.`,
    });
  });

  SKILL_AXES.forEach(({ match, label }) => {
    const s = subjectAccuracy[match];
    if (!s || !s.total) {
      out.push({
        id: `explore-${match}`,
        kind: 'explore',
        title: `Try ${label}`,
        detail: 'No quiz data in this area yet. One short quiz here will reveal strengths and gaps.',
      });
    }
  });

  weakAreas.slice(0, 3).forEach((area, i) => {
    out.push({
      id: `weak-${i}-${area.topic}`,
      kind: 'focus',
      title: `Strengthen: ${area.topic}`,
      detail: `Currently around ${area.accuracy}% accuracy. Re-read core ideas, then take a shorter quiz on this topic before moving on.`,
    });
  });

  const hard = difficultyBreakdown.hard;
  if (hard && hard.total >= 4) {
    const hr = hard.correct / hard.total;
    if (hr < 0.45) {
      out.push({
        id: 'hard-struggle',
        kind: 'habit',
        title: 'Hard mode needs foundation',
        detail: 'Several hard quizzes scored low. Alternate: two medium quizzes, then one hard question set until scores stabilize.',
      });
    }
  }

  const med = difficultyBreakdown.medium;
  if (med && med.total >= 3 && med.correct / med.total >= 0.75 && (!hard || hard.total < 2)) {
    out.push({
      id: 'level-up',
      kind: 'habit',
      title: 'Ready for harder challenges',
      detail: 'Medium difficulty looks solid. Pick the same topic on hard difficulty to prepare for interviews and deeper exams.',
    });
  }

  if (overallAccuracy >= 75 && weakAreas.length === 0) {
    out.push({
      id: 'celebrate',
      kind: 'celebrate',
      title: 'Strong overall performance',
      detail: 'Keep mixing subjects so retention stays high, and teach a friend—explaining reveals blind spots.',
    });
  }

  strongAreas.slice(0, 2).forEach((area, i) => {
    out.push({
      id: `strong-${i}`,
      kind: 'celebrate',
      title: `Leverage strength: ${area.topic}`,
      detail: `You are doing well here (${area.accuracy}%). Use this confidence to tackle adjacent harder topics.`,
    });
  });

  if (out.length === 0) {
    out.push({
      id: 'default',
      kind: 'habit',
      title: 'Establish a steady rhythm',
      detail: 'Take quizzes on a predictable schedule—even two short sessions per week compound quickly.',
    });
  }

  const kindOrder = { focus: 0, explore: 1, habit: 2, celebrate: 3 };
  out.sort((a, b) => kindOrder[a.kind] - kindOrder[b.kind]);
  return out.slice(0, 7);
}
