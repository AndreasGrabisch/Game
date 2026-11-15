import { loadProgress } from './Progress';
import { loadDetectiveProgress } from './detectiveProgress';
import { getOrCreateDailyMission } from './detectiveDaily';
import { getAppTotalStars } from './appProgress';
import { CORE_BIKE_MISSIONS } from './kidDifficultyCurve';
import { DETECTIVE_CASES } from '../data/detectiveCases';
import { getColorSortBestStars, getRideCompletionCount, loadAppTreasury, markMilestoneCelebrated } from './appTreasury';

export interface AppMilestone {
  id: string;
  emoji: string;
  title: string;
  cheer: string;
  isMet: () => boolean;
}

export const APP_MILESTONES: AppMilestone[] = [
  {
    id: 'bike_first',
    emoji: '🛞',
    title: 'Erstes Teil!',
    cheer: 'Wow! Dein Fahrrad wächst!',
    isMet: () => loadProgress().completedMissions.length >= 1,
  },
  {
    id: 'bike_core_3',
    emoji: '🚲',
    title: '3 Teile fertig!',
    cheer: 'Probefahrt! Das Rad rollt!',
    isMet: () => CORE_BIKE_MISSIONS.every((id) => loadProgress().completedMissions.includes(id)),
  },
  {
    id: 'bike_bell',
    emoji: '🔔',
    title: 'Klingel-Held',
    cheer: 'Ting-ting! Bonus-Sticker!',
    isMet: () => loadProgress().completedMissions.includes('mission-04-bell'),
  },
  {
    id: 'detective_first',
    emoji: '🔍',
    title: '1. Fall gelöst',
    cheer: 'Super Detektiv!',
    isMet: () => loadDetectiveProgress().completedCases.length >= 1,
  },
  {
    id: 'detective_all',
    emoji: '🏆',
    title: 'Alle Detektiv-Fälle',
    cheer: 'Du bist Meisterdetektiv!',
    isMet: () => loadDetectiveProgress().completedCases.length >= DETECTIVE_CASES.length,
  },
  {
    id: 'stars_8',
    emoji: '⭐',
    title: '8 Sterne',
    cheer: 'So viele Sterne!',
    isMet: () => getAppTotalStars() >= 8,
  },
  {
    id: 'color_play',
    emoji: '🎨',
    title: 'Farben-Profi',
    cheer: 'Bunte Sterne gesammelt!',
    isMet: () => getColorSortBestStars() >= 2,
  },
  {
    id: 'ride_once',
    emoji: '🏁',
    title: 'Erste Fahrt',
    cheer: 'Über die Pfützen geschafft!',
    isMet: () => getRideCompletionCount() >= 1,
  },
];

export function getMilestoneById(id: string): AppMilestone | undefined {
  const found = APP_MILESTONES.find((m) => m.id === id);
  if (found) return found;
  if (id.startsWith('daily-')) {
    const daily = getOrCreateDailyMission();
    return {
      id,
      emoji: daily.rewardEmoji,
      title: 'Tages-Mission!',
      cheer: 'Heutige Mission geschafft!',
      isMet: () => daily.done,
    };
  }
  return undefined;
}

export function getPendingMilestones(): AppMilestone[] {
  const celebrated = new Set(loadAppTreasury().celebratedMilestones);
  const pending = APP_MILESTONES.filter((m) => m.isMet() && !celebrated.has(m.id));

  const daily = getOrCreateDailyMission();
  const dailyId = `daily-${daily.dateKey}`;
  if (daily.done && !celebrated.has(dailyId)) {
    pending.push({
      id: dailyId,
      emoji: daily.rewardEmoji,
      title: 'Tages-Mission!',
      cheer: 'Heutige Mission geschafft!',
      isMet: () => true,
    });
  }

  return pending;
}

export function celebrateMilestone(id: string): void {
  markMilestoneCelebrated(id);
}