import Phaser from 'phaser';
import { COLORS } from '../game/constants';
import { addComicText, createComicButton, drawComicPanel, drawStar } from '../game/graphics';
import { getGameCenter } from './BootScene';
import { DETECTIVE_CASES, getDetectiveCaseById, type DetectiveCaseDefinition } from '../data/detectiveCases';
import { dailyMissionSpeech, getOrCreateDailyMission } from '../game/detectiveDaily';
import { getDetectiveLayoutMode } from '../game/detectiveLayout';
import {
  getDetectiveCaseStars,
  getTotalDetectiveStars,
  isDetectiveCaseComplete,
  isDetectiveCaseUnlocked,
  loadDetectiveProgress,
} from '../game/detectiveProgress';
import { DETECTIVE_MARKER_GREEN } from '../game/detectiveSamuel';
import { hideSpeech, showSpeechIf } from '../ui/speech';

export class DetectiveHubScene extends Phaser.Scene {
  constructor() {
    super({ key: 'DetectiveHubScene' });
  }

  create(): void {
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => hideSpeech());

    this.drawBackground();
    const { x, y, scale } = getGameCenter(this);
    const layout = getDetectiveLayoutMode(this);
    const s = scale * layout.scaleMul;

    addComicText(this, x, y - (layout.portrait ? 252 : 228) * s, '🔍 Detektiv-Fälle', 34 * s);
    this.drawRewardsBar(x, y - (layout.portrait ? 208 : 182) * s, s, layout.portrait);
    this.drawDailyMission(x, y - (layout.portrait ? 165 : 140) * s, s, layout.portrait);

    const companion = this.add.text(x - this.scale.width / 2 + 42, y + (layout.portrait ? 268 : 248) * s, '🕵️', {
      fontSize: `${36 * s}px`,
    });
    companion.setDepth(4);
    void companion;

    const cases = [...DETECTIVE_CASES].sort((a, b) => a.order - b.order);
    if (layout.portrait) {
      const cardH = 102 * s;
      const gap = 10 * s;
      const startY = y - 48 * s;
      cases.forEach((caseDef, index) => {
        const cy = startY + index * (cardH + gap);
        this.createCaseCard(x, cy, Math.min(320 * s, this.scale.width - 32), cardH, s, caseDef);
      });
    } else {
      const cardW = Math.min(248 * s, (880 * s - (cases.length - 1) * 16 * s) / cases.length);
      const gap = 16 * s;
      const totalW = cases.length * cardW + (cases.length - 1) * gap;
      const startX = x - totalW / 2 + cardW / 2;
      cases.forEach((caseDef, index) => {
        const cx = startX + index * (cardW + gap);
        this.createCaseCard(cx, y + 8 * s, cardW, 188 * s, s, caseDef);
      });
    }

    const btnY = y + (layout.portrait ? 228 : 210) * s;
    createComicButton(this, x - 120 * s, btnY, '🖼️ Wand', () => this.scene.start('DetectiveWallScene'), DETECTIVE_MARKER_GREEN, 120);
    createComicButton(this, x + 20 * s, btnY, '🔊 Vorlesen', () => void this.readHubAloud(), 0xff6b35, 140);
    createComicButton(this, x + 150 * s, btnY, '← Menü', () => this.scene.start('HubScene'), 0x5b6ee1, 110);

    this.time.delayedCall(400, () => {
      if (!this.scene.isActive()) return;
      void showSpeechIf(this, 'Willkommen beim Detektiv-Spiel! Wähle einen Fall oder schau dir deine Wand an.');
    });
  }

  private async readHubAloud(): Promise<void> {
    const daily = getOrCreateDailyMission();
    const lines = [
      'Detektiv-Fälle.',
      ...DETECTIVE_CASES.map((c) => {
        const unlocked = isDetectiveCaseUnlocked(c.id, c.unlockRequires);
        return unlocked ? c.title : `${c.title} ist noch gesperrt.`;
      }),
      dailyMissionSpeech(daily),
    ];
    await showSpeechIf(this, lines.join(' '));
  }

  private drawDailyMission(x: number, y: number, scale: number, portrait: boolean): void {
    const daily = getOrCreateDailyMission();
    const w = portrait ? Math.min(320 * scale, this.scale.width - 24) : 500 * scale;
    const panel = drawComicPanel(this, x, y, w, portrait ? 56 * scale : 52 * scale);
    panel.setDepth(1);
    const status = daily.done
      ? `✅ ${daily.rewardEmoji} geschafft!`
      : `📋 ${daily.label} (${daily.progress}/${daily.target})`;
    this.add
      .text(x, y, status, {
        fontFamily: 'Fredoka, Comic Sans MS, cursive',
        fontSize: `${portrait ? 15 : 17}px`,
        color: '#1a1a2e',
        fontStyle: 'bold',
        align: 'center',
        wordWrap: { width: w - 24 },
      })
      .setOrigin(0.5);
  }

  private drawRewardsBar(x: number, y: number, scale: number, portrait: boolean): void {
    const progress = loadDetectiveProgress();
    const totalStars = getTotalDetectiveStars();
    const panelW = portrait ? Math.min(320 * scale, this.scale.width - 24) : 520 * scale;
    const panel = drawComicPanel(this, x, y, panelW, portrait ? 64 * scale : 58 * scale);
    panel.setDepth(1);

    addComicText(this, x - panelW / 2 + 70 * scale, y - 4 * scale, `⭐ ${totalStars}`, 22 * scale).setOrigin(0.5);

    const stickerLabel = progress.stickers.length > 0 ? progress.stickers.join(' ') : '—';
    this.add
      .text(x, y, `Sticker: ${stickerLabel}`, {
        fontFamily: 'Fredoka, Comic Sans MS, cursive',
        fontSize: `${portrait ? 16 : 18}px`,
        color: '#1a1a2e',
        align: 'center',
        wordWrap: { width: panelW - 120 },
      })
      .setOrigin(0.5);

    const badgeParts = DETECTIVE_CASES.filter((c) => progress.badges.includes(c.id)).map((c) => c.badgeEmoji);
    this.add
      .text(x + panelW / 2 - 72 * scale, y, badgeParts.length > 0 ? badgeParts.join(' ') : '🔒', {
        fontSize: `${24 * scale}px`,
      })
      .setOrigin(0.5);

    if (totalStars > 0) {
      drawStar(this, x - panelW / 2 + 28 * scale, y - 8 * scale, 16 * scale, true);
    }
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
    const lockLine = caseDef.unlockRequires
      ? `Erst ${getDetectiveCaseById(caseDef.unlockRequires)?.title ?? 'vorherigen Fall'} schaffen!`
      : '';

    const bg = this.add.rectangle(x, y, width, height, COLORS.panel);
    bg.setStrokeStyle(4, unlocked ? DETECTIVE_MARKER_GREEN : COLORS.outline);
    bg.setAlpha(unlocked ? 1 : 0.72);

    this.add.text(x - width / 2 + 36 * scale, y, caseDef.emoji, { fontSize: `${34 * scale}px` }).setOrigin(0.5);
    this.add
      .text(x - width / 2 + 76 * scale, y - 20 * scale, caseDef.title, {
        fontFamily: 'Fredoka, Comic Sans MS, cursive',
        fontSize: `${16 * scale}px`,
        color: '#1a1a2e',
        fontStyle: 'bold',
      })
      .setOrigin(0, 0.5);

    this.add
      .text(x - width / 2 + 76 * scale, y + 6 * scale, unlocked ? caseDef.tagline : lockLine, {
        fontFamily: 'Fredoka, Comic Sans MS, cursive',
        fontSize: `${13 * scale}px`,
        color: '#444466',
        wordWrap: { width: width - 100 * scale },
      })
      .setOrigin(0, 0);

    const starRowY = y + (height > 120 * scale ? 44 * scale : 34 * scale);
    for (let i = 0; i < 3; i++) {
      drawStar(this, x + width / 2 - 64 * scale + i * 26 * scale, starRowY, 13 * scale, i < stars);
    }

    if (done) {
      this.add
        .text(x + width / 2 - 30 * scale, y - height / 2 + 20 * scale, caseDef.badgeEmoji, {
          fontSize: `${20 * scale}px`,
        })
        .setOrigin(0.5);
    }

    const btnLabel = unlocked ? (done ? 'Nochmal' : 'Los!') : '🔒';
    const btn = createComicButton(
      this,
      x + width / 2 - 52 * scale,
      y + height / 2 - 28 * scale,
      btnLabel,
      () => {
        if (!unlocked) return;
        this.scene.start('DetectiveCabinetScene', { caseId: caseDef.id });
      },
      unlocked ? DETECTIVE_MARKER_GREEN : 0x888899,
      100,
    );
    if (!unlocked) {
      btn.setAlpha(0.55);
    }
  }

  private drawBackground(): void {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0xf7f5ef);
    this.add.rectangle(width / 2, height * 0.92, width, height * 0.16, 0xe8dcc8);
  }
}