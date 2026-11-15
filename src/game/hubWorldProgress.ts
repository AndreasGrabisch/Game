import { loadProgress } from './Progress';
import { loadDetectiveProgress } from './detectiveProgress';
import { CORE_BIKE_MISSIONS } from './kidDifficultyCurve';
import { DETECTIVE_CASES } from '../data/detectiveCases';

/** Visual hub decoration tier — no gameplay effect. */
export type HubWorldTier = 0 | 1 | 2 | 3;

export function getHubWorldTier(): HubWorldTier {
  const bike = loadProgress();
  const det = loadDetectiveProgress();

  const coreDone = CORE_BIKE_MISSIONS.every((id) => bike.completedMissions.includes(id));
  const bellDone = bike.completedMissions.includes('mission-04-bell');
  const detDone = det.completedCases.length;
  const anyBike = bike.completedMissions.length > 0;

  if (bellDone || detDone >= DETECTIVE_CASES.length) return 3;
  if (coreDone) return 2;
  if (anyBike || detDone > 0) return 1;
  return 0;
}

export function isBonusWorldUnlocked(): boolean {
  return getHubWorldTier() >= 3;
}