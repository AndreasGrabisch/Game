import Phaser from 'phaser';
import { COLORS } from './constants';

export function drawWorkshopBackdrop(scene: Phaser.Scene): void {
  const { width, height } = scene.scale;
  const floorY = height * 0.82;

  scene.add.rectangle(width / 2, height / 2, width, height, 0xfff4e8).setDepth(0);
  scene.add.rectangle(width / 2, floorY + height * 0.09, width, height * 0.36, 0xdcc7a8).setDepth(0);
  scene.add.rectangle(width / 2, height * 0.22, width * 0.92, height * 0.34, 0xfaf0dc).setDepth(0);
  scene.add.rectangle(width / 2, height * 0.38, width * 0.88, 8, COLORS.outline, 0.12).setDepth(0);

  const pegboard = scene.add.rectangle(width * 0.28, height * 0.24, width * 0.44, height * 0.26, 0xede3d2);
  pegboard.setStrokeStyle(3, COLORS.outline, 0.35);
  pegboard.setDepth(0);

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 5; col++) {
      const dot = scene.add.circle(
        width * 0.16 + col * 46,
        height * 0.17 + row * 28,
        3,
        COLORS.outline,
        0.25,
      );
      dot.setDepth(0);
    }
  }

  const tools = [
    { x: width * 0.18, color: COLORS.bikeFrame },
    { x: width * 0.24, color: 0x8b6914 },
    { x: width * 0.3, color: 0x6bcb77 },
  ];
  tools.forEach((tool, index) => {
    const hook = scene.add.rectangle(tool.x, height * 0.19, 8, 22, tool.color);
    hook.setStrokeStyle(2, COLORS.outline);
    hook.setDepth(0);
    const head = scene.add.circle(tool.x, height * 0.24 + index * 0.001, 12, tool.color);
    head.setStrokeStyle(2, COLORS.outline);
    head.setDepth(0);
  });

  const shelf = scene.add.rectangle(width * 0.74, height * 0.22, width * 0.22, 12, 0x8b6914);
  shelf.setStrokeStyle(2, COLORS.outline, 0.4);
  shelf.setDepth(0);
  const jar = scene.add.rectangle(width * 0.7, height * 0.18, 26, 34, 0xc9e7ff, 0.85);
  jar.setStrokeStyle(2, COLORS.outline, 0.4);
  jar.setDepth(0);
}

export function drawColorSortBackdrop(scene: Phaser.Scene): void {
  const { width, height } = scene.scale;

  const sky = scene.add.graphics().setDepth(0);
  sky.fillGradientStyle(0xb8e7ff, 0xb8e7ff, 0xfdf0ff, 0xfdf0ff, 1);
  sky.fillRect(0, 0, width, height);

  const arcColors = [0xff6b6b, 0xffd93d, 0x6bcb77, 0x5b6ee1];
  arcColors.forEach((color, index) => {
    const arc = scene.add.arc(width / 2, height * 0.08, 200 + index * 42, 0, 180, false, color, 0.15);
    arc.setStrokeStyle(2, color, 0.2);
    arc.setDepth(0);
  });

  scene.add.rectangle(width / 2, height * 0.86, width, height * 0.28, COLORS.grass).setDepth(0);
  const mat = scene.add.ellipse(width / 2, height * 0.9, width * 0.8, 80, COLORS.panel, 0.9);
  mat.setStrokeStyle(3, COLORS.outline, 0.15);
  mat.setDepth(0);

  for (let i = 0; i < 6; i++) {
    const flower = scene.add.circle(80 + i * (width / 7), height * 0.8, 6, i % 2 === 0 ? 0xff8fab : 0xffd93d);
    flower.setStrokeStyle(2, COLORS.outline, 0.2);
    flower.setDepth(0);
  }
}

export function drawRideBackdrop(scene: Phaser.Scene, groundY: number, scale: number): void {
  const { width, height } = scene.scale;

  const skyGfx = scene.add.graphics().setDepth(0);
  skyGfx.fillGradientStyle(COLORS.sky, COLORS.sky, 0xc9eaff, 0xc9eaff, 1);
  skyGfx.fillRect(0, 0, width, height * 0.72);

  const sun = scene.add.circle(width * 0.86, height * 0.14, 38 * scale, COLORS.star, 0.95);
  sun.setStrokeStyle(3, COLORS.outline, 0.25);
  sun.setDepth(0);

  const hillFar = scene.add.ellipse(width * 0.35, groundY - 40 * scale, width * 0.9, 120 * scale, 0x8fd071, 0.55);
  hillFar.setDepth(0);
  const hillNear = scene.add.ellipse(width * 0.62, groundY - 20 * scale, width * 0.75, 90 * scale, COLORS.grass, 0.75);
  hillNear.setDepth(0);

  scene.add.rectangle(width / 2, height * 0.78, width, height * 0.44, COLORS.grass).setDepth(0);

  const road = scene.add.rectangle(width / 2, groundY + 18 * scale, width, 74 * scale, 0x5c6770);
  road.setStrokeStyle(3, COLORS.outline);
  road.setDepth(0);

  for (let i = 0; i < 12; i++) {
    const tuft = scene.add.ellipse(i * 90, groundY - 6 * scale, 22 * scale, 10 * scale, 0x5ea049, 0.8);
    tuft.setDepth(0);
  }
}

export function drawLockIcon(scene: Phaser.Scene, x: number, y: number, scale: number): Phaser.GameObjects.Container {
  const root = scene.add.container(x, y);
  const body = scene.add.rectangle(0, 6 * scale, 22 * scale, 18 * scale, 0xbbbbcc);
  body.setStrokeStyle(2, COLORS.outline);
  const shackle = scene.add.arc(0, -6 * scale, 10 * scale, 180, 360, false, undefined, 0);
  shackle.setStrokeStyle(3, COLORS.outline);
  root.add([body, shackle]);
  return root;
}