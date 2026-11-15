import type Phaser from 'phaser';
import { feedbackSounds } from './feedbackAudio';
import {
  drawSamuelBust,
  drawSamuelSideView,
  playSamuelCheer,
  playSamuelOops,
  playSamuelThink,
  playSamuelWave,
  startSamuelIdle,
} from './samuelCharacter';

export function attachIdleBounce(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject, amount = 6, duration = 1200): void {
  startSamuelIdle(scene, target, amount, duration);
}

export function spawnSamuelCompanion(
  scene: Phaser.Scene,
  x: number,
  y: number,
  scale: number,
  depth = 6,
): Phaser.GameObjects.Container {
  const samuel = drawSamuelSideView(scene, x, y, scale);
  samuel.setDepth(depth);
  startSamuelIdle(scene, samuel, 5 * scale, 1100);
  return samuel;
}

export function spawnSamuelBuddy(
  scene: Phaser.Scene,
  x: number,
  y: number,
  scale: number,
  depth = 8,
): Phaser.GameObjects.Container {
  const buddy = drawSamuelBust(scene, x, y, scale);
  buddy.setDepth(depth);
  startSamuelIdle(scene, buddy, 4 * scale, 1000);
  return buddy;
}

export function reactCompanionWave(scene: Phaser.Scene, target?: Phaser.GameObjects.GameObject): void {
  if (!target) return;
  playSamuelWave(scene, target);
}

export function reactCompanionCheer(scene: Phaser.Scene, target?: Phaser.GameObjects.GameObject): void {
  if (!target) return;
  feedbackSounds.catch();
  playSamuelCheer(scene, target);
}

export function reactCompanionOops(scene: Phaser.Scene, target?: Phaser.GameObjects.GameObject): void {
  if (!target) return;
  playSamuelOops(scene, target);
}

export function reactCompanionThink(scene: Phaser.Scene, target?: Phaser.GameObjects.GameObject): void {
  if (!target) return;
  playSamuelThink(scene, target);
}

export function reactBuddyMood(
  scene: Phaser.Scene,
  buddy: Phaser.GameObjects.Container | undefined,
  mood: 'happy' | 'oops' | 'peek',
): void {
  if (!buddy) return;
  if (mood === 'happy') {
    playSamuelCheer(scene, buddy);
    return;
  }
  if (mood === 'oops') {
    playSamuelOops(scene, buddy);
    return;
  }
  playSamuelThink(scene, buddy);
}