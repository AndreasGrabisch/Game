import Phaser from 'phaser';
import { COLORS } from './constants';

const CAP_COLOR = 0x4ecdc4;
const CAP_BRIM = 0x3bb3aa;
const HAIR = 0x5c3d2e;

export type SamuelExpression = 'smile' | 'cheer' | 'oops' | 'think';

export interface SamuelParts {
  armWave: Phaser.GameObjects.Container;
  head: Phaser.GameObjects.Container;
  face: Phaser.GameObjects.Container;
  eye: Phaser.GameObjects.Arc;
  eyeShine: Phaser.GameObjects.Arc;
  mouth: Phaser.GameObjects.Graphics;
  brows: Phaser.GameObjects.Graphics;
  cap?: Phaser.GameObjects.GameObject;
}

export interface SamuelCharacterOptions {
  cap?: boolean;
  facing?: 'right' | 'left';
}

function paintMouth(g: Phaser.GameObjects.Graphics, shape: SamuelExpression, s: number): void {
  g.clear();
  g.lineStyle(2.2 * s, COLORS.outline);
  if (shape === 'smile') {
    g.beginPath();
    g.arc(8 * s, 4 * s, 9 * s, Phaser.Math.DegToRad(15), Phaser.Math.DegToRad(165), false);
    g.strokePath();
    return;
  }
  if (shape === 'cheer') {
    g.fillStyle(0x8b3d3d, 0.85);
    g.fillEllipse(8 * s, 6 * s, 10 * s, 12 * s);
    g.strokeEllipse(8 * s, 6 * s, 10 * s, 12 * s);
    return;
  }
  if (shape === 'oops') {
    g.beginPath();
    g.arc(8 * s, 8 * s, 6 * s, Phaser.Math.DegToRad(200), Phaser.Math.DegToRad(340), false);
    g.strokePath();
    return;
  }
  g.lineBetween(2 * s, 5 * s, 14 * s, 5 * s);
  g.lineBetween(6 * s, 2 * s, 6 * s, 8 * s);
}

function paintBrows(g: Phaser.GameObjects.Graphics, shape: SamuelExpression, s: number): void {
  g.clear();
  g.lineStyle(2 * s, COLORS.outline);
  if (shape === 'think') {
    g.lineBetween(4 * s, -10 * s, 10 * s, -12 * s);
    g.lineBetween(12 * s, -12 * s, 18 * s, -10 * s);
    return;
  }
  if (shape === 'oops') {
    g.lineBetween(5 * s, -11 * s, 11 * s, -9 * s);
    return;
  }
  g.lineBetween(4 * s, -9 * s, 10 * s, -10 * s);
}

export function setSamuelExpression(parts: SamuelParts, shape: SamuelExpression, scale: number): void {
  paintMouth(parts.mouth, shape, scale);
  paintBrows(parts.brows, shape, scale);
}

function resolveSamuelRoot(target: Phaser.GameObjects.GameObject): Phaser.GameObjects.Container | undefined {
  const container = target as Phaser.GameObjects.Container;
  if (container.getData('samuelParts')) return container;
  const child = container.list?.[0] as Phaser.GameObjects.Container | undefined;
  if (child?.getData('samuelParts')) return child;
  return container.getData('samuelParts') ? container : undefined;
}

/** Side-view Samuel for hub, workshop, transitions (kid-friendly comic). */
export function buildSamuelSideCharacter(
  scene: Phaser.Scene,
  x: number,
  y: number,
  scale = 1,
  options: SamuelCharacterOptions = {},
): Phaser.GameObjects.Container {
  const { cap = true, facing = 'right' } = options;
  const flip = facing === 'left' ? -1 : 1;
  const root = scene.add.container(x, y);
  root.setScale(flip, 1);
  const s = scale;
  const line = 3 * s;

  const shadow = scene.add.ellipse(2 * s, 58 * s, 44 * s, 13 * s, 0x000000, 0.14);
  root.add(shadow);

  const legBack = scene.add.graphics();
  legBack.fillStyle(COLORS.samuelPants, 1);
  legBack.lineStyle(line, COLORS.outline);
  legBack.fillRoundedRect(-6 * s, 28 * s, 12 * s, 30 * s, 4);
  legBack.strokeRoundedRect(-6 * s, 28 * s, 12 * s, 30 * s, 4);
  const legFront = scene.add.graphics();
  legFront.fillStyle(COLORS.samuelPants, 1);
  legFront.lineStyle(line, COLORS.outline);
  legFront.fillRoundedRect(8 * s, 30 * s, 14 * s, 28 * s, 4);
  legFront.strokeRoundedRect(8 * s, 30 * s, 14 * s, 28 * s, 4);

  const torso = scene.add.graphics();
  torso.fillStyle(COLORS.samuelShirt, 1);
  torso.lineStyle(line, COLORS.outline);
  torso.fillRoundedRect(-6 * s, 2 * s, 32 * s, 34 * s, 8);
  torso.strokeRoundedRect(-6 * s, 2 * s, 32 * s, 34 * s, 8);
  torso.fillStyle(0xffffff, 0.22);
  torso.fillEllipse(8 * s, 12 * s, 14 * s, 8 * s);

  const armWave = scene.add.container(22 * s, 6 * s);
  const upperArm = scene.add.graphics();
  upperArm.fillStyle(COLORS.samuelSkin, 1);
  upperArm.lineStyle(line * 0.85, COLORS.outline);
  upperArm.fillRoundedRect(-4 * s, -3 * s, 10 * s, 22 * s, 4);
  upperArm.strokeRoundedRect(-4 * s, -3 * s, 10 * s, 22 * s, 4);
  const hand = scene.add.circle(1 * s, 20 * s, 6 * s, COLORS.samuelSkin);
  hand.setStrokeStyle(2 * s, COLORS.outline);
  armWave.add([upperArm, hand]);
  armWave.setAngle(-18);

  const head = scene.add.container(-2 * s, -22 * s);
  const skull = scene.add.circle(6 * s, 0, 20 * s, COLORS.samuelSkin);
  skull.setStrokeStyle(line, COLORS.outline);

  const face = scene.add.container(6 * s, 0);
  const cheek = scene.add.ellipse(14 * s, 4 * s, 12 * s, 10 * s, 0xffb89a, 0.35);
  const brows = scene.add.graphics();
  const eye = scene.add.circle(12 * s, -4 * s, 3.2 * s, COLORS.outline);
  const eyeShine = scene.add.circle(13 * s, -5 * s, 1.2 * s, COLORS.white);
  const mouth = scene.add.graphics();
  const nose = scene.add.circle(16 * s, 0, 2.2 * s, 0xe8a882);
  nose.setStrokeStyle(1.2 * s, COLORS.outline, 0.5);
  paintMouth(mouth, 'smile', s);
  paintBrows(brows, 'smile', s);
  face.add([cheek, brows, eye, eyeShine, nose, mouth]);

  const hairBack = scene.add.graphics();
  hairBack.fillStyle(HAIR, 1);
  hairBack.lineStyle(line * 0.7, COLORS.outline);
  hairBack.fillEllipse(-4 * s, -4 * s, 18 * s, 22 * s);
  hairBack.strokeEllipse(-4 * s, -4 * s, 18 * s, 22 * s);

  head.add([hairBack, skull, face]);

  let capGfx: Phaser.GameObjects.Graphics | undefined;
  if (cap) {
    capGfx = scene.add.graphics();
    capGfx.fillStyle(CAP_COLOR, 1);
    capGfx.lineStyle(line, COLORS.outline);
    capGfx.fillEllipse(8 * s, -18 * s, 34 * s, 16 * s);
    capGfx.strokeEllipse(8 * s, -18 * s, 34 * s, 16 * s);
    capGfx.fillStyle(CAP_BRIM, 1);
    capGfx.fillRoundedRect(-8 * s, -12 * s, 30 * s, 6 * s, 3);
    capGfx.strokeRoundedRect(-8 * s, -12 * s, 30 * s, 6 * s, 3);
    capGfx.fillStyle(0xffffff, 0.28);
    capGfx.fillEllipse(2 * s, -22 * s, 14 * s, 5 * s);
    head.add(capGfx);
  } else {
    const hairTop = scene.add.ellipse(4 * s, -16 * s, 26 * s, 14 * s, HAIR);
    hairTop.setStrokeStyle(line * 0.7, COLORS.outline);
    head.add(hairTop);
  }

  const armBack = scene.add.graphics();
  armBack.fillStyle(COLORS.samuelSkin, 1);
  armBack.lineStyle(line * 0.85, COLORS.outline);
  armBack.fillRoundedRect(-16 * s, 8 * s, 10 * s, 20 * s, 4);
  armBack.strokeRoundedRect(-16 * s, 8 * s, 10 * s, 20 * s, 4);
  armBack.setAngle(12);

  const shoes = scene.add.graphics();
  shoes.fillStyle(0xf7f7f7, 1);
  shoes.lineStyle(line * 0.7, COLORS.outline);
  shoes.fillRoundedRect(-8 * s, 52 * s, 16 * s, 8 * s, 3);
  shoes.strokeRoundedRect(-8 * s, 52 * s, 16 * s, 8 * s, 3);
  shoes.fillRoundedRect(6 * s, 52 * s, 18 * s, 8 * s, 3);
  shoes.strokeRoundedRect(6 * s, 52 * s, 18 * s, 8 * s, 3);
  shoes.fillStyle(COLORS.bikeFrame, 1);
  shoes.fillRoundedRect(-6 * s, 54 * s, 8 * s, 3 * s, 1);
  shoes.fillRoundedRect(10 * s, 54 * s, 10 * s, 3 * s, 1);

  root.add([legBack, legFront, shoes, armBack, torso, head, armWave]);

  const parts: SamuelParts = { armWave, head, face, eye, eyeShine, mouth, brows, cap: capGfx };
  root.setData('samuelParts', parts);
  root.setData('samuelScale', s);
  return root;
}

export function drawSamuelSideView(
  scene: Phaser.Scene,
  x: number,
  y: number,
  scale = 1,
): Phaser.GameObjects.Container {
  return buildSamuelSideCharacter(scene, x, y, scale, { cap: true, facing: 'right' });
}

export function drawSamuelBust(
  scene: Phaser.Scene,
  x: number,
  y: number,
  scale: number,
): Phaser.GameObjects.Container {
  const bust = buildSamuelSideCharacter(scene, 0, 0, scale * 0.55, { cap: true, facing: 'right' });
  const wrap = scene.add.container(x, y, [bust]);
  wrap.setData('samuelParts', bust.getData('samuelParts'));
  wrap.setData('samuelScale', scale * 0.55);
  wrap.setData('samuelInner', bust);
  return wrap;
}

export function getSamuelParts(target: Phaser.GameObjects.GameObject): SamuelParts | undefined {
  const root = resolveSamuelRoot(target);
  return root?.getData('samuelParts') as SamuelParts | undefined;
}

export function getSamuelScale(target: Phaser.GameObjects.GameObject): number {
  const container = target as Phaser.GameObjects.Container;
  const scale = container.getData('samuelScale') as number | undefined;
  if (scale !== undefined) return scale;
  const inner = container.list?.[0] as Phaser.GameObjects.Container | undefined;
  return (inner?.getData('samuelScale') as number) ?? 1;
}

export function scheduleSamuelBlink(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject): void {
  const parts = getSamuelParts(target);
  if (!parts) return;
  const existing = (target as Phaser.GameObjects.Container).getData('samuelBlinkTimer') as
    | Phaser.Time.TimerEvent
    | undefined;
  existing?.remove(false);

  const timer = scene.time.addEvent({
    delay: Phaser.Math.Between(2200, 3800),
    loop: true,
    callback: () => {
      if (!parts.eye.active) return;
      scene.tweens.add({
        targets: [parts.eye, parts.eyeShine],
        scaleY: 0.12,
        duration: 70,
        yoyo: true,
        ease: 'Sine.easeIn',
      });
    },
  });
  (target as Phaser.GameObjects.Container).setData('samuelBlinkTimer', timer);
}

export function startSamuelIdle(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject, amount = 6, duration = 1200): void {
  const typed = target as Phaser.GameObjects.GameObject & { y: number };
  scene.tweens.killTweensOf(target);
  scene.tweens.add({
    targets: target,
    y: typed.y - amount,
    duration,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut',
  });
  const parts = getSamuelParts(target);
  const s = getSamuelScale(target);
  if (parts) {
    setSamuelExpression(parts, 'smile', s);
    scene.tweens.add({
      targets: parts.head,
      angle: 2,
      duration: duration * 1.1,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }
  scheduleSamuelBlink(scene, target);
}

export function playSamuelWave(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject): void {
  const parts = getSamuelParts(target);
  if (!parts) return;
  const s = getSamuelScale(target);
  setSamuelExpression(parts, 'cheer', s);
  scene.tweens.killTweensOf(parts.armWave);
  parts.armWave.setAngle(-18);
  scene.tweens.add({
    targets: parts.armWave,
    angle: -105,
    duration: 220,
    yoyo: true,
    repeat: 3,
    ease: 'Sine.easeInOut',
    onComplete: () => setSamuelExpression(parts, 'smile', s),
  });
}

export function playSamuelCheer(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject): void {
  const s = getSamuelScale(target);
  const parts = getSamuelParts(target);
  const root = target as Phaser.GameObjects.Container;
  const baseX = root.scaleX >= 0 ? root.scaleX : Math.abs(root.scaleX);
  scene.tweens.add({
    targets: target,
    scaleX: baseX * 1.14,
    scaleY: 1.14,
    duration: 240,
    yoyo: true,
    ease: 'Back.easeOut',
  });
  if (parts) {
    setSamuelExpression(parts, 'cheer', s);
    scene.tweens.add({
      targets: parts.armWave,
      angle: -135,
      duration: 280,
      yoyo: true,
      ease: 'Back.easeOut',
    });
    scene.tweens.add({
      targets: parts.head,
      y: parts.head.y - 8 * s,
      duration: 240,
      yoyo: true,
      ease: 'Sine.easeOut',
    });
    if (parts.cap) {
      scene.tweens.add({
        targets: parts.cap,
        y: '-=4',
        duration: 180,
        yoyo: true,
        repeat: 1,
        ease: 'Bounce.easeOut',
      });
    }
    scene.time.delayedCall(520, () => setSamuelExpression(parts, 'smile', s));
  }
}

export function playSamuelOops(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject): void {
  const s = getSamuelScale(target);
  const parts = getSamuelParts(target);
  const root = target as Phaser.GameObjects.Container & { y: number };
  const baseY = root.y;
  if (parts) setSamuelExpression(parts, 'oops', s);
  scene.tweens.add({
    targets: target,
    angle: -4,
    duration: 100,
    yoyo: true,
    repeat: 1,
    ease: 'Sine.easeInOut',
    onComplete: () => root.setAngle(0),
  });
  scene.tweens.add({
    targets: target,
    y: baseY + 10 * s,
    duration: 160,
    yoyo: true,
    ease: 'Quad.easeOut',
    onComplete: () => {
      if (parts) {
        setSamuelExpression(parts, 'smile', s);
        parts.head.setAngle(0);
      }
    },
  });
  if (parts) {
    scene.tweens.add({
      targets: parts.head,
      angle: -8,
      duration: 140,
      yoyo: true,
      ease: 'Sine.easeInOut',
    });
  }
}

export function playSamuelThink(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject): void {
  const parts = getSamuelParts(target);
  if (!parts) return;
  const s = getSamuelScale(target);
  setSamuelExpression(parts, 'think', s);
  scene.tweens.add({
    targets: parts.armWave,
    angle: -50,
    duration: 320,
    yoyo: true,
    ease: 'Sine.easeInOut',
  });
  scene.tweens.add({
    targets: parts.head,
    angle: 6,
    duration: 360,
    yoyo: true,
    ease: 'Sine.easeInOut',
    onComplete: () => setSamuelExpression(parts, 'smile', s),
  });
}