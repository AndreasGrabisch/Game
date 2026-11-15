import { loadProgress } from './Progress';
import { getTotalDetectiveStars } from './detectiveProgress';

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
  return (
    p.completedMissions.includes('mission-01-wheels') &&
    p.completedMissions.includes('mission-02-pedals') &&
    p.completedMissions.includes('mission-03-handlebar')
  );
}

export function getBikeBuildProgressLabel(): string {
  const p = loadProgress();
  const done = p.completedMissions.length;
  return `${done}/3 Teile`;
}