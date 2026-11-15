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

export interface BicycleSideOptions {
  wheels?: boolean;
  pedals?: boolean;
  handlebar?: boolean;
  bell?: boolean;
  wheelAlpha?: number;
  frameAlpha?: number;
}

/** Canonical side-view layout in local px (multiplied by scale in drawings). */
export const BIKE_SIDE_PROFILE = {
  rearAxleX: -55,
  frontAxleX: 55,
  axleY: 20,
  wheelR: 36,
  bbX: -2,
  bbY: 20,
  seatX: -20,
  seatY: -46,
  seatPostTop: -30,
  headX: 38,
  headY: -38,
  forkTopX: 48,
  forkTopY: -8,
  stemBaseX: 42,
  stemBaseY: -36,
  barCenterX: 46,
  barCenterY: -58,
  barRadius: 22,
} as const;

const FRAME_HIGHLIGHT = 0xff8f5c;
const FRAME_SHADOW = 0xd94e22;
const TIRE = 0x1a1a1a;

function mapOptions(opts: BikeDrawOptions): BicycleSideOptions {
  return {
    wheels: opts.showWheels,
    pedals: opts.showPedals,
    handlebar: opts.showHandlebar,
    bell: opts.showBell,
    wheelAlpha: opts.wheelAlpha,
    frameAlpha: opts.showFrame === false ? 0 : opts.frameAlpha,
  };
}

function strokeTube(
  g: Phaser.GameObjects.Graphics,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  width: number,
  color: number,
  alpha: number,
): void {
  g.lineStyle(width, color, alpha);
  g.beginPath();
  g.moveTo(x0, y0);
  g.lineTo(x1, y1);
  g.strokePath();
  g.lineStyle(Math.max(2, width * 0.22), FRAME_HIGHLIGHT, alpha * 0.4);
  g.beginPath();
  g.moveTo(x0, y0);
  g.lineTo(x1, y1);
  g.strokePath();
}

/** Low-level painter at local origin (0,0). */
export function paintBicycleSideProfile(
  scene: Phaser.Scene,
  parent: Phaser.GameObjects.Container,
  scale: number,
  options: BicycleSideOptions,
): void {
  const s = scale;
  const {
    wheels = false,
    pedals = false,
    handlebar = false,
    bell = false,
    wheelAlpha = 1,
    frameAlpha = 1,
  } = options;
  const g = BIKE_SIDE_PROFILE;
  const tube = 4.2 * s;
  const R = g.wheelR * s;

  const shadow = scene.add.ellipse(0, (g.axleY + 38) * s, 122 * s, 18 * s, 0x000000, 0.1 * frameAlpha);
  parent.add(shadow);

  const frameGfx = scene.add.graphics();

  // Chainstay + seatstay + diamond frame
  strokeTube(frameGfx, g.rearAxleX * s, g.axleY * s, g.bbX * s, g.bbY * s, tube, COLORS.bikeFrame, frameAlpha);
  strokeTube(frameGfx, g.rearAxleX * s, g.axleY * s, g.seatX * s, g.seatPostTop * s, tube * 0.85, COLORS.bikeFrame, frameAlpha);
  strokeTube(frameGfx, g.bbX * s, g.bbY * s, g.seatX * s, g.seatPostTop * s, tube, COLORS.bikeFrame, frameAlpha);
  strokeTube(frameGfx, g.bbX * s, g.bbY * s, g.headX * s, g.headY * s, tube * 1.05, COLORS.bikeFrame, frameAlpha);
  strokeTube(
    frameGfx,
    g.seatX * s,
    g.seatPostTop * s,
    g.headX * s,
    g.headY * s,
    tube * 0.95,
    FRAME_SHADOW,
    frameAlpha * 0.95,
  );
  // Seat post
  strokeTube(frameGfx, g.seatX * s, g.seatPostTop * s, g.seatX * s, g.seatY * s, tube * 0.7, COLORS.bikeFrame, frameAlpha);
  // Fork blades
  strokeTube(frameGfx, g.forkTopX * s, g.forkTopY * s, g.frontAxleX * s, g.axleY * s, tube * 0.75, COLORS.bikeFrame, frameAlpha);
  strokeTube(frameGfx, g.headX * s, g.headY * s, g.frontAxleX * s, g.axleY * s, tube * 0.55, FRAME_SHADOW, frameAlpha * 0.85);

  frameGfx.fillStyle(0x5c3d2e, frameAlpha);
  frameGfx.lineStyle(tube * 0.65, COLORS.outline, frameAlpha);
  frameGfx.fillRoundedRect((g.seatX - 14) * s, (g.seatY - 2) * s, 28 * s, 11 * s, 5);
  frameGfx.strokeRoundedRect((g.seatX - 14) * s, (g.seatY - 2) * s, 28 * s, 11 * s, 5);
  frameGfx.fillStyle(0xffffff, frameAlpha * 0.28);
  frameGfx.fillEllipse((g.seatX - 2) * s, (g.seatY + 1) * s, 16 * s, 4 * s);

  parent.add(frameGfx);

  if (wheels) {
    parent.add(drawCartoonWheel(scene, g.rearAxleX * s, g.axleY * s, R, wheelAlpha, 'round'));
    if (pedals) parent.add(buildCrankset(scene, g.bbX * s, g.bbY * s, s, frameAlpha));
    parent.add(drawCartoonWheel(scene, g.frontAxleX * s, g.axleY * s, R, wheelAlpha, 'round'));
  } else {
    for (const ax of [g.rearAxleX, g.frontAxleX]) {
      const ghost = scene.add.graphics();
      ghost.lineStyle(2.5 * s, COLORS.outline, 0.45);
      ghost.strokeCircle(ax * s, g.axleY * s, R);
      ghost.lineStyle(1.5 * s, COLORS.bikeFrame, 0.35);
      ghost.strokeCircle(ax * s, g.axleY * s, R * 0.72);
      parent.add(ghost);
    }
  }

  if (handlebar) {
    const bars = scene.add.graphics();
    strokeTube(bars, g.stemBaseX * s, g.stemBaseY * s, g.barCenterX * s, g.barCenterY * s, tube * 0.65, COLORS.bikeFrame, frameAlpha);
    bars.lineStyle(tube * 0.75, COLORS.bikeFrame, frameAlpha);
    bars.beginPath();
    bars.arc(g.barCenterX * s, g.barCenterY * s, g.barRadius * s, Math.PI, 0, true);
    bars.strokePath();
    const gripL = g.barCenterX - g.barRadius;
    const gripR = g.barCenterX + g.barRadius;
    bars.fillStyle(0x2a2a2a, frameAlpha);
    bars.fillCircle(gripL * s, g.barCenterY * s, 6.5 * s);
    bars.fillCircle(gripR * s, g.barCenterY * s, 6.5 * s);
    bars.lineStyle(2.5 * s, COLORS.outline, frameAlpha);
    bars.strokeCircle(gripL * s, g.barCenterY * s, 6.5 * s);
    bars.strokeCircle(gripR * s, g.barCenterY * s, 6.5 * s);
    parent.add(bars);

    if (bell) {
      const bellRoot = scene.add.container((gripL + 6) * s, (g.barCenterY - 10) * s);
      bellRoot.add(drawCartoonBell(scene, s * 0.55));
      parent.add(bellRoot);
    }
  }
}

export function drawBicycleSideProfile(
  scene: Phaser.Scene,
  x: number,
  y: number,
  scale = 1,
  options: BicycleSideOptions | BikeDrawOptions = {},
): Phaser.GameObjects.Container {
  const mapped =
    'showWheels' in options || 'showFrame' in options
      ? mapOptions(options as BikeDrawOptions)
      : (options as BicycleSideOptions);
  if ((options as BikeDrawOptions).showFrame === false) {
    const empty = scene.add.container(x, y);
    if (mapped.wheels) {
      const g = BIKE_SIDE_PROFILE;
      const s = scale;
      empty.add(drawCartoonWheel(scene, g.rearAxleX * s, g.axleY * s, g.wheelR * s, mapped.wheelAlpha ?? 1, 'round'));
      empty.add(drawCartoonWheel(scene, g.frontAxleX * s, g.axleY * s, g.wheelR * s, mapped.wheelAlpha ?? 1, 'round'));
    }
    return empty;
  }

  const root = scene.add.container(x, y);
  paintBicycleSideProfile(scene, root, scale, mapped);
  return root;
}

export function drawIllustratedBike(
  scene: Phaser.Scene,
  x: number,
  y: number,
  scale = 1,
  options: BikeDrawOptions = {},
): Phaser.GameObjects.Container {
  return drawBicycleSideProfile(scene, x, y, scale, options);
}

function buildCrankset(
  scene: Phaser.Scene,
  x: number,
  y: number,
  s: number,
  alpha: number,
): Phaser.GameObjects.Container {
  const root = scene.add.container(x, y);
  const chainring = scene.add.graphics();
  chainring.fillStyle(COLORS.wheelRim, alpha);
  chainring.lineStyle(2.5 * s, COLORS.outline, alpha);
  chainring.fillCircle(0, 0, 10 * s);
  chainring.strokeCircle(0, 0, 10 * s);
  chainring.lineStyle(1.8 * s, COLORS.outline, alpha * 0.6);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    chainring.strokeCircle(Math.cos(a) * 7 * s, Math.sin(a) * 7 * s, 2 * s);
  }

  const crank = scene.add.graphics();
  crank.lineStyle(3 * s, COLORS.wheelRim, alpha);
  crank.beginPath();
  crank.moveTo(0, 0);
  crank.lineTo(14 * s, 0);
  crank.strokePath();
  crank.beginPath();
  crank.moveTo(0, 0);
  crank.lineTo(-14 * s, 0);
  crank.strokePath();
  crank.fillStyle(0xff6b35, alpha);
  crank.fillRoundedRect(10 * s, -5 * s, 18 * s, 10 * s, 4);
  crank.fillRoundedRect(-28 * s, -5 * s, 18 * s, 10 * s, 4);
  crank.lineStyle(2 * s, COLORS.outline, alpha);
  crank.strokeRoundedRect(10 * s, -5 * s, 18 * s, 10 * s, 4);
  crank.strokeRoundedRect(-28 * s, -5 * s, 18 * s, 10 * s, 4);

  root.add([chainring, crank]);
  return root;
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
  tire.fillStyle(TIRE, alpha);
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
  const rimShine = scene.add.graphics();
  rimShine.lineStyle(Math.max(2, radius * 0.07), 0xffffff, 0.4 * alpha);
  rimShine.beginPath();
  rimShine.arc(0, 0, radius * 0.78, -2.5, -0.6, false);
  rimShine.strokePath();
  container.add([shadow, tire, rim, spokes, hub, shine, rimShine]);
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

/** Lane mission: recognizable side bike, whole unit tilts when steering. */
export function drawBikeLaneAvatar(scene: Phaser.Scene, scale: number): {
  root: Phaser.GameObjects.Container;
  frontWheel: Phaser.GameObjects.Container;
} {
  const root = drawBicycleSideProfile(scene, 0, 0, scale * 0.42, {
    wheels: true,
    pedals: true,
    handlebar: true,
    bell: false,
  });
  const samuelLayer = scene.add.container(-8 * scale, -38 * scale);
  const head = scene.add.circle(0, 0, 11 * scale, COLORS.samuelSkin);
  head.setStrokeStyle(2 * scale, COLORS.outline);
  const hair = scene.add.ellipse(0, -8 * scale, 18 * scale, 9 * scale, 0x5c3d2e);
  hair.setStrokeStyle(2 * scale, COLORS.outline);
  const eyeL = scene.add.circle(-4 * scale, -1 * scale, 1.6 * scale, COLORS.outline);
  const eyeR = scene.add.circle(4 * scale, -1 * scale, 1.6 * scale, COLORS.outline);
  samuelLayer.add([hair, head, eyeL, eyeR]);
  root.add(samuelLayer);

  return { root, frontWheel: root };
}

export function drawPedalPartIcon(scene: Phaser.Scene, scale: number): Phaser.GameObjects.Container {
  return buildCrankset(scene, 0, 0, scale, 1);
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
  const g = scene.add.graphics();
  const s = scale;
  const tube = 4 * s;
  strokeTube(g, 0, 18 * s, 0, -4 * s, tube * 0.65, COLORS.bikeFrame, 1);
  g.lineStyle(tube * 0.75, COLORS.bikeFrame);
  g.beginPath();
  g.arc(0, -6 * s, 26 * s, Math.PI, 0, true);
  g.strokePath();
  g.fillStyle(0x2a2a2a, 1);
  g.fillCircle(-26 * s, -6 * s, 7 * s);
  g.fillCircle(26 * s, -6 * s, 7 * s);
  g.lineStyle(2.5 * s, COLORS.outline);
  g.strokeCircle(-26 * s, -6 * s, 7 * s);
  g.strokeCircle(26 * s, -6 * s, 7 * s);
  c.add(g);
  return c;
}

export function drawHubBikeIcon(scene: Phaser.Scene, scale: number): Phaser.GameObjects.Container {
  return drawBicycleSideProfile(scene, 0, 0, scale * 0.38, {
    wheels: true,
    pedals: false,
    handlebar: true,
    bell: false,
  });
}