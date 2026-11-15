export type DetectiveGearId =
  | 'magnifier'
  | 'tape'
  | 'flashlight'
  | 'uvLamp'
  | 'chalk';

export type DecoyId = 'sock' | 'duck' | 'banana' | 'car';

export interface DrawerItem {
  id: DetectiveGearId | DecoyId;
  label: string;
  emoji: string;
  kidLabel: string;
  isDetective: boolean;
}

export interface DetectiveGearItem {
  id: DetectiveGearId;
  label: string;
  emoji: string;
  kidLabel: string;
  isDetective: true;
}

export interface DecoyItem {
  id: DecoyId;
  label: string;
  emoji: string;
  kidLabel: string;
  isDetective: false;
}

export const DETECTIVE_GEAR: DetectiveGearItem[] = [
  { id: 'magnifier', label: 'Becherlupe', emoji: '🔍', kidLabel: 'Lupe', isDetective: true },
  { id: 'tape', label: 'Absperrband', emoji: '🚧', kidLabel: 'Band', isDetective: true },
  { id: 'flashlight', label: 'Taschenlampe', emoji: '🔦', kidLabel: 'Lampe', isDetective: true },
  { id: 'uvLamp', label: 'UV-Lampe', emoji: '💡', kidLabel: 'UV-Licht', isDetective: true },
  { id: 'chalk', label: 'Kreide', emoji: '✏️', kidLabel: 'Kreide', isDetective: true },
];

export const DECOY_ITEMS: DecoyItem[] = [
  { id: 'sock', label: 'Stricksocke', emoji: '🧦', kidLabel: 'Socke', isDetective: false },
  { id: 'duck', label: 'Gummiente', emoji: '🦆', kidLabel: 'Ente', isDetective: false },
  { id: 'banana', label: 'Banane', emoji: '🍌', kidLabel: 'Banane', isDetective: false },
  { id: 'car', label: 'Spielzeugauto', emoji: '🚗', kidLabel: 'Auto', isDetective: false },
];

export function getItemById(id: string): DrawerItem | undefined {
  return [...DETECTIVE_GEAR, ...DECOY_ITEMS].find((item) => item.id === id);
}

export function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
