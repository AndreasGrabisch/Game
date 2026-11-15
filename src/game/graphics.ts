import Phaser from 'phaser';
import { COLORS } from './constants';
import { feedbackSounds } from './feedbackAudio';

export interface BikeDrawOptions {
  showWheels?: boolean;
  showFrame?: boolean;
  showPedals?: boolean;
  showHandlebar?: boolean;
  showBell?: boolean;
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
    showBell = false,
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

  if (showBell) {
    const bell = scene.add.circle(-16 * s, -58 * s, 9 * s, COLORS.star);
    bell.setStrokeStyle(2 * s, COLORS.outline);
    const ding = scene.add.text(-16 * s, -58 * s, '🔔', { fontSize: `${10 * s}px` }).setOrigin(0.5);
    container.add([bell, ding]);
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
