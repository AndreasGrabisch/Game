import Phaser from 'phaser';
import { COLORS } from '../game/constants';
import { addComicText, createComicButton, drawComicPanel } from '../game/graphics';
import { getGameCenter } from './BootScene';
import { DETECTIVE_CASES } from '../data/detectiveCases';
import { getDetectiveLayoutMode } from '../game/detectiveLayout';
import { MISSION_STICKER_EMOJIS } from '../game/detectiveDailyStickers';
import { loadDetectiveProgress } from '../game/detectiveProgress';
import { readSceneEnterStyle, runSceneEnter, transitionToScene } from '../game/sceneTransition';
import { drawDetectiveWallBackdrop } from '../game/sceneBackgrounds';
import { attachTitleMark, drawRewardMark } from '../game/comicIcons';
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

    drawDetectiveWallBackdrop(this);
    const wallTitle = addComicText(this, x, y - (layout.portrait ? 248 : 228) * s, 'Detektiv-Wand', 34 * s);
    attachTitleMark(this, wallTitle, '🖼️');

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
      const tile = drawRewardMark(this, earned ? entry.emoji : '⭐', 36 * s, true);
      tile.setPosition(px, py);
      tile.setAlpha(earned ? 1 : 0.35);
      tile.setDepth(2);

      if (earned) {
        const hit = this.add.circle(px, py, 22 * s, 0xffffff, 0.001).setDepth(3);
        hit.setInteractive({ useHandCursor: true });
        hit.on('pointerdown', () => {
          void showSpeechIf(this, entry.label);
        });
      }
    });

    addComicText(this, x, y + (layout.portrait ? 40 : 60) * s, 'Abzeichen', 22 * s);
    const badgeY = y + (layout.portrait ? 78 : 98) * s;
    const badgeSpan = (DETECTIVE_CASES.length - 1) * 56 * s;
    DETECTIVE_CASES.forEach((caseDef, index) => {
      const earned = progress.badges.includes(caseDef.id);
      const bx = x - badgeSpan / 2 + index * 56 * s;
      const badge = drawRewardMark(this, earned ? caseDef.badgeEmoji : '🔒', 34 * s, true);
      badge.setPosition(bx, badgeY);
      badge.setDepth(2);
      if (earned) {
        const hit = this.add.circle(bx, badgeY, 20 * s, 0xffffff, 0.001).setDepth(3);
        hit.setInteractive({ useHandCursor: true });
        hit.on('pointerdown', () => {
          void showSpeechIf(this, caseDef.badgeLabel);
        });
      }
    });

    createComicButton(this, x, y + (layout.portrait ? 200 : 188) * s, '← Zurück', () => transitionToScene(this, 'DetectiveHubScene', undefined, { showOverlay: false }), COLORS.samuelPants, 180);
  }
}