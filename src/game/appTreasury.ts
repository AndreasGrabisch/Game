const STORAGE_KEY = 'samuel-app-treasury';
const COLOR_BEST_KEY = 'samuel-color-stars';

export interface AppTreasuryState {
  celebratedMilestones: string[];
  rideCompletions: number;
  stickerTapCounts: Record<string, number>;
  ballGameWins: number;
}

const DEFAULT: AppTreasuryState = {
  celebratedMilestones: [],
  rideCompletions: 0,
  stickerTapCounts: {},
  ballGameWins: 0,
};

export function loadAppTreasury(): AppTreasuryState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT };
    const parsed = JSON.parse(raw) as AppTreasuryState;
    return {
      celebratedMilestones: parsed.celebratedMilestones ?? [],
      rideCompletions: parsed.rideCompletions ?? 0,
      stickerTapCounts: parsed.stickerTapCounts ?? {},
      ballGameWins: parsed.ballGameWins ?? 0,
    };
  } catch {
    return { ...DEFAULT };
  }
}

export function saveAppTreasury(state: AppTreasuryState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetAppTreasury(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function markMilestoneCelebrated(milestoneId: string): void {
  const state = loadAppTreasury();
  if (!state.celebratedMilestones.includes(milestoneId)) {
    state.celebratedMilestones.push(milestoneId);
    saveAppTreasury(state);
  }
}

export function recordRideCompletion(): number {
  const state = loadAppTreasury();
  state.rideCompletions += 1;
  saveAppTreasury(state);
  return state.rideCompletions;
}

export function getRideCompletionCount(): number {
  return loadAppTreasury().rideCompletions;
}

export function bumpStickerTap(stickerId: string): number {
  const state = loadAppTreasury();
  const next = (state.stickerTapCounts[stickerId] ?? 0) + 1;
  state.stickerTapCounts[stickerId] = next;
  saveAppTreasury(state);
  return next;
}

export function getColorSortBestStars(): number {
  try {
    const value = Number(localStorage.getItem(COLOR_BEST_KEY));
    return Number.isFinite(value) ? Math.max(0, Math.min(3, value)) : 0;
  } catch {
    return 0;
  }
}

export function recordBallGameWin(): { firstWin: boolean; total: number } {
  const state = loadAppTreasury();
  const firstWin = state.ballGameWins === 0;
  state.ballGameWins += 1;
  saveAppTreasury(state);
  return { firstWin, total: state.ballGameWins };
}

export function getBallGameWinCount(): number {
  return loadAppTreasury().ballGameWins;
}

export type TreasuryStickerSource = 'bike' | 'detective' | 'daily' | 'colors' | 'ride' | 'milestone' | 'ball';

export interface TreasurySticker {
  id: string;
  emoji: string;
  label: string;
  source: TreasuryStickerSource;
  unlocked: boolean;
}