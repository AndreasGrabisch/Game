import Phaser from 'phaser';
import { COLORS } from '../game/constants';
import { addComicText, createComicButton, drawComicPanel } from '../game/graphics';
import { getGameCenter } from './BootScene';
import { DETECTIVE_CASES } from '../data/detectiveCases';
import { getDetectiveLayoutMode } from '../game/detectiveLayout';
import { MISSION_STICKER_EMOJIS } from '../game/detectiveDailyStickers';
import { loadDetectiveProgress } from '../game/detectiveProgress';
import { readSceneEnterStyle, runSceneEnter, transitionToScene } from '../game/sceneTransition';
import { showSpeechIf } from '../ui/speech';

export class DetectiveWallScene extends Phaser.Scene {
  constructor() {
    super({ key: 'DetectiveWallScene' });
  }

  create(): void {
    runSceneEnter(this, readSceneEnterStyle(this));
    const { x, y, scale } = getGameCenter(this);
    const layout = getDetectiveLayoutMode(this);
    const s = scale * layout.scaleMul;
    const progress = loadDetectiveProgress();

    this.add.rectangle(this.scale.width / 2, this.scale.height / 2, this.scale.width, this.scale.height, 0xf7f5ef);
    addComicText(this, x, y - (layout.portrait ? 248 : 228) * s, '🖼️ Detektiv-Wand', 34 * s);

    const panel = drawComicPanel(this, x, y - 20 * s, layout.portrait ? 340 * s : 600 * s, layout.portrait ? 360 * s : 300 * s);
    panel.setDepth(1);

    const allStickers = [
      ...DETECTIVE_CASES.map((c) => ({ emoji: c.stickerReward, label: `Sticker von ${c.title}`, id: `case-${c.id}` })),
      ...MISSION_STICKER_EMOJIS.map((emoji) => ({ emoji, label: 'Tages-Mission Sticker', id: `daily-${emoji}` })),
    ];

    const cols = layout.portrait ? 4 : 6;
    const cell = 56 * s;
    const gridW = cols * cell;
    const startX = x - gridW / 2 + cell / 2;
    const startY = y - (layout.portrait ? 130 : 90) * s;

    allStickers.forEach((entry, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const px = startX + col * cell;
      const py = startY + row * cell;
      const earned = progress.stickers.includes(entry.emoji);
      const tile = this.add
        .text(px, py, earned ? entry.emoji : '▫️', {
          fontSize: `${earned ? 32 : 22 * s}px`,
        })
        .setOrigin(0.5)
        .setAlpha(earned ? 1 : 0.45)
        .setDepth(2);

      if (earned) {
        tile.setInteractive({ useHandCursor: true });
        tile.on('pointerdown', () => {
          void showSpeechIf(this, `${entry.emoji} ${entry.label}`);
        });
      }
    });

    addComicText(this, x, y + (layout.portrait ? 40 : 60) * s, 'Abzeichen', 22 * s);
    const badgeY = y + (layout.portrait ? 78 : 98) * s;
    const badgeSpan = (DETECTIVE_CASES.length - 1) * 56 * s;
    DETECTIVE_CASES.forEach((caseDef, index) => {
      const earned = progress.badges.includes(caseDef.id);
      const bx = x - badgeSpan / 2 + index * 56 * s;
      const badge = this.add
        .text(bx, badgeY, earned ? caseDef.badgeEmoji : '🔒', {
          fontSize: `${30 * s}px`,
        })
        .setOrigin(0.5);
      if (earned) {
        badge.setInteractive({ useHandCursor: true });
        badge.on('pointerdown', () => {
          void showSpeechIf(this, `${caseDef.badgeEmoji} ${caseDef.badgeLabel}`);
        });
      }
    });

    createComicButton(this, x, y + (layout.portrait ? 200 : 188) * s, '← Zurück', () => transitionToScene(this, 'DetectiveHubScene', undefined, { showOverlay: false }), COLORS.samuelPants, 180);
  }
}