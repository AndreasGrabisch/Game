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
  isDetective: boolean;
}

export interface DetectiveGearItem {
  id: DetectiveGearId;
  label: string;
  isDetective: true;
}

export interface DecoyItem {
  id: DecoyId;
  label: string;
  isDetective: false;
}

export const DETECTIVE_GEAR: DetectiveGearItem[] = [
  { id: 'magnifier', label: 'Becherlupe', isDetective: true },
  { id: 'tape', label: 'Absperrband', isDetective: true },
  { id: 'flashlight', label: 'Taschenlampe', isDetective: true },
  { id: 'uvLamp', label: 'UV-Lampe', isDetective: true },
  { id: 'chalk', label: 'Kreide', isDetective: true },
];

export const DECOY_ITEMS: DecoyItem[] = [
  { id: 'sock', label: 'Stricksocke', isDetective: false },
  { id: 'duck', label: 'Gummiente', isDetective: false },
  { id: 'banana', label: 'Banane', isDetective: false },
  { id: 'car', label: 'Spielzeugauto', isDetective: false },
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
