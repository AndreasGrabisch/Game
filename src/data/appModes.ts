import { isRideUnlocked } from '../game/appProgress';

export type AppModeIcon = 'bike' | 'detective' | 'colors' | 'ride';

export interface AppHomeMode {
  id: string;
  title: string;
  tagline: string;
  shortKidLine: string;
  sceneKey: string;
  accentColor: number;
  icon: AppModeIcon;
  isUnlocked: () => boolean;
  lockHint: string;
}

export const APP_HOME_MODES: AppHomeMode[] = [
  {
    id: 'bike',
    title: 'Fahrrad-Werkstatt',
    tagline: 'Baue Samuels Fahrrad Stück für Stück',
    shortKidLine: 'Schrauben, Räder, los!',
    sceneKey: 'WorkshopScene',
    accentColor: 0xff6b35,
    icon: 'bike',
    isUnlocked: () => true,
    lockHint: '',
  },
  {
    id: 'detective',
    title: 'Detektiv',
    tagline: 'Fälle lösen und Sticker sammeln',
    shortKidLine: 'Suche Sachen im Schrank',
    sceneKey: 'DetectiveHubScene',
    accentColor: 0x5b6ee1,
    icon: 'detective',
    isUnlocked: () => true,
    lockHint: '',
  },
  {
    id: 'colors',
    title: 'Farben',
    tagline: 'Sortiere bunt in die Eimer',
    shortKidLine: 'Jede Farbe hat ihren Platz',
    sceneKey: 'ColorSortScene',
    accentColor: 0x6bcb77,
    icon: 'colors',
    isUnlocked: () => true,
    lockHint: '',
  },
  {
    id: 'ride',
    title: 'Probefahrt',
    tagline: 'Mit dem fertigen Rad übers Feld',
    shortKidLine: 'Spring und fahr!',
    sceneKey: 'RideScene',
    accentColor: 0x6bcb77,
    icon: 'ride',
    isUnlocked: isRideUnlocked,
    lockHint: 'Schaff erst alle 3 Fahrrad-Teile!',
  },
];