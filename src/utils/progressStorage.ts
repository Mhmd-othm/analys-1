import type { StudyGuideId } from '../math/index.ts';

const GOALS_KEY = 'ma1499-goals-v1';
const STATS_KEY = 'ma1499-stats-v1';

export interface GuideStats {
  attempted: number;
  correct: number;
}

export type GoalsProgressMap = Partial<Record<StudyGuideId, number[]>>;
export type StatsProgressMap = Partial<Record<StudyGuideId, GuideStats>>;

export function readGoalsProgress(): GoalsProgressMap {
  try {
    const raw = localStorage.getItem(GOALS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as GoalsProgressMap) : {};
  } catch {
    return {};
  }
}

export function toggleGoalCheck(guideId: StudyGuideId, goalIndex: number): GoalsProgressMap {
  const current = readGoalsProgress();
  const prevList = current[guideId] ?? [];
  const nextList = prevList.includes(goalIndex)
    ? prevList.filter((i) => i !== goalIndex)
    : [...prevList, goalIndex].sort((a, b) => a - b);
  const updated: GoalsProgressMap = { ...current, [guideId]: nextList };
  try {
    localStorage.setItem(GOALS_KEY, JSON.stringify(updated));
  } catch {
    // Ignorera om localStorage inte är tillgängligt
  }
  return updated;
}

export function readStatsProgress(): StatsProgressMap {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as StatsProgressMap) : {};
  } catch {
    return {};
  }
}

export function recordGuideAttempt(guideId: StudyGuideId, isCorrect: boolean): StatsProgressMap {
  const current = readStatsProgress();
  const prev = current[guideId] ?? { attempted: 0, correct: 0 };
  const updated: StatsProgressMap = {
    ...current,
    [guideId]: {
      attempted: prev.attempted + 1,
      correct: prev.correct + (isCorrect ? 1 : 0),
    },
  };
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(updated));
  } catch {
    // Ignorera om localStorage inte är tillgängligt
  }
  return updated;
}

export function clearAllProgress(): void {
  try {
    localStorage.removeItem(GOALS_KEY);
    localStorage.removeItem(STATS_KEY);
  } catch {
    // Ignorera om localStorage inte är tillgängligt
  }
}
