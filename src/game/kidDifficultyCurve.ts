/**
 * Kid difficulty curve (≈ age 6) — documented expectations for designers.
 *
 * **Bike mission chain** (workshop → missions → ride):
 * 1. Räder — drag & drop, binary choice (round vs square). Many retries OK.
 * 2. Pedale — ordered sequence (3 steps). One mistake hint, no timer.
 * 3. Lenker — lane choice, 5 catches. Forgiving spawn rate.
 * 4. Klingel — large tap targets, 3 hits, no time limit. Bonus; ride unlocks after #3.
 *
 * **Ride** — requires missions 1–3 only; short course (Round D).
 *
 * **Detective cases** (hub order):
 * 1. Schrank — 5 items, hints after 1 decoy.
 * 2. Park — 3 items, requires case 1.
 * 3. Küche — 2 items, requires case 2.
 *
 * **Hub world tiers** (`hubWorldProgress.ts`): visual rewards only, no harder gameplay.
 */

import { DETECTIVE_CASES } from '../data/detectiveCases';
import { MISSIONS } from '../data/missions';

export const BIKE_MISSION_ORDER = [
  'mission-01-wheels',
  'mission-02-pedals',
  'mission-03-handlebar',
  'mission-04-bell',
] as const;

export const CORE_BIKE_MISSIONS = BIKE_MISSION_ORDER.slice(0, 3);

export const DETECTIVE_CASE_ORDER = DETECTIVE_CASES.map((c) => c.id);

export function missionTitleById(id: string): string {
  return MISSIONS[id]?.title ?? id;
}