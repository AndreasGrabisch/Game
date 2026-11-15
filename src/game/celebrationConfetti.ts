import Phaser from 'phaser';
import { drawStar } from './graphics';

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

    const p = scene.add
      .text(px, py, emojis[i % emojis.length], { fontSize: `${20 + (i % 3) * 4}px` })
      .setOrigin(0.5)
      .setDepth(depth);

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