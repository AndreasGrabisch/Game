import Phaser from 'phaser';
import { COLORS } from '../game/constants';
import { addComicText, createComicButton, drawComicPanel, floatFeedback } from '../game/graphics';
import { reactCompanionCheer, spawnSamuelCompanion } from '../game/characterCompanion';
import { feedbackSounds } from '../game/feedbackAudio';
import { drawTreasureChestBackdrop } from '../game/sceneBackgrounds';
import { bindSceneMusic } from '../game/sceneMusic';
import { readSceneEnterStyle, runSceneEnter, transitionToHub } from '../game/sceneTransition';
import { getGameCenter } from './BootScene';
import { getDetectiveLayoutMode } from '../game/detectiveLayout';
import { buildTreasuryStickers } from '../game/appRewardCatalog';
import { bumpStickerTap } from '../game/appTreasury';
import { getAppRewardSummary } from '../game/appProgress';
export class TreasureChestScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TreasureChestScene' });
  }

  create(): void {
    runSceneEnter(this, readSceneEnterStyle(this));
    bindSceneMusic(this, 'home');
    drawTreasureChestBackdrop(this);

    const { x, y, scale } = getGameCenter(this);
    const layout = getDetectiveLayoutMode(this);
    const s = scale * (layout.portrait ? 0.88 : 1);
    const summary = getAppRewardSummary();

    addComicText(this, x, y - (layout.portrait ? 248 : 228) * s, '🏆 Samuels Schatzkiste', 34 * s);
    this.drawSummaryBar(x, y - (layout.portrait ? 200 : 182) * s, s, layout.portrait, summary);

    const samuel = spawnSamuelCompanion(this, x - (layout.portrait ? 150 : 280) * s, y + (layout.portrait ? 200 : 140) * s, 0.75 * s);

    const stickers = buildTreasuryStickers();
    const cols = layout.portrait ? 3 : 4;
    const cell = (layout.portrait ? 96 : 104) * s;
    const gridW = cols * cell;
    const startX = x - gridW / 2 + cell / 2;
    const startY = y - (layout.portrait ? 58 : 40) * s;

    stickers.forEach((sticker, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const px = startX + col * cell;
      const py = startY + row * cell;
      this.createStickerTile(px, py, s, sticker.emoji, sticker.label, sticker.unlocked, sticker.id, samuel);
    });

    addComicText(
      this,
      x,
      y + (layout.portrait ? 168 : 150) * s,
      'Tippe deine Sticker — sammle sie aus allen Spielen!',
      16 * s,
    );

    createComicButton(
      this,
      x,
      y + (layout.portrait ? 228 : 210) * s,
      '← Spielplatz',
      () => transitionToHub(this),
      0x5b6ee1,
      layout.portrait ? 160 : 180,
    );

    this.input.once('pointerdown', () => void feedbackSounds.unlock());
  }

  private drawSummaryBar(
    x: number,
    y: number,
    scale: number,
    portrait: boolean,
    summary: ReturnType<typeof getAppRewardSummary>,
  ): void {
    const w = portrait ? Math.min(340 * scale, this.scale.width - 24) : 560 * scale;
    const panel = drawComicPanel(this, x, y, w, 54 * scale);
    panel.setDepth(1);

    const line = `⭐ ${summary.totalStars}  ·  🚲 ${summary.bikeStars}  ·  🔍 ${summary.detectiveStars}  ·  📋 ${summary.dailyProgress} ${summary.dailyEmoji}`;
    this.add
      .text(x, y, line, {
        fontFamily: 'Fredoka, Comic Sans MS, cursive',
        fontSize: `${portrait ? 13 : 15}px`,
        color: '#1a1a2e',
        fontStyle: 'bold',
        align: 'center',
        wordWrap: { width: w - 16 },
      })
      .setOrigin(0.5)
      .setDepth(2);
  }

  private createStickerTile(
    x: number,
    y: number,
    scale: number,
    emoji: string,
    label: string,
    unlocked: boolean,
    id: string,
    samuel: Phaser.GameObjects.Container,
  ): void {
    const size = 76 * scale;
    const bg = this.add.rectangle(x, y, size, size, unlocked ? COLORS.panel : 0xeeeeee, unlocked ? 1 : 0.6);
    bg.setStrokeStyle(4, unlocked ? COLORS.star : COLORS.outline, unlocked ? 1 : 0.4);
    bg.setDepth(3);

    const icon = this.add.text(x, y - 6 * scale, emoji, {
      fontSize: `${unlocked ? 38 : 30}px`,
    }).setOrigin(0.5);
    icon.setAlpha(unlocked ? 1 : 0.35);
    icon.setDepth(4);

    if (!unlocked) return;

    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerdown', () => {
      const taps = bumpStickerTap(id);
      feedbackSounds.colorPop();
      reactCompanionCheer(this, samuel);
      floatFeedback(this, x, y - 44 * scale, label, '#1a1a2e', 14 * scale);
      this.tweens.add({
        targets: [bg, icon],
        scale: 1.12,
        duration: 160,
        yoyo: true,
        ease: 'Back.easeOut',
      });
      if (taps === 5) {
        floatFeedback(this, x, y + 40 * scale, 'Favorit! ⭐', '#ff6b35', 16 * scale);
      }
    });
  }
}