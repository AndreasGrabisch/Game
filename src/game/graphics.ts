import Phaser from 'phaser';
import { COLORS } from './constants';
import { feedbackSounds } from './feedbackAudio';
import {
  kidButtonWidth,
  kidFontSize,
  KID_BUTTON_FONT_PX,
  KID_BUTTON_HEIGHT,
} from './kidTypography';

export type { BikeDrawOptions } from './bikeGraphics';
import {
  drawCartoonWheel,
  drawIllustratedBike,
  type BikeDrawOptions,
} from './bikeGraphics';
import { drawSamuelSideView } from './samuelCharacter';

export function drawSamuel(
  scene: Phaser.Scene,
  x: number,
  y: number,
  scale = 1,
): Phaser.GameObjects.Container {
  return drawSamuelSideView(scene, x, y, scale);
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
  panel.lineStyle(2, 0xffffff, 0.4);
  panel.strokeRoundedRect(-width / 2 + 6, -height / 2 + 6, width - 12, height - 12, 8);
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
  const px = kidFontSize(size);
  return scene.add
    .text(x, y, text, {
      fontFamily: 'Fredoka, Comic Sans MS, cursive',
      fontSize: `${px}px`,
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
      fontSize: `${kidFontSize(size)}px`,
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
  const btnWidth = kidButtonWidth(width);
  const height = KID_BUTTON_HEIGHT;
  const radius = 14;

  const shadow = scene.add.graphics();
  shadow.fillStyle(0x000000, 0.14);
  shadow.fillRoundedRect(-btnWidth / 2 + 2, -height / 2 + 4, btnWidth, height, radius);

  const bgGfx = scene.add.graphics();
  const drawBg = (alpha = 1) => {
    bgGfx.clear();
    bgGfx.fillStyle(color, alpha);
    bgGfx.lineStyle(4, COLORS.outline);
    bgGfx.fillRoundedRect(-btnWidth / 2, -height / 2, btnWidth, height, radius);
    bgGfx.strokeRoundedRect(-btnWidth / 2, -height / 2, btnWidth, height, radius);
  };
  drawBg(1);

  const gloss = scene.add.rectangle(0, -height / 2 + 9, btnWidth - 16, 10, COLORS.white, 0.28);

  const hit = scene.add.rectangle(0, 0, btnWidth, height, 0xffffff, 0.001);
  hit.setInteractive({ useHandCursor: true });

  const text = scene.add
    .text(0, 2, label, {
      fontFamily: 'Fredoka, Comic Sans MS, cursive',
      fontSize: `${KID_BUTTON_FONT_PX}px`,
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
