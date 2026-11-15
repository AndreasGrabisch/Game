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
    sceneKey: 'WorkshopScene',
    accentColor: 0xff6b35,
  },
  {
    id: 'detective',
    title: 'Detektivspiel',
    tagline: 'Fälle lösen — Sterne & Sticker sammeln',
    emoji: '🔍',
    status: 'available',
    sceneKey: 'DetectiveHubScene',
    accentColor: 0x5b6ee1,
  },
  {
    id: 'colors',
    title: 'Farben sortieren',
    emoji: '🎨',
    tagline: 'Jede Sache in den richtigen Eimer',
    status: 'available',
    sceneKey: 'ColorSortScene',
    accentColor: 0x6bcb77,
  },
  {
    id: 'ball',
    title: 'Ballspiel',
    tagline: 'Fange die Bälle',
    emoji: '⚽',
    status: 'available',
    sceneKey: 'BallGameScene',
    accentColor: 0xffd93d,
  },
];

export function getMinigameById(id: string): MinigameDefinition | undefined {
  return MINIGAMES.find((g) => g.id === id);
}
