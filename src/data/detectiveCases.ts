import type { DecoyId, DetectiveGearId, DetectiveGearItem } from './detectiveItems';
import { getItemById } from './detectiveItems';

export interface DetectiveCaseDefinition {
  id: string;
  title: string;
  tagline: string;
  emoji: string;
  order: number;
  gearIds: DetectiveGearId[];
  decoyIds: DecoyId[];
  cols: number;
  rows: number;
  /** Nach so vielen falschen Schubladen erscheint Hilfe (0 = gleich sichtbar). */
  hintAfterDecoys: number;
  badgeEmoji: string;
  badgeLabel: string;
  stickerReward: string;
  introShort: string;
  winLine: string;
  unlockRequires?: string;
}

export const DETECTIVE_CASES: DetectiveCaseDefinition[] = [
  {
    id: 'case-cabinet',
    title: 'Fall 1: Der Schrank',
    tagline: 'Finde 5 Sachen im großen Schrank',
    emoji: '🗄️',
    order: 1,
    gearIds: ['magnifier', 'tape', 'flashlight', 'uvLamp', 'chalk'],
    decoyIds: ['sock', 'duck', 'banana', 'car'],
    cols: 3,
    rows: 3,
    hintAfterDecoys: 1,
    badgeEmoji: '🔍',
    badgeLabel: 'Schrank-Detektiv',
    stickerReward: '⭐',
    introShort: '🔍\nFinde 5 Sachen!',
    winLine: 'Samuel ist bereit für den Fall!',
    unlockRequires: undefined,
  },
  {
    id: 'case-park',
    title: 'Fall 2: Im Park',
    tagline: 'Nur 3 Sachen — schneller Einsatz!',
    emoji: '🌳',
    order: 2,
    gearIds: ['magnifier', 'flashlight', 'chalk'],
    decoyIds: ['sock', 'duck', 'banana'],
    cols: 3,
    rows: 2,
    hintAfterDecoys: 0,
    badgeEmoji: '🌟',
    badgeLabel: 'Park-Detektiv',
    stickerReward: '🎖️',
    introShort: '🌳\nFinde 3 Sachen!',
    winLine: 'Fall gelöst — toll gemacht!',
    unlockRequires: 'case-cabinet',
  },
  {
    id: 'case-kitchen',
    title: 'Fall 3: Küche',
    tagline: 'Nur 2 Sachen — Mini-Fall!',
    emoji: '🍪',
    order: 3,
    gearIds: ['flashlight', 'tape'],
    decoyIds: ['sock', 'duck'],
    cols: 2,
    rows: 2,
    hintAfterDecoys: 0,
    badgeEmoji: '🏅',
    badgeLabel: 'Küchen-Detektiv',
    stickerReward: '🧁',
    introShort: '🍪\nFinde 2 Sachen!',
    winLine: 'Küchen-Fall geschafft — super!',
    unlockRequires: 'case-park',
  },
];

export function getDetectiveCaseById(id: string): DetectiveCaseDefinition | undefined {
  return DETECTIVE_CASES.find((c) => c.id === id);
}

export function getGearForCase(caseDef: DetectiveCaseDefinition): DetectiveGearItem[] {
  return caseDef.gearIds.map((id) => getItemById(id)! as DetectiveGearItem);
}

export function getAllDrawerItemIds(caseDef: DetectiveCaseDefinition): string[] {
  return [...caseDef.gearIds, ...caseDef.decoyIds];
}