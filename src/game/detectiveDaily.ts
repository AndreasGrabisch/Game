import { loadDetectiveProgress, saveDetectiveProgress } from './detectiveProgress';

export type DailyMissionKind = 'find_items' | 'open_drawers' | 'finish_case';

export interface DailyMissionState {
  dateKey: string;
  kind: DailyMissionKind;
  label: string;
  progress: number;
  target: number;
  done: boolean;
  rewardEmoji: string;
}

const MISSION_POOL: Omit<DailyMissionState, 'dateKey' | 'progress' | 'done'>[] = [
  { kind: 'find_items', label: 'Finde heute 2 Sachen', target: 2, rewardEmoji: '🌈' },
  { kind: 'open_drawers', label: 'Öffne heute 4 Schubladen', target: 4, rewardEmoji: '✨' },
  { kind: 'finish_case', label: 'Schaff heute einen Fall', target: 1, rewardEmoji: '🎯' },
];

function todayKey(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

function missionForDate(dateKey: string): (typeof MISSION_POOL)[number] {
  const parts = dateKey.split('-').map((p) => parseInt(p, 10));
  const seed = (parts[0] ?? 0) + (parts[1] ?? 0) * 31 + (parts[2] ?? 0) * 7;
  return MISSION_POOL[seed % MISSION_POOL.length];
}

export function getOrCreateDailyMission(): DailyMissionState {
  const progress = loadDetectiveProgress();
  const today = todayKey();
  if (progress.daily?.dateKey === today) {
    return progress.daily;
  }
  const base = missionForDate(today);
  const daily: DailyMissionState = {
    dateKey: today,
    kind: base.kind,
    label: base.label,
    target: base.target,
    rewardEmoji: base.rewardEmoji,
    progress: 0,
    done: false,
  };
  progress.daily = daily;
  saveDetectiveProgress(progress);
  return daily;
}

export interface DailyMissionBumpResult {
  daily: DailyMissionState;
  justCompleted: boolean;
}

export function bumpDailyMission(kind: DailyMissionKind, amount = 1): DailyMissionBumpResult {
  const progress = loadDetectiveProgress();
  const daily = getOrCreateDailyMission();
  if (daily.done || daily.kind !== kind) {
    return { daily, justCompleted: false };
  }

  const wasDone = daily.done;
  daily.progress = Math.min(daily.target, daily.progress + amount);
  let justCompleted = false;
  if (!wasDone && daily.progress >= daily.target) {
    daily.done = true;
    justCompleted = true;
    if (!progress.stickers.includes(daily.rewardEmoji)) {
      progress.stickers.push(daily.rewardEmoji);
    }
  }
  progress.daily = daily;
  saveDetectiveProgress(progress);
  return { daily, justCompleted };
}

export function dailyMissionSpeech(daily: DailyMissionState): string {
  if (daily.done) {
    return `Tages-Mission geschafft! Du hast den Sticker ${daily.rewardEmoji} verdient.`;
  }
  return `Deine Tages-Mission: ${daily.label}. Fortschritt: ${daily.progress} von ${daily.target}.`;
}