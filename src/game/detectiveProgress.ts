import type { DailyMissionState } from './detectiveDaily';

const STORAGE_KEY = 'samuel-detective-progress';

export interface DetectiveProgress {
  completedCases: string[];
  caseStars: Record<string, number>;
  stickers: string[];
  badges: string[];
  daily?: DailyMissionState;
  /** Schubladen-Mischen überspringen / sehr kurz (nur lokal). */
  fastShuffle?: boolean;
  hubTutorialSeen?: boolean;
}

const DEFAULT: DetectiveProgress = {
  completedCases: [],
  caseStars: {},
  stickers: [],
  badges: [],
};

export function loadDetectiveProgress(): DetectiveProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT, completedCases: [], caseStars: {}, stickers: [], badges: [] };
    const parsed = JSON.parse(raw) as DetectiveProgress;
    return {
      completedCases: parsed.completedCases ?? [],
      caseStars: parsed.caseStars ?? {},
      stickers: parsed.stickers ?? [],
      badges: parsed.badges ?? [],
      daily: parsed.daily,
      fastShuffle: parsed.fastShuffle ?? false,
      hubTutorialSeen: parsed.hubTutorialSeen ?? false,
    };
  } catch {
    return { ...DEFAULT };
  }
}

export function saveDetectiveProgress(progress: DetectiveProgress): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function isDetectiveCaseUnlocked(_caseId: string, unlockRequires?: string): boolean {
  if (!unlockRequires) return true;
  return loadDetectiveProgress().completedCases.includes(unlockRequires);
}

export function isDetectiveCaseComplete(caseId: string): boolean {
  return loadDetectiveProgress().completedCases.includes(caseId);
}

export function getDetectiveCaseStars(caseId: string): number {
  return loadDetectiveProgress().caseStars[caseId] ?? 0;
}

export function getTotalDetectiveStars(): number {
  const p = loadDetectiveProgress();
  return Object.values(p.caseStars).reduce((sum, n) => sum + n, 0);
}

export function awardDetectiveCase(
  caseId: string,
  stars: number,
  stickerEmoji: string,
  badgeId: string,
): DetectiveProgress {
  const progress = loadDetectiveProgress();
  if (!progress.completedCases.includes(caseId)) {
    progress.completedCases.push(caseId);
  }
  progress.caseStars[caseId] = Math.max(progress.caseStars[caseId] ?? 0, stars);
  if (!progress.stickers.includes(stickerEmoji)) {
    progress.stickers.push(stickerEmoji);
  }
  if (!progress.badges.includes(badgeId)) {
    progress.badges.push(badgeId);
  }
  saveDetectiveProgress(progress);
  return progress;
}

export function isFastShuffleEnabled(): boolean {
  return loadDetectiveProgress().fastShuffle === true;
}

export function setFastShuffle(enabled: boolean): void {
  const progress = loadDetectiveProgress();
  progress.fastShuffle = enabled;
  saveDetectiveProgress(progress);
}

export function hasSeenDetectiveHubTutorial(): boolean {
  return loadDetectiveProgress().hubTutorialSeen === true;
}

export function setDetectiveHubTutorialSeen(): void {
  const progress = loadDetectiveProgress();
  progress.hubTutorialSeen = true;
  saveDetectiveProgress(progress);
}

export function resetDetectiveProgress(): void {
  localStorage.removeItem(STORAGE_KEY);
}