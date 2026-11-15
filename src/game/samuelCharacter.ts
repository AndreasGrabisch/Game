import Phaser from 'phaser';
import { COLORS } from './constants';

const CAP_COLOR = 0x4ecdc4;
const CAP_BRIM = 0x3bb3aa;
const HAIR = 0x5c3d2e;

export interface SamuelParts {
  armWave: Phaser.GameObjects.Container;
  head: Phaser.GameObjects.Container;
  face: Phaser.GameObjects.Container;
}

export interface SamuelCharacterOptions {
  cap?: boolean;
  facing?: 'right' | 'left';
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
  const eye = scene.add.circle(12 * s, -4 * s, 3.2 * s, COLORS.outline);
  const eyeShine = scene.add.circle(13 * s, -5 * s, 1.2 * s, COLORS.white);
  const smile = scene.add.graphics();
  smile.lineStyle(2.2 * s, COLORS.outline);
  smile.beginPath();
  smile.arc(8 * s, 4 * s, 9 * s, Phaser.Math.DegToRad(15), Phaser.Math.DegToRad(165), false);
  smile.strokePath();
  const nose = scene.add.circle(16 * s, 0, 2.2 * s, 0xe8a882);
  nose.setStrokeStyle(1.2 * s, COLORS.outline, 0.5);
  face.add([cheek, eye, eyeShine, nose, smile]);

  const hairBack = scene.add.graphics();
  hairBack.fillStyle(HAIR, 1);
  hairBack.lineStyle(line * 0.7, COLORS.outline);
  hairBack.fillEllipse(-4 * s, -4 * s, 18 * s, 22 * s);
  hairBack.strokeEllipse(-4 * s, -4 * s, 18 * s, 22 * s);

  head.add([hairBack, skull, face]);

  if (cap) {
    const capGfx = scene.add.graphics();
    capGfx.fillStyle(CAP_COLOR, 1);
    capGfx.lineStyle(line, COLORS.outline);
    capGfx.fillEllipse(8 * s, -18 * s, 34 * s, 16 * s);
    capGfx.strokeEllipse(8 * s, -18 * s, 34 * s, 16 * s);
    capGfx.fillStyle(CAP_BRIM, 1);
    capGfx.fillRoundedRect(-8 * s, -12 * s, 30 * s, 6 * s, 3);
    capGfx.strokeRoundedRect(-8 * s, -12 * s, 30 * s, 6 * s, 3);
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

  root.add([legBack, legFront, armBack, torso, head, armWave]);

  const parts: SamuelParts = { armWave, head, face };
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

/** Compact bust for detective UI corners. */
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
  return wrap;
}

export function getSamuelParts(target: Phaser.GameObjects.GameObject): SamuelParts | undefined {
  return (target as Phaser.GameObjects.Container).getData('samuelParts') as SamuelParts | undefined;
}

export function getSamuelScale(target: Phaser.GameObjects.GameObject): number {
  return ((target as Phaser.GameObjects.Container).getData('samuelScale') as number) ?? 1;
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
  if (parts) {
    scene.tweens.add({
      targets: parts.head,
      angle: 2,
      duration: duration * 1.1,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }
}

export function playSamuelWave(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject): void {
  const parts = getSamuelParts(target);
  if (!parts) return;
  scene.tweens.killTweensOf(parts.armWave);
  parts.armWave.setAngle(-18);
  scene.tweens.add({
    targets: parts.armWave,
    angle: -105,
    duration: 220,
    yoyo: true,
    repeat: 3,
    ease: 'Sine.easeInOut',
  });
}

export function playSamuelCheer(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject): void {
  const s = getSamuelScale(target);
  scene.tweens.add({
    targets: target,
    scaleX: 1.08,
    scaleY: 1.08,
    duration: 200,
    yoyo: true,
    ease: 'Back.easeOut',
  });
  const parts = getSamuelParts(target);
  if (parts) {
    scene.tweens.add({
      targets: parts.armWave,
      angle: -130,
      duration: 260,
      yoyo: true,
      ease: 'Back.easeOut',
    });
    scene.tweens.add({
      targets: parts.head,
      y: parts.head.y - 4 * s,
      duration: 220,
      yoyo: true,
      ease: 'Sine.easeOut',
    });
  }
}

export function playSamuelOops(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject): void {
  scene.tweens.add({
    targets: target,
    angle: -5,
    duration: 90,
    yoyo: true,
    repeat: 2,
    ease: 'Sine.easeInOut',
    onComplete: () => {
      (target as Phaser.GameObjects.Container).setAngle(0);
    },
  });
  const parts = getSamuelParts(target);
  if (parts) {
    const smile = parts.face.list[parts.face.list.length - 1] as Phaser.GameObjects.Graphics;
    scene.tweens.add({
      targets: parts.head,
      angle: -6,
      duration: 160,
      yoyo: true,
      ease: 'Sine.easeInOut',
      onComplete: () => parts.head.setAngle(0),
    });
    void smile;
  }
}