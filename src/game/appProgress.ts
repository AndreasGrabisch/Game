import { loadProgress } from './Progress';
import { getTotalDetectiveStars, loadDetectiveProgress } from './detectiveProgress';
import { getOrCreateDailyMission } from './detectiveDaily';
import { CORE_BIKE_MISSIONS } from './kidDifficultyCurve';
import { getColorSortBestStars } from './appTreasury';

export function getBikeMissionStars(): number {
  const progress = loadProgress();
  return Object.values(progress.stars).reduce((sum, n) => sum + n, 0);
}

export function getDetectiveStarsTotal(): number {
  return getTotalDetectiveStars();
}

export function getAppTotalStars(): number {
  return getBikeMissionStars() + getDetectiveStarsTotal() + getColorSortBestStars();
}

export interface AppRewardSummary {
  totalStars: number;
  bikeStars: number;
  detectiveStars: number;
  colorBest: number;
  dailyProgress: string;
  dailyDone: boolean;
  dailyEmoji: string;
  stickerCount: number;
}

export function getAppRewardSummary(): AppRewardSummary {
  const daily = getOrCreateDailyMission();
  const det = loadDetectiveProgress();
  return {
    totalStars: getAppTotalStars(),
    bikeStars: getBikeMissionStars(),
    detectiveStars: getDetectiveStarsTotal(),
    colorBest: getColorSortBestStars(),
    dailyProgress: `${daily.progress}/${daily.target}`,
    dailyDone: daily.done,
    dailyEmoji: daily.rewardEmoji,
    stickerCount: det.stickers.length + loadProgress().completedMissions.length,
  };
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