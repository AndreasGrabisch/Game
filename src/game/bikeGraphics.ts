import Phaser from 'phaser';
import { COLORS } from './constants';
export interface BikeDrawOptions {
  showWheels?: boolean;
  showFrame?: boolean;
  showPedals?: boolean;
  showHandlebar?: boolean;
  showBell?: boolean;
  wheelAlpha?: number;
  frameAlpha?: number;
}

const FRAME_HIGHLIGHT = 0xff8f5c;
const FRAME_SHADOW = 0xd94e22;
const TIRE_TREAD = 0x1a1a1a;

function tube(
  g: Phaser.GameObjects.Graphics,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  width: number,
  fill: number,
  alpha: number,
): void {
  g.lineStyle(width, fill, alpha);
  g.beginPath();
  g.moveTo(x0, y0);
  g.lineTo(x1, y1);
  g.strokePath();
  g.lineStyle(Math.max(2, width * 0.22), FRAME_HIGHLIGHT, alpha * 0.45);
  g.beginPath();
  g.moveTo(x0, y0);
  g.lineTo(x1, y1);
  g.strokePath();
}

export function drawCartoonWheel(
  scene: Phaser.Scene,
  x: number,
  y: number,
  radius: number,
  alpha = 1,
  variant: 'round' | 'square' = 'round',
): Phaser.GameObjects.Container {
  const container = scene.add.container(x, y);
  const outline = Math.max(2.5, radius * 0.09);

  if (variant === 'square') {
    const shadow = scene.add.rectangle(2, 3, radius * 1.5, radius * 1.5, 0x000000, 0.12 * alpha);
    const sq = scene.add.graphics();
    sq.fillStyle(COLORS.wheel, alpha);
    sq.lineStyle(outline, COLORS.outline, alpha);
    const half = radius * 0.72;
    sq.fillRoundedRect(-half, -half, half * 2, half * 2, 6);
    sq.strokeRoundedRect(-half, -half, half * 2, half * 2, 6);
  sq.lineStyle(2, COLORS.wheelRim, alpha * 0.5);
    sq.strokeCircle(0, 0, half * 0.35);
    const face = scene.add.graphics();
    face.lineStyle(2, COLORS.outline, alpha * 0.6);
    face.strokeCircle(-half * 0.25, -half * 0.15, 4);
    face.strokeCircle(half * 0.2, half * 0.1, 3);
    container.add([shadow, sq, face]);
    return container;
  }

  const shadow = scene.add.ellipse(2, radius * 0.12, radius * 1.85, radius * 0.45, 0x000000, 0.14 * alpha);
  const tire = scene.add.graphics();
  tire.fillStyle(TIRE_TREAD, alpha);
  tire.lineStyle(outline, COLORS.outline, alpha);
  tire.fillCircle(0, 0, radius);
  tire.strokeCircle(0, 0, radius);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    tire.fillStyle(0x3a3a3a, alpha * 0.85);
    tire.fillCircle(Math.cos(a) * radius * 0.92, Math.sin(a) * radius * 0.92, radius * 0.07);
  }
  const rim = scene.add.graphics();
  rim.fillStyle(COLORS.wheelRim, alpha);
  rim.lineStyle(outline * 0.65, COLORS.outline, alpha);
  rim.fillCircle(0, 0, radius * 0.58);
  rim.strokeCircle(0, 0, radius * 0.58);
  const spokes = scene.add.graphics();
  spokes.lineStyle(Math.max(2, outline * 0.45), COLORS.outline, alpha * 0.55);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    spokes.lineBetween(
      Math.cos(a) * radius * 0.15,
      Math.sin(a) * radius * 0.15,
      Math.cos(a) * radius * 0.52,
      Math.sin(a) * radius * 0.52,
    );
  }
  const hub = scene.add.circle(0, 0, radius * 0.14, 0x888888, alpha);
  hub.setStrokeStyle(2, COLORS.outline, alpha);
  const shine = scene.add.circle(-radius * 0.22, -radius * 0.22, radius * 0.12, COLORS.white, 0.35 * alpha);
  container.add([shadow, tire, rim, spokes, hub, shine]);
  return container;
}

export function drawCartoonBell(scene: Phaser.Scene, scale = 1): Phaser.GameObjects.Container {
  const s = scale;
  const c = scene.add.container(0, 0);
  const dome = scene.add.graphics();
  dome.fillStyle(COLORS.star, 1);
  dome.lineStyle(3 * s, COLORS.outline);
  dome.fillCircle(0, -2 * s, 11 * s);
  dome.strokeCircle(0, -2 * s, 11 * s);
  dome.fillStyle(FRAME_SHADOW, 0.35);
  dome.fillEllipse(0, 4 * s, 18 * s, 6 * s);
  dome.lineStyle(3 * s, COLORS.outline);
  dome.strokeEllipse(0, 4 * s, 18 * s, 6 * s);
  const clapper = scene.add.circle(0, 6 * s, 3.5 * s, 0xcc9933);
  clapper.setStrokeStyle(2 * s, COLORS.outline);
  const knob = scene.add.circle(0, -14 * s, 3 * s, COLORS.bikeFrame);
  knob.setStrokeStyle(2 * s, COLORS.outline);
  const shine = scene.add.ellipse(-4 * s, -6 * s, 8 * s, 5 * s, COLORS.white, 0.45);
  c.add([dome, clapper, knob, shine]);
  return c;
}

function drawFrameBody(g: Phaser.GameObjects.Graphics, s: number, alpha: number, line: number): void {
  const wx = 55 * s;
  const wy = 20 * s;
  g.fillStyle(COLORS.bikeFrame, alpha * 0.25);
  g.beginPath();
  g.moveTo(-wx, wy);
  g.lineTo(0, -30 * s);
  g.lineTo(wx, wy);
  g.lineTo(0, wy);
  g.closePath();
  g.fillPath();
  g.lineStyle(line, COLORS.outline, alpha);
  g.strokeCircle(-wx, wy, 38 * s);
  g.strokeCircle(wx, wy, 38 * s);

  tube(g, -wx, wy, 0, -30 * s, line * 1.15, COLORS.bikeFrame, alpha);
  tube(g, wx, wy, 0, -30 * s, line * 1.15, COLORS.bikeFrame, alpha);
  tube(g, 0, -30 * s, wx, wy, line * 1.05, FRAME_SHADOW, alpha * 0.85);
  tube(g, 0, -30 * s, 0, wy, line * 1.1, COLORS.bikeFrame, alpha);
  tube(g, 0, -30 * s, 0, -55 * s, line * 0.95, COLORS.bikeFrame, alpha);

  drawSeat(g, s, alpha, line);
}

function drawSeat(g: Phaser.GameObjects.Graphics, s: number, alpha: number, line: number): void {
  g.fillStyle(0x5c3d2e, alpha);
  g.lineStyle(line * 0.7, COLORS.outline, alpha);
  g.fillRoundedRect(-14 * s, -42 * s, 28 * s, 10 * s, 5);
  g.strokeRoundedRect(-14 * s, -42 * s, 28 * s, 10 * s, 5);
}

export function drawIllustratedBike(
  scene: Phaser.Scene,
  x: number,
  y: number,
  scale = 1,
  options: BikeDrawOptions = {},
): Phaser.GameObjects.Container {
  const {
    showWheels = false,
    showFrame = true,
    showPedals = false,
    showHandlebar = false,
    showBell = false,
    wheelAlpha = 1,
    frameAlpha = 1,
  } = options;

  const container = scene.add.container(x, y);
  const s = scale;
  const line = 3.8 * s;

  const ground = scene.add.ellipse(0, 58 * s, 130 * s, 22 * s, 0x000000, 0.1 * frameAlpha);
  container.add(ground);

  if (showFrame) {
    const frame = scene.add.graphics();
    drawFrameBody(frame, s, frameAlpha, line);
    container.add(frame);
  }

  if (showWheels) {
    for (const wx of [-55, 55]) {
      container.add(drawCartoonWheel(scene, wx * s, 20 * s, 36 * s, wheelAlpha, 'round'));
    }
  } else if (showFrame) {
    for (const wx of [-55, 55]) {
      const ghost = scene.add.graphics();
      ghost.lineStyle(2 * s, COLORS.outline, 0.35);
      ghost.strokeCircle(wx * s, 20 * s, 36 * s);
      ghost.lineStyle(1.5 * s, COLORS.bikeFrame, 0.25);
      ghost.strokeCircle(wx * s, 20 * s, 28 * s);
      container.add(ghost);
    }
  }

  if (showHandlebar) {
    const bar = scene.add.graphics();
    bar.lineStyle(line * 0.9, COLORS.bikeFrame, frameAlpha);
    bar.beginPath();
    bar.arc(0, -55 * s, 22 * s, Math.PI, 0, true);
    bar.strokePath();
    bar.lineStyle(line * 0.85, COLORS.outline, frameAlpha);
    bar.strokeCircle(-20 * s, -55 * s, 7 * s);
    bar.strokeCircle(20 * s, -55 * s, 7 * s);
    bar.fillStyle(0x333333, frameAlpha);
    bar.fillCircle(-20 * s, -55 * s, 6 * s);
    bar.fillCircle(20 * s, -55 * s, 6 * s);
    tube(bar, 0, -55 * s, 0, -30 * s, line * 0.75, COLORS.bikeFrame, frameAlpha);
    container.add(bar);
  }

  if (showPedals) {
    const drivetrain = scene.add.graphics();
    drivetrain.fillStyle(COLORS.wheel, frameAlpha);
    drivetrain.lineStyle(line * 0.65, COLORS.outline, frameAlpha);
    drivetrain.fillCircle(0, 20 * s, 11 * s);
    drivetrain.strokeCircle(0, 20 * s, 11 * s);
    drivetrain.lineStyle(2.5 * s, COLORS.wheelRim, frameAlpha);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      drivetrain.strokeCircle(Math.cos(a) * 18 * s, 20 * s + Math.sin(a) * 18 * s, 2.5 * s);
    }
    container.add(drivetrain);
    const crankL = scene.add.container(-16 * s, 20 * s);
    const crankR = scene.add.container(16 * s, 20 * s);
    for (const crank of [crankL, crankR]) {
      const arm = scene.add.rectangle(0, 0, 14 * s, 5 * s, COLORS.wheelRim);
      arm.setStrokeStyle(2 * s, COLORS.outline);
      const pedal = scene.add.graphics();
      pedal.fillStyle(0xff6b35, frameAlpha);
      pedal.lineStyle(2 * s, COLORS.outline, frameAlpha);
      pedal.fillRoundedRect(-10 * s, -5 * s, 20 * s, 10 * s, 4);
      pedal.strokeRoundedRect(-10 * s, -5 * s, 20 * s, 10 * s, 4);
      crank.add([arm, pedal]);
    }
    crankL.setAngle(-35);
    crankR.setAngle(35);
    container.add([crankL, crankR]);
  }

  if (showBell) {
    const bellMount = scene.add.container(-16 * s, -58 * s);
    bellMount.add(drawCartoonBell(scene, s));
    container.add(bellMount);
  }

  return container;
}

/** Compact bike for handlebar mission (top-down catch lane). */
export function drawBikeLaneAvatar(scene: Phaser.Scene, scale: number): {
  root: Phaser.GameObjects.Container;
  frontWheel: Phaser.GameObjects.Container;
} {
  const root = scene.add.container(0, 0);
  const s = scale;
  const shadow = scene.add.ellipse(0, 20 * s, 56 * s, 16 * s, 0x000000, 0.15);
  const rear = drawCartoonWheel(scene, 0, 18 * s, 16 * s, 1, 'round');
  rear.setScale(0.95, 0.55);

  const frame = scene.add.graphics();
  tube(frame, 0, 14 * s, 0, -8 * s, 5 * s, COLORS.bikeFrame, 1);
  tube(frame, 0, -8 * s, 0, -22 * s, 4 * s, COLORS.bikeFrame, 1);

  const frontWheel = scene.add.container(0, -26 * s);
  const tire = scene.add.ellipse(0, 0, 18 * s, 30 * s, TIRE_TREAD);
  tire.setStrokeStyle(2.5 * s, COLORS.outline);
  const rim = scene.add.ellipse(0, 0, 11 * s, 18 * s, COLORS.wheelRim);
  rim.setStrokeStyle(2 * s, COLORS.outline);
  const bar = scene.add.graphics();
  bar.lineStyle(3 * s, COLORS.bikeFrame);
  bar.beginPath();
  bar.arc(0, -12 * s, 14 * s, Math.PI, 0, true);
  bar.strokePath();
  frontWheel.add([tire, rim, bar]);

  const head = scene.add.circle(0, -6 * s, 11 * s, COLORS.samuelSkin);
  head.setStrokeStyle(2 * s, COLORS.outline);
  const hair = scene.add.ellipse(0, -14 * s, 18 * s, 9 * s, 0x5c3d2e);
  hair.setStrokeStyle(2 * s, COLORS.outline);
  const eyeL = scene.add.circle(-4 * s, -7 * s, 1.6 * s, COLORS.outline);
  const eyeR = scene.add.circle(4 * s, -7 * s, 1.6 * s, COLORS.outline);

  root.add([shadow, rear, frame, frontWheel, hair, head, eyeL, eyeR]);
  return { root, frontWheel };
}

export function drawPedalPartIcon(scene: Phaser.Scene, scale: number): Phaser.GameObjects.Container {
  const c = scene.add.container(0, 0);
  const s = scale;
  const crank = scene.add.graphics();
  tube(crank, -8 * s, 0, 12 * s, 0, 4 * s, COLORS.wheelRim, 1);
  crank.fillStyle(0xff6b35, 1);
  crank.lineStyle(2 * s, COLORS.outline);
  crank.fillRoundedRect(10 * s, -6 * s, 22 * s, 12 * s, 4);
  crank.strokeRoundedRect(10 * s, -6 * s, 22 * s, 12 * s, 4);
  c.add(crank);
  return c;
}

export function drawChainPartIcon(scene: Phaser.Scene, scale: number): Phaser.GameObjects.Container {
  const c = scene.add.container(0, 0);
  const g = scene.add.graphics();
  const s = scale;
  g.lineStyle(2.5 * s, COLORS.outline);
  for (let i = 0; i < 6; i++) {
    const x = -30 * s + i * 12 * s;
    g.fillStyle(i % 2 === 0 ? 0xbbbbbb : 0x999999, 1);
    g.fillCircle(x, 0, 5.5 * s);
    g.strokeCircle(x, 0, 5.5 * s);
  }
  g.lineStyle(2 * s, 0x777777, 0.8);
  g.strokeEllipse(0, 0, 38 * s, 16 * s);
  c.add(g);
  return c;
}

export function drawWheelPartIcon(scene: Phaser.Scene, scale: number): Phaser.GameObjects.Container {
  return drawCartoonWheel(scene, 0, 0, 22 * scale, 1, 'round');
}

export function drawHandlebarPartIcon(scene: Phaser.Scene, scale: number): Phaser.GameObjects.Container {
  const c = scene.add.container(0, 0);
  const s = scale;
  const bar = scene.add.graphics();
  bar.lineStyle(4 * s, COLORS.bikeFrame);
  bar.beginPath();
  bar.arc(0, 4 * s, 28 * s, Math.PI, 0, true);
  bar.strokePath();
  bar.fillStyle(0x333333, 1);
  bar.fillCircle(-26 * s, 4 * s, 7 * s);
  bar.fillCircle(26 * s, 4 * s, 7 * s);
  bar.lineStyle(3 * s, COLORS.outline);
  bar.strokeCircle(-26 * s, 4 * s, 7 * s);
  bar.strokeCircle(26 * s, 4 * s, 7 * s);
  tube(bar, 0, 4 * s, 0, 22 * s, 3 * s, COLORS.bikeFrame, 1);
  c.add(bar);
  return c;
}