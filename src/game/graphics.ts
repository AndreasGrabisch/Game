import Phaser from 'phaser';
import { COLORS } from './constants';

export interface BikeDrawOptions {
  showWheels?: boolean;
  showFrame?: boolean;
  showPedals?: boolean;
  showHandlebar?: boolean;
  wheelAlpha?: number;
  frameAlpha?: number;
}

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
  const {
    showWheels = false,
    showFrame = true,
    showPedals = false,
    showHandlebar = false,
    wheelAlpha = 1,
    frameAlpha = 1,
  } = options;

  const container = scene.add.container(x, y);
  const s = scale;
  const line = 3 * s;

  if (showFrame) {
    const frame = scene.add.graphics();
    frame.lineStyle(line, COLORS.bikeFrame, frameAlpha);
    frame.strokeCircle(-55 * s, 20 * s, 38 * s);
    frame.strokeCircle(55 * s, 20 * s, 38 * s);
    frame.beginPath();
    frame.moveTo(-55 * s, 20 * s);
    frame.lineTo(0, -30 * s);
    frame.lineTo(55 * s, 20 * s);
    frame.lineTo(0, 20 * s);
    frame.closePath();
    frame.strokePath();
    frame.lineStyle(line, COLORS.bikeFrame, frameAlpha);
    frame.lineBetween(0, -30 * s, 0, -55 * s);
    container.add(frame);
  }

  if (showWheels) {
    for (const wx of [-55, 55]) {
      const wheel = drawWheel(scene, wx * s, 20 * s, 36 * s, wheelAlpha);
      container.add(wheel);
    }
  } else if (showFrame) {
    for (const wx of [-55, 55]) {
      const placeholder = scene.add.circle(wx * s, 20 * s, 36 * s);
      placeholder.setStrokeStyle(2 * s, COLORS.outline, 0.3);
      placeholder.setFillStyle(0xffffff, 0.1);
      container.add(placeholder);
    }
  }

  if (showHandlebar) {
    const bar = scene.add.graphics();
    bar.lineStyle(line, COLORS.bikeFrame, frameAlpha);
    bar.lineBetween(-20 * s, -55 * s, 20 * s, -55 * s);
    bar.lineBetween(0, -55 * s, 0, -30 * s);
    container.add(bar);
  }

  if (showPedals) {
    const crank = scene.add.circle(0, 20 * s, 8 * s, COLORS.wheel);
    crank.setStrokeStyle(line, COLORS.outline);
    const pedalL = scene.add.rectangle(-14 * s, 20 * s, 12 * s, 6 * s, COLORS.wheelRim);
    pedalL.setStrokeStyle(2 * s, COLORS.outline);
    const pedalR = scene.add.rectangle(14 * s, 20 * s, 12 * s, 6 * s, COLORS.wheelRim);
    pedalR.setStrokeStyle(2 * s, COLORS.outline);
    container.add([crank, pedalL, pedalR]);
  }

  return container;
}

export function drawWheel(
  scene: Phaser.Scene,
  x: number,
  y: number,
  radius: number,
  alpha = 1,
): Phaser.GameObjects.Container {
  const container = scene.add.container(x, y);
  const tire = scene.add.circle(0, 0, radius, COLORS.wheel, alpha);
  tire.setStrokeStyle(3, COLORS.outline, alpha);
  const rim = scene.add.circle(0, 0, radius * 0.6, COLORS.wheelRim, alpha);
  rim.setStrokeStyle(2, COLORS.outline, alpha);
  const spoke = scene.add.graphics();
  spoke.lineStyle(2, COLORS.outline, alpha * 0.5);
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2;
    spoke.lineBetween(
      Math.cos(angle) * radius * 0.2,
      Math.sin(angle) * radius * 0.2,
      Math.cos(angle) * radius * 0.55,
      Math.sin(angle) * radius * 0.55,
    );
  }
  container.add([tire, rim, spoke]);
  return container;
}

export function drawSquareWheel(
  scene: Phaser.Scene,
  x: number,
  y: number,
  size: number,
): Phaser.GameObjects.Container {
  const container = scene.add.container(x, y);
  const sq = scene.add.rectangle(0, 0, size, size, COLORS.wheel);
  sq.setStrokeStyle(3, COLORS.outline);
  container.add(sq);
  return container;
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
  const bg = scene.add.rectangle(0, 0, width, height, COLORS.panel);
  bg.setStrokeStyle(4, COLORS.outline);
  container.add(bg);
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

export function createComicButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  onClick: () => void,
  color = 0xff6b35,
): Phaser.GameObjects.Container {
  const container = scene.add.container(x, y);
  const bg = scene.add.rectangle(0, 0, 200, 56, color);
  bg.setStrokeStyle(3, COLORS.outline);
  bg.setInteractive({ useHandCursor: true });

  const text = scene.add
    .text(0, 0, label, {
      fontFamily: 'Fredoka, Comic Sans MS, cursive',
      fontSize: '22px',
      color: '#ffffff',
      fontStyle: 'bold',
    })
    .setOrigin(0.5);

  bg.on('pointerover', () => bg.setFillStyle(color, 0.85));
  bg.on('pointerout', () => bg.setFillStyle(color, 1));
  bg.on('pointerdown', onClick);

  container.add([bg, text]);
  return container;
}
