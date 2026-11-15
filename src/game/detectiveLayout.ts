import type Phaser from 'phaser';

export interface DetectiveLayoutMode {
  portrait: boolean;
  scaleMul: number;
}

export function getDetectiveLayoutMode(scene: Phaser.Scene): DetectiveLayoutMode {
  const { width, height } = scene.scale;
  const portrait = height > width;
  return {
    portrait,
    scaleMul: portrait ? 0.78 : 1,
  };
}