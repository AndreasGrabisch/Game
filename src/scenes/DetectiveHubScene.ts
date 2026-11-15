import Phaser from 'phaser';
import { COLORS } from '../game/constants';
import { addComicText, createComicButton, drawComicPanel, drawStar } from '../game/graphics';
import { getGameCenter } from './BootScene';
import { DETECTIVE_CASES, type DetectiveCaseDefinition } from '../data/detectiveCases';
import { getDetectiveLayoutMode } from '../game/detectiveLayout';
import {
  getDetectiveCaseStars,
  getTotalDetectiveStars,
  isDetectiveCaseComplete,
  isDetectiveCaseUnlocked,
  loadDetectiveProgress,
} from '../game/detectiveProgress';
import { DETECTIVE_MARKER_GREEN } from '../game/detectiveSamuel';

export class DetectiveHubScene extends Phaser.Scene {
  constructor() {
    super({ key: 'DetectiveHubScene' });
  }

  create(): void {
    this.drawBackground();
    const { x, y, scale } = getGameCenter(this);
    const layout = getDetectiveLayoutMode(this);
    const s = scale * layout.scaleMul;

    addComicText(this, x, y - (layout.portrait ? 240 : 220) * s, '🔍 Detektiv-Fälle', 36 * s);
    this.drawRewardsBar(x, y - (layout.portrait ? 195 : 175) * s, s, layout.portrait);

    const cases = [...DETECTIVE_CASES].sort((a, b) => a.order - b.order);
    if (layout.portrait) {
      const cardH = 118 * s;
      const gap = 14 * s;
      const startY = y - 55 * s;
      cases.forEach((caseDef, index) => {
        const cy = startY + index * (cardH + gap);
        this.createCaseCard(x, cy, Math.min(320 * s, this.scale.width - 32), cardH, s, caseDef);
      });
    } else {
      const cardW = 300 * s;
      const gap = 24 * s;
      const totalW = cases.length * cardW + (cases.length - 1) * gap;
      const startX = x - totalW / 2 + cardW / 2;
      cases.forEach((caseDef, index) => {
        const cx = startX + index * (cardW + gap);
        this.createCaseCard(cx, y + 20 * s, cardW, 200 * s, s, caseDef);
      });
    }

    createComicButton(
      this,
      x,
      y + (layout.portrait ? 248 : 228) * s,
      '← Minispiele',
      () => this.scene.start('HubScene'),
      0x5b6ee1,
      200,
    );
  }

  private drawRewardsBar(x: number, y: number, scale: number, portrait: boolean): void {
    const progress = loadDetectiveProgress();
    const totalStars = getTotalDetectiveStars();
    const panelW = portrait ? Math.min(340 * scale, this.scale.width - 24) : 520 * scale;
    const panel = drawComicPanel(this, x, y, panelW, portrait ? 72 * scale : 64 * scale);
    panel.setDepth(1);

    const starTxt = addComicText(this, x - panelW / 2 + 70 * scale, y - 4 * scale, `⭐ ${totalStars}`, 22 * scale);
    starTxt.setOrigin(0.5);

    const stickerLabel = progress.stickers.length > 0 ? progress.stickers.join(' ') : '—';
    const stickerTxt = this.add
      .text(x, y, `Sticker: ${stickerLabel}`, {
        fontFamily: 'Fredoka, Comic Sans MS, cursive',
        fontSize: `${portrait ? 18 : 20}px`,
        color: '#1a1a2e',
        align: 'center',
      })
      .setOrigin(0.5);

    const badgeParts = DETECTIVE_CASES.filter((c) => progress.badges.includes(c.id)).map((c) => c.badgeEmoji);
    const badgeStr = badgeParts.length > 0 ? badgeParts.join(' ') : '🔒';
    const badgeTxt = this.add
      .text(x + panelW / 2 - 72 * scale, y, badgeStr, {
        fontSize: `${26 * scale}px`,
      })
      .setOrigin(0.5);

    if (totalStars > 0) {
      drawStar(this, x - panelW / 2 + 28 * scale, y - 8 * scale, 16 * scale, true);
    }
    void stickerTxt;
    void badgeTxt;
  }

  private createCaseCard(
    x: number,
    y: number,
    width: number,
    height: number,
    scale: number,
    caseDef: DetectiveCaseDefinition,
  ): void {
    const unlocked = isDetectiveCaseUnlocked(caseDef.id, caseDef.unlockRequires);
    const done = isDetectiveCaseComplete(caseDef.id);
    const stars = getDetectiveCaseStars(caseDef.id);

    const bg = this.add.rectangle(x, y, width, height, COLORS.panel);
    bg.setStrokeStyle(4, unlocked ? DETECTIVE_MARKER_GREEN : COLORS.outline);
    bg.setAlpha(unlocked ? 1 : 0.72);

    const emoji = this.add.text(x - width / 2 + 42 * scale, y, caseDef.emoji, { fontSize: `${38 * scale}px` }).setOrigin(0.5);
    const title = this.add
      .text(x - width / 2 + 88 * scale, y - 22 * scale, caseDef.title, {
        fontFamily: 'Fredoka, Comic Sans MS, cursive',
        fontSize: `${18 * scale}px`,
        color: '#1a1a2e',
        fontStyle: 'bold',
      })
      .setOrigin(0, 0.5);

    const sub = this.add
      .text(x - width / 2 + 88 * scale, y + 10 * scale, unlocked ? caseDef.tagline : 'Erst Fall 1 schaffen!', {
        fontFamily: 'Fredoka, Comic Sans MS, cursive',
        fontSize: `${14 * scale}px`,
        color: '#444466',
        wordWrap: { width: width - 110 * scale },
      })
      .setOrigin(0, 0);

    const starRowY = y + (height > 140 * scale ? 48 * scale : 38 * scale);
    for (let i = 0; i < 3; i++) {
      drawStar(this, x + width / 2 - 70 * scale + i * 28 * scale, starRowY, 14 * scale, i < stars);
    }

    if (done) {
      const badge = this.add
        .text(x + width / 2 - 36 * scale, y - height / 2 + 22 * scale, caseDef.badgeEmoji, {
          fontSize: `${22 * scale}px`,
        })
        .setOrigin(0.5);
      void badge;
    }

    const btnLabel = unlocked ? (done ? 'Nochmal' : 'Los!') : '🔒';
    const btn = createComicButton(
      this,
      x + width / 2 - 58 * scale,
      y + height / 2 - 32 * scale,
      btnLabel,
      () => {
        if (!unlocked) return;
        this.scene.start('DetectiveCabinetScene', { caseId: caseDef.id });
      },
      unlocked ? DETECTIVE_MARKER_GREEN : 0x888899,
      108,
    );
    if (!unlocked) {
      btn.setAlpha(0.55);
    }

    void [emoji, title, sub, btn];
  }

  private drawBackground(): void {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0xf7f5ef);
    this.add.rectangle(width / 2, height * 0.92, width, height * 0.16, 0xe8dcc8);
  }
}