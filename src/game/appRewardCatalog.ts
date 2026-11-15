import { PART_LABELS, type VehiclePart } from './constants';
import { loadProgress } from './Progress';
import { loadDetectiveProgress } from './detectiveProgress';
import { getOrCreateDailyMission } from './detectiveDaily';
import { DETECTIVE_CASES } from '../data/detectiveCases';
import { APP_MILESTONES } from './appMilestones';
import {
  getBallGameWinCount,
  getBallSuperRoundCount,
  getColorSortBestStars,
  getRideCompletionCount,
  loadAppTreasury,
  type TreasurySticker,
} from './appTreasury';

const BIKE_PART_ICONS: Record<VehiclePart, string> = {
  wheels: '🛞',
  pedals: '⚙️',
  handlebar: '🎯',
  bell: '🔔',
};

const BIKE_MISSION_PART: Record<string, VehiclePart> = {
  'mission-01-wheels': 'wheels',
  'mission-02-pedals': 'pedals',
  'mission-03-handlebar': 'handlebar',
  'mission-04-bell': 'bell',
};

export function buildTreasuryStickers(): TreasurySticker[] {
  const items: TreasurySticker[] = [];
  const bike = loadProgress();
  const det = loadDetectiveProgress();
  const daily = getOrCreateDailyMission();
  const treasury = loadAppTreasury();

  for (const missionId of bike.completedMissions) {
    const part = BIKE_MISSION_PART[missionId];
    if (!part) continue;
    const stars = bike.stars[missionId] ?? 1;
    items.push({
      id: `bike-${missionId}`,
      emoji: BIKE_PART_ICONS[part],
      label: `${PART_LABELS[part]} · ${stars}⭐`,
      source: 'bike',
      unlocked: true,
    });
  }

  for (const emoji of det.stickers) {
    const caseMatch = DETECTIVE_CASES.find((c) => c.stickerReward === emoji);
    items.push({
      id: `det-sticker-${emoji}`,
      emoji,
      label: caseMatch ? `Sticker: ${caseMatch.title}` : `Detektiv ${emoji}`,
      source: 'detective',
      unlocked: true,
    });
  }

  for (const caseId of det.badges) {
    const c = DETECTIVE_CASES.find((d) => d.id === caseId);
    if (!c) continue;
    items.push({
      id: `det-badge-${caseId}`,
      emoji: c.badgeEmoji,
      label: c.badgeLabel,
      source: 'detective',
      unlocked: true,
    });
  }

  const colorBest = getColorSortBestStars();
  if (colorBest > 0) {
    items.push({
      id: 'colors-best',
      emoji: '🎨',
      label: `Farben · bis ${colorBest}⭐`,
      source: 'colors',
      unlocked: true,
    });
  }

  if (getBallGameWinCount() > 0) {
    items.push({
      id: 'ball-champion',
      emoji: '⚽',
      label: `Ball · ${getBallGameWinCount()}× gefangen`,
      source: 'ball',
      unlocked: true,
    });
  }

  if (getBallSuperRoundCount() > 0) {
    items.push({
      id: 'ball-super-round',
      emoji: '✨',
      label: `Super-Runde · ${getBallSuperRoundCount()}×`,
      source: 'ball',
      unlocked: true,
    });
  }

  if (getRideCompletionCount() > 0) {
    items.push({
      id: 'ride-finish',
      emoji: '🏁',
      label: `Fahrten: ${getRideCompletionCount()}`,
      source: 'ride',
      unlocked: true,
    });
  }

  if (daily.done) {
    items.push({
      id: `daily-${daily.dateKey}`,
      emoji: daily.rewardEmoji,
      label: 'Tages-Mission heute',
      source: 'daily',
      unlocked: true,
    });
  }

  for (const milestoneId of treasury.celebratedMilestones) {
    const m = APP_MILESTONES.find((x) => x.id === milestoneId);
    if (!m) continue;
    items.push({
      id: `milestone-${milestoneId}`,
      emoji: m.emoji,
      label: m.title,
      source: 'milestone',
      unlocked: true,
    });
  }

  if (items.length === 0) {
    items.push({
      id: 'placeholder',
      emoji: '🎁',
      label: 'Spiel und sammle Sticker!',
      source: 'milestone',
      unlocked: false,
    });
  }

  return items;
}