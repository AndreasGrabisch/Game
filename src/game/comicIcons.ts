import Phaser from 'phaser';
import { COLORS } from './constants';
import { drawCartoonBell, drawCartoonWheel, drawHubBikeIcon } from './bikeGraphics';
import { drawDecoyIcon, drawIllustratedTree, drawSoccerBall } from './objectGraphics';

/** Drawn stand-in for reward and UI emoji. Unknown marks become a star sticker. */
export function drawRewardMark(
  scene: Phaser.Scene,
  emoji: string,
  size: number,
  sticker = true,
): Phaser.GameObjects.Container {
  const root = scene.add.container(0, 0);
  const glyphSize = sticker ? size * 0.62 : size;
  if (sticker) {
    const back = scene.add.graphics();
    back.fillStyle(0xfff8e7, 1);
    back.lineStyle(Math.max(2, size * 0.07), COLORS.outline);
    back.fillCircle(0, 0, size * 0.48);
    back.strokeCircle(0, 0, size * 0.48);
    back.fillStyle(0xffffff, 0.4);
    back.fillEllipse(-size * 0.12, -size * 0.16, size * 0.26, size * 0.14);
    root.add(back);
  }
  root.add(paintGlyph(scene, emoji, glyphSize));
  return root;
}

export function attachTitleMark(
  scene: Phaser.Scene,
  label: Phaser.GameObjects.Text,
  emoji: string,
): Phaser.GameObjects.Container {
  const px = Number.parseFloat(String(label.style.fontSize)) || 28;
  const markSize = px * 0.7;
  label.setX(label.x + markSize * 0.35);
  const mark = drawRewardMark(scene, emoji, markSize);
  mark.setPosition(label.x - label.width / 2 - markSize * 0.7, label.y);
  mark.setDepth(label.depth);
  return mark;
}

function paintGlyph(scene: Phaser.Scene, emoji: string, size: number): Phaser.GameObjects.Container {
  const root = scene.add.container(0, 0);
  const s = size;
  const g = scene.add.graphics();

  const starLike = emoji === '⭐' || emoji === '🌟' || emoji === '✨';
  if (starLike) {
    const star = scene.add.star(0, 0, emoji === '✨' ? 4 : 5, s * 0.22, s * 0.48, COLORS.star);
    star.setStrokeStyle(Math.max(2, s * 0.06), COLORS.outline);
    root.add(star);
    return root;
  }

  if (emoji === '🚲') {
    root.add(drawHubBikeIcon(scene, s / 50));
    return root;
  }
  if (emoji === '🛞') {
    root.add(drawCartoonWheel(scene, 0, 0, s * 0.42, 1, 'round'));
    return root;
  }
  if (emoji === '🔔') {
    root.add(drawCartoonBell(scene, s / 28));
    return root;
  }
  if (emoji === '⚽') {
    root.add(drawSoccerBall(scene, s * 0.42));
    return root;
  }
  if (emoji === '🌳') {
    root.add(drawIllustratedTree(scene, s / 52));
    return root;
  }
  if (emoji === '🧁') {
    root.add(drawDecoyIcon(scene, 'cupcake', s / 36));
    return root;
  }

  g.lineStyle(Math.max(2, s * 0.07), COLORS.outline);

  if (emoji === '🔍') {
    g.lineStyle(Math.max(3, s * 0.1), 0x5b6ee1);
    g.strokeCircle(-s * 0.08, -s * 0.06, s * 0.28);
    g.fillStyle(0xd7ecff, 0.85);
    g.fillCircle(-s * 0.08, -s * 0.06, s * 0.22);
    g.lineStyle(Math.max(3, s * 0.1), 0x8b6914);
    g.lineBetween(s * 0.08, s * 0.1, s * 0.36, s * 0.38);
    root.add(g);
    return root;
  }

  if (emoji === '🎨') {
    const blobs = [0xff6b6b, 0xffd93d, 0x6bcb77, 0x5b6ee1];
    blobs.forEach((color, i) => {
      g.fillStyle(color, 1);
      g.fillCircle(-s * 0.24 + i * s * 0.16, s * 0.08, s * 0.14);
    });
    g.lineStyle(Math.max(2, s * 0.06), COLORS.outline);
    blobs.forEach((_, i) => g.strokeCircle(-s * 0.24 + i * s * 0.16, s * 0.08, s * 0.14));
    root.add(g);
    return root;
  }

  if (emoji === '🏆') {
    g.fillStyle(0xffd93d, 1);
    g.fillRoundedRect(-s * 0.22, -s * 0.28, s * 0.44, s * 0.28, 4);
    g.strokeRoundedRect(-s * 0.22, -s * 0.28, s * 0.44, s * 0.28, 4);
    g.fillTriangle(-s * 0.22, -s * 0.28, -s * 0.36, -s * 0.46, -s * 0.08, -s * 0.28);
    g.fillTriangle(s * 0.22, -s * 0.28, s * 0.36, -s * 0.46, s * 0.08, -s * 0.28);
    g.fillRect(-s * 0.06, 0, s * 0.12, s * 0.16);
    g.fillRoundedRect(-s * 0.16, s * 0.14, s * 0.32, s * 0.1, 2);
    root.add(g);
    return root;
  }

  if (emoji === '🏁') {
    g.fillStyle(0xdddddd, 1);
    g.fillRect(-s * 0.28, -s * 0.36, s * 0.08, s * 0.72);
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        g.fillStyle((row + col) % 2 === 0 ? COLORS.outline : COLORS.white, 1);
        g.fillRect(-s * 0.18 + col * s * 0.14, -s * 0.36 + row * s * 0.14, s * 0.14, s * 0.14);
      }
    }
    root.add(g);
    return root;
  }

  if (emoji === '🎯') {
    g.lineStyle(Math.max(2, s * 0.06), COLORS.outline);
    g.fillStyle(0xff6b6b, 1);
    g.fillCircle(0, 0, s * 0.36);
    g.strokeCircle(0, 0, s * 0.36);
    g.fillStyle(COLORS.white, 1);
    g.fillCircle(0, 0, s * 0.22);
    g.strokeCircle(0, 0, s * 0.22);
    g.fillStyle(0xff6b35, 1);
    g.fillCircle(0, 0, s * 0.1);
    root.add(g);
    return root;
  }

  if (emoji === '⚙️') {
    g.fillStyle(0xb0b6be, 1);
    g.fillCircle(0, 0, s * 0.18);
    g.strokeCircle(0, 0, s * 0.18);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      g.fillCircle(Math.cos(a) * s * 0.32, Math.sin(a) * s * 0.32, s * 0.1);
      g.strokeCircle(Math.cos(a) * s * 0.32, Math.sin(a) * s * 0.32, s * 0.1);
    }
    root.add(g);
    return root;
  }

  if (emoji === '🗄️') {
    g.fillStyle(0xd7a86e, 1);
    g.fillRoundedRect(-s * 0.34, -s * 0.36, s * 0.68, s * 0.72, 6);
    g.strokeRoundedRect(-s * 0.34, -s * 0.36, s * 0.68, s * 0.72, 6);
    g.lineStyle(Math.max(2, s * 0.05), 0x8b6914);
    g.lineBetween(-s * 0.34, -s * 0.02, s * 0.34, -s * 0.02);
    g.fillStyle(0xf0d060, 1);
    g.fillCircle(0, -s * 0.18, s * 0.06);
    g.fillCircle(0, s * 0.16, s * 0.06);
    root.add(g);
    return root;
  }

  if (emoji === '🍪') {
    g.fillStyle(0xd9a066, 1);
    g.fillCircle(0, 0, s * 0.36);
    g.strokeCircle(0, 0, s * 0.36);
    g.fillStyle(0x6b3f2a, 1);
    g.fillCircle(-s * 0.12, -s * 0.06, s * 0.07);
    g.fillCircle(s * 0.1, s * 0.08, s * 0.07);
    g.fillCircle(s * 0.02, -s * 0.16, s * 0.06);
    root.add(g);
    return root;
  }

  if (emoji === '🎖️' || emoji === '🏅') {
    g.fillStyle(emoji === '🏅' ? 0xffd93d : 0x7eb6ff, 1);
    g.fillCircle(0, s * 0.06, s * 0.22);
    g.strokeCircle(0, s * 0.06, s * 0.22);
    g.fillStyle(0xff6b6b, 1);
    g.fillTriangle(-s * 0.16, -s * 0.08, -s * 0.28, -s * 0.42, 0, -s * 0.16);
    g.fillTriangle(s * 0.16, -s * 0.08, s * 0.28, -s * 0.42, 0, -s * 0.16);
    root.add(g);
    return root;
  }

  if (emoji === '🎁') {
    g.fillStyle(0xff6b6b, 1);
    g.fillRoundedRect(-s * 0.28, -s * 0.12, s * 0.56, s * 0.4, 4);
    g.strokeRoundedRect(-s * 0.28, -s * 0.12, s * 0.56, s * 0.4, 4);
    g.fillStyle(0xffd93d, 1);
    g.fillRect(-s * 0.06, -s * 0.12, s * 0.12, s * 0.4);
    g.fillRect(-s * 0.28, 0, s * 0.56, s * 0.1);
    g.fillCircle(-s * 0.08, -s * 0.22, s * 0.08);
    g.fillCircle(s * 0.08, -s * 0.22, s * 0.08);
    root.add(g);
    return root;
  }

  if (emoji === '🌈') {
    const bands = [0xff6b6b, 0xffd93d, 0x6bcb77];
    bands.forEach((color, i) => {
      g.lineStyle(Math.max(3, s * 0.08), color);
      g.beginPath();
      g.arc(0, s * 0.12, s * (0.4 - i * 0.1), Math.PI, 0, false);
      g.strokePath();
    });
    root.add(g);
    return root;
  }

  if (emoji === '🔒') {
    g.fillStyle(0xb7bcc8, 1);
    g.fillRoundedRect(-s * 0.22, -s * 0.02, s * 0.44, s * 0.36, 4);
    g.strokeRoundedRect(-s * 0.22, -s * 0.02, s * 0.44, s * 0.36, 4);
    g.lineStyle(Math.max(3, s * 0.08), COLORS.outline);
    g.beginPath();
    g.arc(0, -s * 0.02, s * 0.16, Math.PI, 0, false);
    g.strokePath();
    root.add(g);
    return root;
  }

  if (emoji === '🎒') {
    g.fillStyle(0xff6b35, 1);
    g.fillRoundedRect(-s * 0.26, -s * 0.16, s * 0.52, s * 0.48, 8);
    g.strokeRoundedRect(-s * 0.26, -s * 0.16, s * 0.52, s * 0.48, 8);
    g.lineStyle(Math.max(2, s * 0.06), COLORS.outline);
    g.beginPath();
    g.arc(0, -s * 0.16, s * 0.16, Math.PI, 0, false);
    g.strokePath();
    g.fillStyle(0xffd93d, 1);
    g.fillRoundedRect(-s * 0.12, -s * 0.02, s * 0.24, s * 0.16, 3);
    root.add(g);
    return root;
  }

  if (emoji === '🖼️') {
    g.fillStyle(0x9ed8ff, 1);
    g.fillRoundedRect(-s * 0.32, -s * 0.28, s * 0.64, s * 0.52, 4);
    g.lineStyle(Math.max(3, s * 0.08), 0x8b6914);
    g.strokeRoundedRect(-s * 0.32, -s * 0.28, s * 0.64, s * 0.52, 4);
    g.fillStyle(0x7ec850, 1);
    g.fillEllipse(0, s * 0.06, s * 0.36, s * 0.16);
    root.add(g);
    return root;
  }

  if (emoji === '✅') {
    g.lineStyle(Math.max(3, s * 0.1), 0x2f8a3c);
    g.beginPath();
    g.moveTo(-s * 0.22, 0);
    g.lineTo(-s * 0.05, s * 0.18);
    g.lineTo(s * 0.26, -s * 0.18);
    g.strokePath();
    root.add(g);
    return root;
  }

  const star = scene.add.star(0, 0, 5, s * 0.2, s * 0.42, COLORS.star);
  star.setStrokeStyle(2, COLORS.outline);
  root.add(star);
  return root;
}
