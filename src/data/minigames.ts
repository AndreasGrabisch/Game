export type MinigameStatus = 'available' | 'coming_soon';

export interface MinigameDefinition {
  id: string;
  title: string;
  tagline: string;
  emoji: string;
  status: MinigameStatus;
  sceneKey: string;
  accentColor: number;
}

export const MINIGAMES: MinigameDefinition[] = [
  {
    id: 'bike',
    title: 'Samuel baut sein Fahrrad',
    tagline: 'Bau das Fahrrad in der Werkstatt',
    emoji: '🚲',
    status: 'available',
    sceneKey: 'MenuScene',
    accentColor: 0xff6b35,
  },
  {
    id: 'detective',
    title: 'Detektivspiel',
    tagline: 'Finde deine Sachen im Schrank',
    emoji: '🔍',
    status: 'available',
    sceneKey: 'DetectiveCabinetScene',
    accentColor: 0x5b6ee1,
  },
  {
    id: 'colors',
    title: 'Farben sortieren',
    tagline: 'Jede Sache in den richtigen Eimer',
    emoji: '🎨',
    status: 'available',
    sceneKey: 'ColorSortScene',
    accentColor: 0x6bcb77,
  },
];

export function getMinigameById(id: string): MinigameDefinition | undefined {
  return MINIGAMES.find((g) => g.id === id);
}
