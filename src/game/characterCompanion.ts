import type Phaser from 'phaser';
import { drawSamuel } from './graphics';

export function attachIdleBounce(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject, amount = 6, duration = 1200): void {
  const typed = target as Phaser.GameObjects.GameObject & { y: number };
  scene.tweens.add({
    targets: target,
    y: typed.y - amount,
    duration,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut',
  });
}

export function spawnSamuelCompanion(
  scene: Phaser.Scene,
  x: number,
  y: number,
  scale: number,
  depth = 6,
): Phaser.GameObjects.Container {
  const samuel = drawSamuel(scene, x, y, scale);
  samuel.setDepth(depth);
  attachIdleBounce(scene, samuel, 5 * scale, 1100);
  return samuel;
}