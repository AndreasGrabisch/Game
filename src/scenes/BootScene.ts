import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../game/constants';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // All graphics are drawn procedurally — no external assets needed for MVP
  }

  create(): void {
    this.scale.on('resize', this.resize, this);
    this.scene.start('MenuScene');
  }

  private resize(gameSize: Phaser.Structs.Size): void {
    const width = gameSize.width;
    const height = gameSize.height;
    this.cameras.resize(width, height);
  }
}

export function getScaleFactor(scene: Phaser.Scene): number {
  const { width, height } = scene.scale;
  return Math.min(width / GAME_WIDTH, height / GAME_HEIGHT);
}

export function getGameCenter(scene: Phaser.Scene): { x: number; y: number; scale: number } {
  const scale = getScaleFactor(scene);
  return {
    x: scene.scale.width / 2,
    y: scene.scale.height / 2,
    scale,
  };
}
