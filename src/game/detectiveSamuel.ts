import Phaser from 'phaser';

export const DETECTIVE_MARKER_GREEN = 0x3d7a54;
export const DETECTIVE_MARKER_GREY = 0x8a8a8a;
export const DETECTIVE_PAPER = 0xf7f5ef;

export function drawScribbleRect(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  fillColor: number,
  strokeColor: number,
  lineWidth = 3,
): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics();
  g.lineStyle(lineWidth, strokeColor, 1);
  g.fillStyle(fillColor, 0.85);
  g.fillRoundedRect(x - width / 2, y - height / 2, width, height, 6);
  g.strokeRoundedRect(x - width / 2, y - height / 2, width, height, 6);

  for (let i = 0; i < 14; i++) {
    const sx = x - width / 2 + 6 + Math.random() * (width - 12);
    const sy = y - height / 2 + 6 + Math.random() * (height - 12);
    g.lineStyle(2, strokeColor, 0.15);
    g.lineBetween(sx, sy, sx + Phaser.Math.Between(-12, 12), sy + Phaser.Math.Between(-8, 8));
  }

  return g;
}

function drawSamuelSketch(scene: Phaser.Scene, y: number, scale: number): Phaser.GameObjects.Container {
  const c = scene.add.container(0, y);
  const s = scale;
  const head = scene.add.circle(0, -34 * s, 22 * s, DETECTIVE_MARKER_GREEN, 0.15);
  head.setStrokeStyle(3 * s, DETECTIVE_MARKER_GREEN);
  const hair = scene.add.ellipse(0, -48 * s, 40 * s, 18 * s, DETECTIVE_MARKER_GREY, 0.35);
  hair.setStrokeStyle(2 * s, DETECTIVE_MARKER_GREEN);
  const body = scene.add.rectangle(0, 4 * s, 34 * s, 40 * s, DETECTIVE_MARKER_GREY, 0.35);
  body.setStrokeStyle(3 * s, DETECTIVE_MARKER_GREEN);
  const legL = scene.add.rectangle(-10 * s, 38 * s, 12 * s, 28 * s, DETECTIVE_MARKER_GREEN, 0.2);
  legL.setStrokeStyle(2 * s, DETECTIVE_MARKER_GREEN);
  const legR = scene.add.rectangle(10 * s, 38 * s, 12 * s, 28 * s, DETECTIVE_MARKER_GREEN, 0.2);
  legR.setStrokeStyle(2 * s, DETECTIVE_MARKER_GREEN);
  c.add([legL, legR, body, hair, head]);
  return c;
}

export function createDetectiveSamuel(
  scene: Phaser.Scene,
  x: number,
  y: number,
  scale: number,
): Phaser.GameObjects.Container {
  const root = scene.add.container(x, y);

  const board = drawScribbleRect(scene, 0, 0, 150 * scale, 195 * scale, DETECTIVE_PAPER, DETECTIVE_MARKER_GREEN, 4);
  root.add(board);

  const nameTag = scene.add
    .text(0, -82 * scale, 'SAMUEL', {
      fontFamily: 'Fredoka, Comic Sans MS, cursive',
      fontSize: `${16 * scale}px`,
      color: '#1a1a2e',
      fontStyle: 'bold',
      letterSpacing: 2,
    })
    .setOrigin(0.5);
  root.add(nameTag);

  if (scene.textures.exists('detective-samuel')) {
    const portrait = scene.add.image(0, 18 * scale, 'detective-samuel');
    portrait.setDisplaySize(118 * scale, 132 * scale);
    root.add(portrait);
  } else {
    root.add(drawSamuelSketch(scene, 18 * scale, scale));
  }

  const clipFrame = scene.add.rectangle(0, 18 * scale, 122 * scale, 136 * scale);
  clipFrame.setVisible(false);

  root.setDepth(4);
  return root;
}

export type SamuelMood = 'idle' | 'peek' | 'happy' | 'oops';

export function animateSamuel(
  scene: Phaser.Scene,
  samuel: Phaser.GameObjects.Container,
  mood: SamuelMood,
  scale: number,
): void {
  scene.tweens.killTweensOf(samuel);

  switch (mood) {
    case 'idle':
      samuel.setAngle(0);
      samuel.setScale(1);
      scene.tweens.add({
        targets: samuel,
        y: samuel.y - 5 * scale,
        duration: 1400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
      break;
    case 'peek':
      scene.tweens.add({
        targets: samuel,
        x: samuel.x + 22 * scale,
        angle: 4,
        duration: 220,
        yoyo: true,
        ease: 'Quad.easeOut',
        onComplete: () => animateSamuel(scene, samuel, 'idle', scale),
      });
      break;
    case 'happy':
      scene.tweens.add({
        targets: samuel,
        y: samuel.y - 18 * scale,
        scale: 1.06,
        duration: 180,
        yoyo: true,
        ease: 'Back.easeOut',
        onComplete: () => animateSamuel(scene, samuel, 'idle', scale),
      });
      break;
    case 'oops':
      scene.tweens.add({
        targets: samuel,
        angle: -6,
        duration: 90,
        yoyo: true,
        repeat: 2,
        onComplete: () => {
          samuel.setAngle(0);
          animateSamuel(scene, samuel, 'idle', scale);
        },
      });
      break;
  }
}
