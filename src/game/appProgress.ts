import { loadProgress } from './Progress';
import { getTotalDetectiveStars } from './detectiveProgress';
import { CORE_BIKE_MISSIONS } from './kidDifficultyCurve';

export function getBikeMissionStars(): number {
  const progress = loadProgress();
  return Object.values(progress.stars).reduce((sum, n) => sum + n, 0);
}

export function getDetectiveStarsTotal(): number {
  return getTotalDetectiveStars();
}

export function getAppTotalStars(): number {
  return getBikeMissionStars() + getDetectiveStarsTotal();
}

export function isRideUnlocked(): boolean {
  const p = loadProgress();
  return CORE_BIKE_MISSIONS.every((id) => p.completedMissions.includes(id));
}

export function getBikeBuildProgressLabel(): string {
  const p = loadProgress();
  const core = CORE_BIKE_MISSIONS.filter((id) => p.completedMissions.includes(id)).length;
  const bell = p.completedMissions.includes('mission-04-bell');
  return bell ? `${core}/3 + 🔔` : `${core}/3 Teile`;
}