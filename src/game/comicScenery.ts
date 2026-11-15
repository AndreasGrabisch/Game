import Phaser from 'phaser';
import { COLORS } from './constants';

/** One graphics object per layer so backdrops stay cheap on phones. */

export function paintVerticalSky(
  scene: Phaser.Scene,
  top: number,
  bottom: number,
  depth = 0,
): Phaser.GameObjects.Graphics {
  const { width, height } = scene.scale;
  const g = scene.add.graphics().setDepth(depth);
  g.fillGradientStyle(top, top, bottom, bottom, 1);
  g.fillRect(0, 0, width, height);
  return g;
}

export function paintSun(scene: Phaser.Scene, x: number, y: number, radius: number, depth = 0): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics().setDepth(depth);
  g.lineStyle(4, 0xfff1a8, 0.9);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    g.lineBetween(
      x + Math.cos(a) * radius * 1.25,
      y + Math.sin(a) * radius * 1.25,
      x + Math.cos(a) * radius * 1.75,
      y + Math.sin(a) * radius * 1.75,
    );
  }
  g.fillStyle(COLORS.star, 1);
  g.fillCircle(x, y, radius);
  g.lineStyle(3, COLORS.outline, 0.28);
  g.strokeCircle(x, y, radius);
  g.fillStyle(0xffffff, 0.5);
  g.fillEllipse(x - radius * 0.28, y - radius * 0.3, radius * 0.42, radius * 0.28);
  return g;
}

function puff(g: Phaser.GameObjects.Graphics, x: number, y: number, scale: number): void {
  g.fillStyle(0xffffff, 0.95);
  g.fillEllipse(x, y, 74 * scale, 34 * scale);
  g.fillEllipse(x - 26 * scale, y + 6 * scale, 46 * scale, 28 * scale);
  g.fillEllipse(x + 28 * scale, y + 4 * scale, 50 * scale, 30 * scale);
  g.lineStyle(2, COLORS.outline, 0.12);
  g.strokeEllipse(x, y, 74 * scale, 34 * scale);
}

export function paintCloudRow(
  scene: Phaser.Scene,
  y: number,
  count: number,
  depth = 0,
): Phaser.GameObjects.Graphics {
  const { width } = scene.scale;
  const g = scene.add.graphics().setDepth(depth);
  const n = Math.max(1, Math.min(count, 6));
  for (let i = 0; i < n; i++) {
    const x = (width / (n + 1)) * (i + 1);
    puff(g, x, y + (i % 2) * 16, 0.82 + (i % 3) * 0.12);
  }
  return g;
}

export function paintHills(scene: Phaser.Scene, groundY: number, depth = 0): Phaser.GameObjects.Graphics {
  const { width } = scene.scale;
  const g = scene.add.graphics().setDepth(depth);
  g.fillStyle(0xb7e38a, 0.75);
  g.fillEllipse(width * 0.22, groundY, width * 0.8, 150);
  g.fillStyle(0x8ed060, 0.9);
  g.fillEllipse(width * 0.78, groundY + 16, width * 0.72, 120);
  return g;
}

export function paintGrassBand(scene: Phaser.Scene, topY: number, depth = 0): Phaser.GameObjects.Graphics {
  const { width, height } = scene.scale;
  const g = scene.add.graphics().setDepth(depth);
  const h = Math.max(8, height - topY);
  g.fillStyle(COLORS.grass, 1);
  g.fillRect(0, topY, width, h);
  g.fillStyle(0x68b84a, 0.28);
  for (let x = 0; x < width; x += 56) {
    g.fillRect(x, topY, 28, h);
  }
  g.fillStyle(0x3f9a45, 1);
  const tufts = Math.min(12, Math.ceil(width / 80));
  for (let i = 0; i < tufts; i++) {
    const x = 16 + i * (width / tufts);
    g.fillTriangle(x, topY + 6, x + 6, topY - 12, x + 12, topY + 6);
    g.fillTriangle(x + 8, topY + 6, x + 15, topY - 16, x + 22, topY + 6);
  }
  return g;
}

export function paintFlowers(scene: Phaser.Scene, y: number, depth = 0): Phaser.GameObjects.Graphics {
  const { width } = scene.scale;
  const g = scene.add.graphics().setDepth(depth);
  const colors = [0xff8fab, 0xffd93d, 0xffffff, 0xff6b6b, 0xc9a0ff];
  const n = Math.min(8, Math.ceil(width / 120));
  for (let i = 0; i < n; i++) {
    const x = 40 + i * ((width - 80) / Math.max(1, n - 1));
    g.lineStyle(2, 0x2f8a3c, 0.85);
    g.lineBetween(x, y, x, y - 16);
    g.fillStyle(colors[i % colors.length], 1);
    g.fillCircle(x, y - 18, 6);
    g.fillStyle(0xfff1a8, 1);
    g.fillCircle(x, y - 18, 2.2);
  }
  return g;
}

export function paintKite(
  scene: Phaser.Scene,
  x: number,
  y: number,
  color: number,
  depth = 0,
): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics().setDepth(depth);
  g.fillStyle(color, 1);
  g.lineStyle(2, COLORS.outline, 0.55);
  g.fillTriangle(x, y - 18, x + 14, y, x, y + 18);
  g.fillTriangle(x, y - 18, x - 14, y, x, y + 18);
  g.strokeTriangle(x, y - 18, x + 14, y, x, y + 18);
  g.strokeTriangle(x, y - 18, x - 14, y, x, y + 18);
  g.lineStyle(1.5, COLORS.outline, 0.35);
  g.lineBetween(x, y + 16, x - 18, y + 52);
  g.lineBetween(x - 18, y + 52, x - 28, y + 46);
  g.lineBetween(x - 18, y + 52, x - 10, y + 60);
  return g;
}
