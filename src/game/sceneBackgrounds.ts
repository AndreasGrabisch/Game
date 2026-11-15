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

  const windowFrame = scene.add.graphics().setDepth(0);
  windowFrame.fillStyle(0xc9eaff, 0.65);
  windowFrame.lineStyle(4, COLORS.outline, 0.35);
  const wx = width * 0.62;
  const wy = height * 0.14;
  windowFrame.fillRoundedRect(wx, wy, width * 0.28, height * 0.22, 8);
  windowFrame.strokeRoundedRect(wx, wy, width * 0.28, height * 0.22, 8);
  windowFrame.lineStyle(3, COLORS.outline, 0.25);
  windowFrame.lineBetween(wx + (width * 0.28) / 2, wy, wx + (width * 0.28) / 2, wy + height * 0.22);
  windowFrame.lineBetween(wx, wy + height * 0.11, wx + width * 0.28, wy + height * 0.11);
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

/** Shared outdoor yard for bike missions. */
export function drawMissionYardBackdrop(scene: Phaser.Scene): void {
  const { width, height } = scene.scale;
  const g = scene.add.graphics().setDepth(0);
  g.fillGradientStyle(0xa8ddff, 0xa8ddff, 0xfff6e5, 0xfff6e5, 1);
  g.fillRect(0, 0, width, height);
  const sun = scene.add.circle(width * 0.84, height * 0.12, 36, COLORS.star, 0.92);
  sun.setStrokeStyle(3, COLORS.outline, 0.2);
  sun.setDepth(0);
  for (let i = 0; i < 5; i++) {
    const cloud = scene.add.ellipse(100 + i * (width / 5.5), 56 + (i % 2) * 22, 86, 36, COLORS.white, 0.92);
    cloud.setStrokeStyle(2, COLORS.outline, 0.08);
    cloud.setDepth(0);
  }
  scene.add.rectangle(width / 2, height * 0.82, width, height * 0.36, COLORS.grass).setDepth(0);
  const fence = scene.add.graphics().setDepth(0);
  fence.lineStyle(3, 0x8b6914, 0.8);
  for (let x = 40; x < width; x += 48) {
    fence.lineBetween(x, height * 0.68, x, height * 0.78);
  }
  fence.lineBetween(20, height * 0.72, width - 20, height * 0.72);
  const path = scene.add.ellipse(width / 2, height * 0.9, width * 0.5, 42, 0xdcc7a8, 0.75);
  path.setStrokeStyle(2, COLORS.outline, 0.15);
  path.setDepth(0);
}

export function drawDetectiveHubBackdrop(scene: Phaser.Scene): void {
  const { width, height } = scene.scale;
  const wall = scene.add.graphics().setDepth(0);
  wall.fillStyle(0xf3ece2, 1);
  wall.fillRect(0, 0, width, height);
  wall.fillStyle(0xe5d8c8, 1);
  wall.fillRect(0, height * 0.78, width, height * 0.22);
  const board = scene.add.rectangle(width / 2, height * 0.2, width * 0.88, height * 0.32, 0x8b6914, 0.35);
  board.setStrokeStyle(4, COLORS.outline, 0.25);
  board.setDepth(0);
  for (let i = 0; i < 8; i++) {
    const pin = scene.add.circle(width * 0.12 + i * (width / 9), height * 0.14, 5, i % 2 === 0 ? 0xff6b6b : 0x5b6ee1);
    pin.setStrokeStyle(2, COLORS.outline, 0.3);
    pin.setDepth(0);
  }
  const lamp = scene.add.circle(width * 0.9, height * 0.1, 22, 0xffe8a8, 0.7);
  lamp.setStrokeStyle(3, COLORS.outline, 0.3);
  lamp.setDepth(0);
}

export function drawDetectiveCabinetBackdrop(scene: Phaser.Scene): void {
  const { width, height } = scene.scale;
  scene.add.rectangle(width / 2, height / 2, width, height, 0xefe8db).setDepth(0);
  const carpet = scene.add.ellipse(width / 2, height * 0.92, width * 0.72, 54, 0xc9b89a, 0.55);
  carpet.setStrokeStyle(2, COLORS.outline, 0.15);
  carpet.setDepth(0);
  const frame = scene.add.graphics().setDepth(0);
  frame.lineStyle(6, 0x6b4f2a, 1);
  frame.strokeRoundedRect(width * 0.08, height * 0.1, width * 0.84, height * 0.7, 16);
  frame.lineStyle(3, 0xa67c52, 0.6);
  frame.strokeRoundedRect(width * 0.1, height * 0.12, width * 0.8, height * 0.66, 12);
}

export function drawTreasureChestBackdrop(scene: Phaser.Scene): void {
  const { width, height } = scene.scale;
  const g = scene.add.graphics().setDepth(0);
  g.fillGradientStyle(0x6b5be1, 0x6b5be1, 0xffeedd, 0xffeedd, 1);
  g.fillRect(0, 0, width, height);
  for (let i = 0; i < 12; i++) {
    const sparkle = scene.add.star(
      40 + (i * 73) % (width - 40),
      40 + (i % 4) * (height / 5),
      4,
      3,
      8,
      COLORS.star,
      0.35 + (i % 3) * 0.1,
    );
    sparkle.setDepth(0);
  }
  const chest = scene.add.graphics().setDepth(0);
  chest.fillStyle(0x8b6914, 0.25);
  chest.fillRoundedRect(width / 2 - 120, height * 0.82, 240, 48, 8);
}

export function drawComingSoonParkBackdrop(scene: Phaser.Scene): void {
  const { width, height } = scene.scale;
  scene.add.rectangle(width / 2, height / 2, width, height, COLORS.sky).setDepth(0);
  scene.add.rectangle(width / 2, height * 0.8, width, height * 0.4, COLORS.grass).setDepth(0);
  const goal = scene.add.rectangle(width * 0.72, height * 0.55, 8, 64, COLORS.white);
  goal.setStrokeStyle(3, COLORS.outline);
  goal.setDepth(0);
  const net = scene.add.rectangle(width * 0.72, height * 0.48, 48, 32, COLORS.white, 0.15);
  net.setStrokeStyle(2, COLORS.outline, 0.4);
  net.setDepth(0);
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