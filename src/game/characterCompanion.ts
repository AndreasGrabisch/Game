import type Phaser from 'phaser';
import { feedbackSounds } from './feedbackAudio';
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

export function reactCompanionCheer(scene: Phaser.Scene, target?: Phaser.GameObjects.GameObject): void {
  if (!target) return;
  feedbackSounds.catch();
  scene.tweens.add({
    targets: target,
    scaleX: 1.12,
    scaleY: 1.12,
    duration: 220,
    yoyo: true,
    ease: 'Back.easeOut',
  });
}

export function reactCompanionOops(scene: Phaser.Scene, target?: Phaser.GameObjects.GameObject): void {
  if (!target) return;
  scene.tweens.add({
    targets: target,
    angle: -6,
    duration: 120,
    yoyo: true,
    repeat: 1,
    ease: 'Sine.easeInOut',
    onComplete: () => {
      if ((target as Phaser.GameObjects.GameObject & { angle?: number }).angle !== undefined) {
        (target as Phaser.GameObjects.GameObject & { angle: number }).angle = 0;
      }
    },
  });
}