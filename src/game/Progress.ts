import { VEHICLE_PARTS, type VehiclePart } from './constants';

const STORAGE_KEY = 'samuel-bike-progress';

export interface GameProgress {
  unlockedParts: VehiclePart[];
  completedMissions: string[];
  stars: Record<string, number>;
}

const DEFAULT_PROGRESS: GameProgress = {
  unlockedParts: [],
  completedMissions: [],
  stars: {},
};

export function loadProgress(): GameProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PROGRESS };
    const parsed = JSON.parse(raw) as GameProgress;
    return {
      unlockedParts: parsed.unlockedParts ?? [],
      completedMissions: parsed.completedMissions ?? [],
      stars: parsed.stars ?? {},
    };
  } catch {
    return { ...DEFAULT_PROGRESS };
  }
}

export function saveProgress(progress: GameProgress): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function unlockPart(part: VehiclePart): GameProgress {
  const progress = loadProgress();
  if (!progress.unlockedParts.includes(part)) {
    progress.unlockedParts.push(part);
  }
  saveProgress(progress);
  return progress;
}

export function completeMission(missionId: string, stars: number): GameProgress {
  const progress = loadProgress();
  if (!progress.completedMissions.includes(missionId)) {
    progress.completedMissions.push(missionId);
  }
  progress.stars[missionId] = Math.max(progress.stars[missionId] ?? 0, stars);
  saveProgress(progress);
  return progress;
}

export function isPartUnlocked(part: VehiclePart): boolean {
  return loadProgress().unlockedParts.includes(part);
}

export function isMissionAvailable(missionId: string): boolean {
  const progress = loadProgress();
  if (missionId === 'mission-01-wheels') return true;
  if (missionId === 'mission-02-pedals') {
    return progress.completedMissions.includes('mission-01-wheels');
  }
  if (missionId === 'mission-03-handlebar') {
    return progress.completedMissions.includes('mission-02-pedals');
  }
  return false;
}

export function getNextMission(): string | null {
  const progress = loadProgress();
  for (const part of VEHICLE_PARTS) {
    const missionId = PART_TO_MISSION[part];
    if (!progress.completedMissions.includes(missionId)) {
      return missionId;
    }
  }
  return null;
}

const PART_TO_MISSION: Record<VehiclePart, string> = {
  wheels: 'mission-01-wheels',
  pedals: 'mission-02-pedals',
  handlebar: 'mission-03-handlebar',
};

export function resetProgress(): void {
  localStorage.removeItem(STORAGE_KEY);
}
