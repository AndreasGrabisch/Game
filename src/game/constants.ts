export const COLORS = {
  sky: 0x87ceeb,
  grass: 0x7ec850,
  outline: 0x1a1a2e,
  samuelSkin: 0xffd5a8,
  samuelShirt: 0x4ecdc4,
  samuelPants: 0x5b6ee1,
  bikeFrame: 0xff6b35,
  wheel: 0x2d2d2d,
  wheelRim: 0xcccccc,
  success: 0x6bcb77,
  error: 0xff6b6b,
  star: 0xffd93d,
  white: 0xffffff,
  panel: 0xfff8e7,
} as const;

export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;

export const VEHICLE_PARTS = ['wheels', 'pedals', 'handlebar'] as const;
export type VehiclePart = (typeof VEHICLE_PARTS)[number];

export const PART_LABELS: Record<VehiclePart, string> = {
  wheels: 'Räder',
  pedals: 'Pedale & Kette',
  handlebar: 'Lenker',
};
