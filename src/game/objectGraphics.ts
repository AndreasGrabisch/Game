import Phaser from 'phaser';
import { COLORS } from './constants';
import { drawCartoonBell } from './bikeGraphics';

export type ColorSortShapeKind = 0 | 1 | 2 | 3;

export function drawIllustratedPuddle(scene: Phaser.Scene, scale: number): Phaser.GameObjects.Container {
  const puddle = scene.add.container(0, 0);
  const s = scale;
  const water = scene.add.ellipse(0, 0, 78 * s, 28 * s, 0x4aa3df);
  water.setStrokeStyle(3 * s, COLORS.outline);
  const inner = scene.add.ellipse(0, 2 * s, 64 * s, 22 * s, 0x6bb8ee, 0.55);
  const shine = scene.add.ellipse(-14 * s, -5 * s, 18 * s, 7 * s, COLORS.white, 0.65);
  const drop = scene.add.circle(28 * s, -10 * s, 5 * s, 0x6bb8ee, 0.8);
  drop.setStrokeStyle(2 * s, COLORS.outline, 0.4);
  puddle.add([water, inner, shine, drop]);
  return puddle;
}

export function drawIllustratedFinishBanner(scene: Phaser.Scene, scale: number): Phaser.GameObjects.Container {
  const banner = scene.add.container(0, 0);
  const s = scale;
  const pole = scene.add.graphics();
  pole.fillStyle(0xdddddd, 1);
  pole.lineStyle(2 * s, COLORS.outline);
  pole.fillRoundedRect(-4 * s, -20 * s, 8 * s, 80 * s, 3);
  pole.strokeRoundedRect(-4 * s, -20 * s, 8 * s, 80 * s, 3);
  const flag = scene.add.container(26 * s, -22 * s);
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const dark = (row + col) % 2 === 0;
      const cell = scene.add.rectangle(
        (col - 1.5) * 12 * s,
        (row - 1.5) * 12 * s,
        12 * s,
        12 * s,
        dark ? COLORS.outline : COLORS.white,
      );
      cell.setStrokeStyle(1, COLORS.outline, 0.2);
      flag.add(cell);
    }
  }
  const top = scene.add.triangle(26 * s, -44 * s, 0, 0, 10 * s, 8 * s, 0, 16 * s, COLORS.success);
  top.setStrokeStyle(2 * s, COLORS.outline);
  banner.add([pole, flag, top]);
  return banner;
}

export function drawIllustratedTree(scene: Phaser.Scene, scale: number): Phaser.GameObjects.Container {
  const tree = scene.add.container(0, 0);
  const s = scale;
  const trunk = scene.add.graphics();
  trunk.fillStyle(0x8b5a2b, 1);
  trunk.lineStyle(2 * s, COLORS.outline);
  trunk.fillRoundedRect(-6 * s, 10 * s, 12 * s, 28 * s, 4);
  trunk.strokeRoundedRect(-6 * s, 10 * s, 12 * s, 28 * s, 4);
  const crown = scene.add.graphics();
  crown.fillStyle(0x3cba5a, 1);
  crown.lineStyle(3 * s, COLORS.outline);
  crown.fillCircle(0, -10 * s, 26 * s);
  crown.strokeCircle(0, -10 * s, 26 * s);
  crown.fillStyle(0x4fd66d, 0.5);
  crown.fillCircle(-10 * s, -16 * s, 12 * s);
  tree.add([trunk, crown]);
  return tree;
}

export function drawColorSortPiece(
  scene: Phaser.Scene,
  tint: number,
  kind: ColorSortShapeKind,
  scale: number,
): Phaser.GameObjects.Container {
  const root = scene.add.container(0, 0);
  const s = scale;
  const shadow = scene.add.ellipse(2 * s, 4 * s, 38 * s, 14 * s, 0x000000, 0.12);
  const body = scene.add.graphics();
  const outline = 3.2 * s;
  body.lineStyle(outline, COLORS.outline);
  body.fillStyle(tint, 1);
  const highlight = scene.add.graphics();
  highlight.fillStyle(0xffffff, 0.28);

  if (kind === 0) {
    body.fillCircle(0, 0, 22 * s);
    body.strokeCircle(0, 0, 22 * s);
    highlight.fillEllipse(-8 * s, -10 * s, 14 * s, 10 * s);
  } else if (kind === 1) {
    const star = scene.add.star(0, 0, 5, 10 * s, 22 * s, tint);
    star.setStrokeStyle(outline, COLORS.outline);
    highlight.fillEllipse(-6 * s, -12 * s, 12 * s, 8 * s);
    root.add([shadow, star, highlight]);
    return root;
  } else if (kind === 2) {
    body.fillTriangle(0, -24 * s, 22 * s, 18 * s, -22 * s, 18 * s);
    body.strokeTriangle(0, -24 * s, 22 * s, 18 * s, -22 * s, 18 * s);
    highlight.fillTriangle(-6 * s, -18 * s, 4 * s, -6 * s, -14 * s, -4 * s);
  } else {
    body.fillRoundedRect(-18 * s, -18 * s, 36 * s, 36 * s, 8);
    body.strokeRoundedRect(-18 * s, -18 * s, 36 * s, 36 * s, 8);
    highlight.fillRoundedRect(-12 * s, -14 * s, 16 * s, 10 * s, 4);
  }

  root.add([shadow, body, highlight]);
  return root;
}

export type DecoyKind = 'sock' | 'banana' | 'duck' | 'cupcake';

export function drawDecoyIcon(scene: Phaser.Scene, kind: DecoyKind, scale: number): Phaser.GameObjects.Container {
  const c = scene.add.container(0, 0);
  const s = scale;
  if (kind === 'sock') {
    const g = scene.add.graphics();
    g.fillStyle(0xff6b9d, 1);
    g.lineStyle(2.5 * s, COLORS.outline);
    g.fillRoundedRect(-10 * s, -18 * s, 20 * s, 28 * s, 6);
    g.strokeRoundedRect(-10 * s, -18 * s, 20 * s, 28 * s, 6);
    g.fillStyle(0xffffff, 0.35);
    g.fillRoundedRect(-8 * s, -14 * s, 8 * s, 10 * s, 3);
    c.add(g);
  } else if (kind === 'banana') {
    const g = scene.add.graphics();
    g.fillStyle(0xffd93d, 1);
    g.lineStyle(3 * s, COLORS.outline);
    g.beginPath();
    g.arc(0, 2 * s, 18 * s, Phaser.Math.DegToRad(200), Phaser.Math.DegToRad(340), false);
    g.strokePath();
    g.lineStyle(4 * s, 0xffd93d);
    g.beginPath();
    g.arc(0, 2 * s, 14 * s, Phaser.Math.DegToRad(210), Phaser.Math.DegToRad(330), false);
    g.strokePath();
    c.add(g);
  } else if (kind === 'duck') {
    const body = scene.add.ellipse(2 * s, 6 * s, 30 * s, 22 * s, COLORS.star);
    body.setStrokeStyle(2 * s, COLORS.outline);
    const head = scene.add.circle(-10 * s, -8 * s, 11 * s, COLORS.star);
    head.setStrokeStyle(2 * s, COLORS.outline);
    const beak = scene.add.triangle(-20 * s, -6 * s, 0, 0, 10 * s, 4 * s, 0, 8 * s, 0xff6b35);
    beak.setStrokeStyle(1.5 * s, COLORS.outline);
    c.add([body, head, beak]);
  } else {
    const cup = scene.add.graphics();
    cup.fillStyle(0xffb6c8, 1);
    cup.lineStyle(2.5 * s, COLORS.outline);
    cup.fillRoundedRect(-14 * s, -4 * s, 28 * s, 22 * s, 6);
    cup.strokeRoundedRect(-14 * s, -4 * s, 28 * s, 22 * s, 6);
    const frost = scene.add.circle(0, -14 * s, 16 * s, COLORS.white);
    frost.setStrokeStyle(2 * s, COLORS.outline);
    const cherry = scene.add.circle(10 * s, -18 * s, 5 * s, 0xe23d3d);
    cherry.setStrokeStyle(1.5 * s, COLORS.outline);
    c.add([cup, frost, cherry]);
  }
  return c;
}

export function drawBellChoiceIcon(scene: Phaser.Scene, scale: number): Phaser.GameObjects.Container {
  return drawCartoonBell(scene, scale * 0.85);
}

const DECOY_ROTATION: DecoyKind[] = ['sock', 'banana', 'duck', 'cupcake'];

export function randomDecoyKind(): DecoyKind {
  return Phaser.Utils.Array.GetRandom(DECOY_ROTATION);
}

export function drawSoccerBall(scene: Phaser.Scene, radius: number): Phaser.GameObjects.Container {
  const ball = scene.add.container(0, 0);
  const base = scene.add.circle(0, 0, radius, COLORS.white);
  base.setStrokeStyle(Math.max(3, radius * 0.12), COLORS.outline);
  const patch = scene.add.graphics();
  patch.fillStyle(0x222222, 0.35);
  patch.fillCircle(-radius * 0.35, -radius * 0.12, radius * 0.28);
  patch.fillCircle(radius * 0.22, radius * 0.3, radius * 0.22);
  const shine = scene.add.circle(-radius * 0.28, -radius * 0.32, radius * 0.14, COLORS.white, 0.55);
  ball.add([base, patch, shine]);
  return ball;
}