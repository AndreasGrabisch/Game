import Phaser from 'phaser';
import { COLORS } from './constants';
import { feedbackSounds } from './feedbackAudio';

export type { BikeDrawOptions } from './bikeGraphics';
import {
  drawCartoonWheel,
  drawIllustratedBike,
  type BikeDrawOptions,
} from './bikeGraphics';

export function drawSamuel(
  scene: Phaser.Scene,
  x: number,
  y: number,
  scale = 1,
): Phaser.GameObjects.Container {
  const container = scene.add.container(x, y);
  const s = scale;
  const line = 3 * s;

  const shadow = scene.add.ellipse(0, 55 * s, 40 * s, 12 * s, 0x000000, 0.15);
  container.add(shadow);

  const legL = scene.add.rectangle(-8 * s, 30 * s, 10 * s, 28 * s, COLORS.samuelPants);
  legL.setStrokeStyle(line, COLORS.outline);
  const legR = scene.add.rectangle(8 * s, 30 * s, 10 * s, 28 * s, COLORS.samuelPants);
  legR.setStrokeStyle(line, COLORS.outline);

  const body = scene.add.rectangle(0, 8 * s, 28 * s, 32 * s, COLORS.samuelShirt);
  body.setStrokeStyle(line, COLORS.outline);

  const armL = scene.add.rectangle(-18 * s, 10 * s, 10 * s, 24 * s, COLORS.samuelSkin);
  armL.setStrokeStyle(line, COLORS.outline);
  armL.setAngle(15);
  const armR = scene.add.rectangle(18 * s, 10 * s, 10 * s, 24 * s, COLORS.samuelSkin);
  armR.setStrokeStyle(line, COLORS.outline);
  armR.setAngle(-15);

  const head = scene.add.circle(0, -22 * s, 18 * s, COLORS.samuelSkin);
  head.setStrokeStyle(line, COLORS.outline);

  const hair = scene.add.ellipse(0, -32 * s, 30 * s, 16 * s, 0x5c3d2e);
  hair.setStrokeStyle(line, COLORS.outline);

  const eyeL = scene.add.circle(-6 * s, -24 * s, 3 * s, COLORS.outline);
  const eyeR = scene.add.circle(6 * s, -24 * s, 3 * s, COLORS.outline);
  const smile = scene.add.arc(0, -18 * s, 8 * s, 0, 180, false, undefined, 0);
  smile.setStrokeStyle(2 * s, COLORS.outline);

  container.add([legL, legR, body, armL, armR, hair, head, eyeL, eyeR, smile]);
  return container;
}

export function drawBike(
  scene: Phaser.Scene,
  x: number,
  y: number,
  scale = 1,
  options: BikeDrawOptions = {},
): Phaser.GameObjects.Container {
  return drawIllustratedBike(scene, x, y, scale, options);
}

export function drawWheel(
  scene: Phaser.Scene,
  x: number,
  y: number,
  radius: number,
  alpha = 1,
): Phaser.GameObjects.Container {
  return drawCartoonWheel(scene, x, y, radius, alpha, 'round');
}

export function drawSquareWheel(
  scene: Phaser.Scene,
  x: number,
  y: number,
  size: number,
): Phaser.GameObjects.Container {
  return drawCartoonWheel(scene, x, y, size * 0.42, 1, 'square');
}

export function drawStar(
  scene: Phaser.Scene,
  x: number,
  y: number,
  size: number,
  filled = true,
): Phaser.GameObjects.Star {
  const star = scene.add.star(x, y, 5, size * 0.4, size, filled ? COLORS.star : undefined);
  star.setStrokeStyle(2, COLORS.outline);
  if (!filled) star.setFillStyle(COLORS.white);
  return star;
}

export function drawComicPanel(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
): Phaser.GameObjects.Container {
  const container = scene.add.container(x, y);
  const shadow = scene.add.graphics();
  shadow.fillStyle(0x000000, 0.1);
  shadow.fillRoundedRect(-width / 2 + 3, -height / 2 + 4, width, height, 12);
  const panel = scene.add.graphics();
  panel.fillStyle(COLORS.panel, 1);
  panel.lineStyle(4, COLORS.outline);
  panel.fillRoundedRect(-width / 2, -height / 2, width, height, 12);
  panel.strokeRoundedRect(-width / 2, -height / 2, width, height, 12);
  const gloss = scene.add.rectangle(0, -height / 2 + 10, width - 14, height * 0.18, COLORS.white, 0.2);
  container.add([shadow, panel, gloss]);
  return container;
}

export function addComicText(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  size = 24,
): Phaser.GameObjects.Text {
  return scene.add
    .text(x, y, text, {
      fontFamily: 'Fredoka, Comic Sans MS, cursive',
      fontSize: `${size}px`,
      color: '#1a1a2e',
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: 400 },
    })
    .setOrigin(0.5);
}

export function floatFeedback(
  scene: Phaser.Scene,
  x: number,
  y: number,
  message: string,
  color = '#ff6b6b',
  size = 18,
): void {
  const feedback = scene.add
    .text(x, y, message, {
      fontFamily: 'Fredoka, Comic Sans MS, cursive',
      fontSize: `${size}px`,
      color,
      fontStyle: 'bold',
      backgroundColor: '#ffffff',
      padding: { x: 8, y: 4 },
    })
    .setOrigin(0.5)
    .setDepth(40);

  scene.tweens.add({
    targets: feedback,
    y: y - 36,
    alpha: 0,
    duration: 900,
    onComplete: () => feedback.destroy(),
  });
}

export function createComicButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  onClick: () => void,
  color = 0xff6b35,
  width = 200,
): Phaser.GameObjects.Container {
  const container = scene.add.container(x, y);
  const height = 56;
  const radius = 14;

  const shadow = scene.add.graphics();
  shadow.fillStyle(0x000000, 0.14);
  shadow.fillRoundedRect(-width / 2 + 2, -height / 2 + 4, width, height, radius);

  const bgGfx = scene.add.graphics();
  const drawBg = (alpha = 1) => {
    bgGfx.clear();
    bgGfx.fillStyle(color, alpha);
    bgGfx.lineStyle(4, COLORS.outline);
    bgGfx.fillRoundedRect(-width / 2, -height / 2, width, height, radius);
    bgGfx.strokeRoundedRect(-width / 2, -height / 2, width, height, radius);
  };
  drawBg(1);

  const gloss = scene.add.rectangle(0, -height / 2 + 9, width - 16, 10, COLORS.white, 0.28);

  const hit = scene.add.rectangle(0, 0, width, height, 0xffffff, 0.001);
  hit.setInteractive({ useHandCursor: true });

  const text = scene.add
    .text(0, 2, label, {
      fontFamily: 'Fredoka, Comic Sans MS, cursive',
      fontSize: '22px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#1a1a2e',
      strokeThickness: 3,
    })
    .setOrigin(0.5);

  hit.on('pointerover', () => drawBg(0.9));
  hit.on('pointerout', () => drawBg(1));
  hit.on('pointerdown', () => {
    void feedbackSounds.unlock();
    feedbackSounds.tap();
    onClick();
  });

  container.add([shadow, bgGfx, gloss, hit, text]);
  return container;
}
