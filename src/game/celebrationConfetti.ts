import Phaser from 'phaser';
import { COLORS } from './constants';
import { drawStar } from './graphics';

const CONFETTI_COLORS = [0xff6b6b, 0xffd93d, 0x6bcb77, 0x5b6ee1, 0xff6b35];

const DEFAULT_EMOJIS = ['⭐', '✨', '🎉', '💫', '🌟'];

export interface ConfettiOptions {
  count?: number;
  emojis?: string[];
  mixStars?: boolean;
  depth?: number;
}

/** Shared win / milestone particles for kid-visible celebrations. */
export function playConfettiBurst(
  scene: Phaser.Scene,
  cx: number,
  cy: number,
  scale: number,
  options: ConfettiOptions = {},
): void {
  const count = options.count ?? 14;
  const emojis = options.emojis ?? DEFAULT_EMOJIS;
  const depth = options.depth ?? 45;
  const mixStars = options.mixStars ?? true;

  for (let i = 0; i < count; i++) {
    const px = cx + Phaser.Math.Between(-130, 130) * scale;
    const py = cy - Phaser.Math.Between(0, 60) * scale;

    if (mixStars && i % 3 === 0) {
      const star = drawStar(scene, px, py, (10 + (i % 3) * 4) * scale, true);
      star.setDepth(depth);
      scene.tweens.add({
        targets: star,
        y: cy + Phaser.Math.Between(50, 150) * scale,
        x: px + Phaser.Math.Between(-40, 40) * scale,
        alpha: 0,
        angle: Phaser.Math.Between(120, 240),
        duration: 850 + i * 40,
        ease: 'Cubic.easeOut',
        onComplete: () => star.destroy(),
      });
      continue;
    }

    const p = scene.add.circle(px, py, (6 + (i % 3) * 2) * scale, CONFETTI_COLORS[i % CONFETTI_COLORS.length]);
    p.setStrokeStyle(2, COLORS.outline);
    p.setDepth(depth);
    void emojis;

    scene.tweens.add({
      targets: p,
      y: cy + Phaser.Math.Between(-40, 130) * scale,
      x: p.x + Phaser.Math.Between(-70, 70) * scale,
      alpha: 0,
      angle: Phaser.Math.Between(-50, 50),
      duration: 900 + i * 35,
      ease: 'Cubic.easeOut',
      onComplete: () => p.destroy(),
    });
  }
}