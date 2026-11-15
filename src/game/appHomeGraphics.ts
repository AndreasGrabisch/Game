import Phaser from 'phaser';
import { COLORS } from './constants';
import { drawHubBikeIcon } from './bikeGraphics';
import { drawSoccerBall } from './objectGraphics';
import type { AppModeIcon } from '../data/appModes';
import type { HubWorldTier } from './hubWorldProgress';
import { paintCloudRow, paintFlowers, paintGrassBand, paintHills, paintKite, paintSun, paintVerticalSky } from './comicScenery';

export function drawPlaygroundSky(scene: Phaser.Scene, worldTier: HubWorldTier = 0): Phaser.GameObjects.Graphics {
  const { width, height } = scene.scale;
  const gfx = paintVerticalSky(scene, 0x9ed8ff, 0x7ec850);
  paintSun(scene, width * 0.88, height * 0.12, 36);
  paintCloudRow(scene, 46, 4);
  paintKite(scene, width * 0.16, height * 0.22, 0xff6b6b);
  paintHills(scene, height * 0.72);
  paintGrassBand(scene, height * 0.68);

  const swing = scene.add.graphics().setDepth(0);
  const sx = width * 0.08;
  const sy = height * 0.58;
  swing.lineStyle(4, 0x8b6914, 0.9);
  swing.lineBetween(sx, sy, sx + 36, sy - 48);
  swing.lineBetween(sx + 72, sy, sx + 36, sy - 48);
  swing.lineBetween(sx + 18, sy - 10, sx + 18, sy + 28);
  swing.lineBetween(sx + 54, sy - 10, sx + 54, sy + 28);
  swing.fillStyle(0xff6b35, 1);
  swing.fillRoundedRect(sx + 14, sy + 24, 44, 10, 4);
  swing.lineStyle(3, COLORS.outline, 0.55);
  swing.strokeRoundedRect(sx + 14, sy + 24, 44, 10, 4);

  const pathGfx = scene.add.graphics().setDepth(0);
  pathGfx.fillStyle(0xd4b896, 0.75);
  pathGfx.fillEllipse(width / 2, height * 0.9, width * 0.55, 40);
  pathGfx.lineStyle(3, COLORS.outline, 0.12);
  pathGfx.strokeEllipse(width / 2, height * 0.9, width * 0.55, 40);
  paintFlowers(scene, height * 0.8);

  const bush = scene.add.graphics().setDepth(0);
  for (let i = 0; i < 4; i++) {
    const bx = width * 0.28 + i * (width / 5.2);
    bush.fillStyle(i % 2 === 0 ? 0x3cba5a : 0x5cb04a, 1);
    bush.fillEllipse(bx, height * 0.74, 64, 32);
    bush.lineStyle(2, COLORS.outline, 0.15);
    bush.strokeEllipse(bx, height * 0.74, 64, 32);
    bush.fillStyle(0x7ee08a, 0.45);
    bush.fillEllipse(bx - 10, height * 0.72, 22, 12);
  }

  if (worldTier >= 1) {
    for (let i = 0; i < 3 + worldTier; i++) {
      const flag = scene.add.triangle(
        80 + i * (width / (4 + worldTier)),
        height * 0.76,
        0,
        0,
        14,
        22,
        0,
        44,
        [COLORS.bikeFrame, COLORS.success, 0x5b6ee1][i % 3],
      );
      flag.setStrokeStyle(2, COLORS.outline, 0.2);
      flag.setDepth(0);
    }
  }

  if (worldTier >= 2) {
    const arc = scene.add.graphics().setDepth(0);
    arc.lineStyle(4, COLORS.star, 0.65);
    arc.strokeCircle(width / 2, height * 0.88, width * 0.28);
  }

  if (worldTier >= 3) {
    const colors = [0xff6b6b, 0xffd93d, 0x6bcb77, 0x5b6ee1];
    for (let i = 0; i < 8; i++) {
      const bx = width * 0.12 + ((i * 97) % (width * 0.76));
      const balloon = scene.add.circle(bx, height * 0.2 + (i % 3) * 28, 16, colors[i % colors.length], 0.85);
      balloon.setStrokeStyle(2, COLORS.outline, 0.25);
      const string = scene.add.rectangle(bx, height * 0.2 + (i % 3) * 28 + 22, 2, 32, COLORS.outline, 0.35);
      balloon.setDepth(0);
      string.setDepth(0);
    }
  }

  void gfx;
  return gfx;
}

export function drawModeIcon(scene: Phaser.Scene, icon: AppModeIcon, scale = 1): Phaser.GameObjects.Container {
  const root = scene.add.container(0, 0);
  const s = scale;

  if (icon === 'bike') {
    root.add(drawHubBikeIcon(scene, s));
  } else if (icon === 'detective') {
    const glass = scene.add.circle(0, 0, 22 * s, 0xdcecff, 0.9);
    glass.setStrokeStyle(4 * s, 0x5b6ee1);
    const handle = scene.add.rectangle(18 * s, 18 * s, 28 * s, 8 * s, 0x8b6914);
    handle.setStrokeStyle(2 * s, COLORS.outline);
    handle.setAngle(-35);
    root.add([glass, handle]);
  } else if (icon === 'colors') {
    const colors = [0xff6b6b, 0xffd93d, 0x6bcb77, 0x5b6ee1];
    colors.forEach((c, i) => {
      const bucket = scene.add.rectangle(-24 * s + i * 16 * s, 6 * s, 14 * s, 18 * s, c);
      bucket.setStrokeStyle(2 * s, COLORS.outline);
      root.add(bucket);
    });
  } else if (icon === 'ball') {
    root.add(drawSoccerBall(scene, 20 * s));
  } else if (icon === 'ride') {
    const path = scene.add.graphics();
    path.lineStyle(5 * s, COLORS.success, 0.8);
    path.beginPath();
    path.moveTo(-30 * s, 12 * s);
    path.lineTo(-8 * s, -16 * s);
    path.lineTo(12 * s, -8 * s);
    path.lineTo(32 * s, 8 * s);
    path.strokePath();
    const flag = scene.add.rectangle(32 * s, -2 * s, 16 * s, 12 * s, COLORS.bikeFrame);
    flag.setStrokeStyle(2 * s, COLORS.outline);
    root.add([path, flag]);
  }

  return root;
}

export function drawHomeTitleBadge(scene: Phaser.Scene, x: number, y: number, scale: number): Phaser.GameObjects.Container {
  const root = scene.add.container(x, y);
  const ribbon = scene.add.rectangle(0, 0, 420 * scale, 72 * scale, COLORS.panel);
  ribbon.setStrokeStyle(4, COLORS.outline);
  const dotL = scene.add.circle(-180 * scale, 0, 8 * scale, COLORS.bikeFrame);
  const dotR = scene.add.circle(180 * scale, 0, 8 * scale, COLORS.samuelShirt);
  root.add([ribbon, dotL, dotR]);
  return root;
}