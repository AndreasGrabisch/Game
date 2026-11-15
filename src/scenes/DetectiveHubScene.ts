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
  hasSeenDetectiveHubTutorial,
  isDetectiveCaseComplete,
  isDetectiveCaseUnlocked,
  loadDetectiveProgress,
  setDetectiveHubTutorialSeen,
} from '../game/detectiveProgress';
import { DETECTIVE_MARKER_GREEN } from '../game/detectiveSamuel';
import { bindSceneMusic } from '../game/sceneMusic';
import { hideSpeech, showSpeechIf } from '../ui/speech';

export class DetectiveHubScene extends Phaser.Scene {
  constructor() {
    super({ key: 'DetectiveHubScene' });
  }

  create(): void {
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => hideSpeech());
    bindSceneMusic(this, 'detective');

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
    this.tweens.add({
      targets: companion,
      y: companion.y - 6 * s,
      duration: 1100,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

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
    const btnW = layout.portrait ? 104 : 120;
    createComicButton(this, x - 125 * s, btnY, '🖼️ Wand', () => this.scene.start('DetectiveWallScene'), DETECTIVE_MARKER_GREEN, btnW);
    createComicButton(this, x + 5 * s, btnY, '🔊 Vorlesen', () => void this.readHubAloud(), 0xff6b35, btnW + 12);
    createComicButton(this, x + 130 * s, btnY, '← Menü', () => this.scene.start('HubScene'), 0x5b6ee1, btnW);

    this.time.delayedCall(400, () => {
      if (!this.scene.isActive()) return;
      if (!hasSeenDetectiveHubTutorial()) {
        this.showProgressTutorial(x, y, s, layout.portrait);
        return;
      }
      void showSpeechIf(this, 'Willkommen beim Detektiv-Spiel! Wähle einen Fall oder schau dir deine Wand an.');
    });
  }

  private showProgressTutorial(x: number, y: number, scale: number, portrait: boolean): void {
    const overlay = this.add.container(0, 0).setDepth(80);
    const veil = this.add.rectangle(x, y, this.scale.width, this.scale.height, 0x000000, 0.45);
    const panel = drawComicPanel(this, x, y, portrait ? 340 * scale : 520 * scale, portrait ? 280 * scale : 240 * scale);
    const title = addComicText(this, x, y - 72 * scale, 'So geht\'s!', 30 * scale);
    const body = this.add
      .text(x, y - 12 * scale, '🕵️ Fall 1 ist frei.\n⭐ Mehr Sterne = besser.\n🔒 Nächster Fall nach dem vorherigen.\n📋 Tages-Mission gibt Extra-Sticker!', {
        fontFamily: 'Fredoka, Comic Sans MS, cursive',
        fontSize: `${portrait ? 17 : 19}px`,
        color: '#1a1a2e',
        align: 'center',
        lineSpacing: 6,
      })
      .setOrigin(0.5);
    const readBtn = createComicButton(this, x - 95 * scale, y + 82 * scale, '🔊 Vorlesen', () => {
      void showSpeechIf(
        this,
        'Fall eins ist frei. Sterne sammeln. Den nächsten Fall schaltest du frei, wenn der vorherige geschafft ist. Die Tages-Mission bringt Extra-Sticker.',
      );
    }, 0xff6b35, 130);
    const okBtn = createComicButton(this, x + 95 * scale, y + 82 * scale, 'Los!', () => {
      setDetectiveHubTutorialSeen();
      overlay.destroy(true);
      void showSpeechIf(this, 'Super! Wähle deinen ersten Fall.');
    }, DETECTIVE_MARKER_GREEN, 120);
    overlay.add([veil, panel, title, body, readBtn, okBtn]);
    title.setDepth(81);
    body.setDepth(81);
  }

  private async readHubAloud(): Promise<void> {
    const daily = getOrCreateDailyMission();
    const lines = [
      'Detektiv-Fälle.',
      ...DETECTIVE_CASES.map((c) => {
        const unlocked = isDetectiveCaseUnlocked(c.id, c.unlockRequires);
        const stars = getDetectiveCaseStars(c.id);
        if (!unlocked) return `${c.title} ist noch gesperrt.`;
        return stars > 0 ? `${c.title}, ${stars} Sterne.` : c.title;
      }),
      dailyMissionSpeech(daily),
    ];
    await showSpeechIf(this, lines.join(' '));
  }

  private drawDailyMission(x: number, y: number, scale: number, portrait: boolean): void {
    const daily = getOrCreateDailyMission();
    const w = portrait ? Math.min(320 * scale, this.scale.width - 24) : 500 * scale;
    const h = portrait ? 62 * scale : 58 * scale;
    const panel = drawComicPanel(this, x, y, w, h);
    panel.setDepth(1);

    const ratio = daily.target > 0 ? daily.progress / daily.target : 0;
    const barW = w - 48 * scale;
    const barY = y + (portrait ? 22 : 20) * scale;
    const barBg = this.add.rectangle(x, barY, barW, 10 * scale, 0xdddddd);
    const barFill = this.add.rectangle(x - barW / 2 + (barW * ratio) / 2, barY, barW * ratio, 10 * scale, daily.done ? COLORS.success : DETECTIVE_MARKER_GREEN);
    barFill.setOrigin(0.5, 0.5);
    barBg.setDepth(2);
    barFill.setDepth(2);

    const status = daily.done
      ? `✅ Tages-Mission geschafft! ${daily.rewardEmoji}`
      : `📋 ${daily.label} — ${daily.progress}/${daily.target}`;
    const statusText = this.add
      .text(x, y - (portrait ? 12 : 10) * scale, status, {
        fontFamily: 'Fredoka, Comic Sans MS, cursive',
        fontSize: `${portrait ? 14 : 16}px`,
        color: daily.done ? '#2d6a45' : '#1a1a2e',
        fontStyle: 'bold',
        align: 'center',
        wordWrap: { width: w - 24 },
      })
      .setOrigin(0.5)
      .setDepth(3);

    if (daily.done) {
      const sparkle = this.add.text(x + w / 2 - 22 * scale, y - h / 2 + 16 * scale, daily.rewardEmoji, {
        fontSize: `${22 * scale}px`,
      });
      sparkle.setDepth(4);
      this.tweens.add({
        targets: sparkle,
        scale: 1.25,
        angle: 12,
        duration: 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    void [statusText, barBg, barFill];
  }

  private drawRewardsBar(x: number, y: number, scale: number, portrait: boolean): void {
    const progress = loadDetectiveProgress();
    const totalStars = getTotalDetectiveStars();
    const panelW = portrait ? Math.min(320 * scale, this.scale.width - 24) : 520 * scale;
    const panel = drawComicPanel(this, x, y, panelW, portrait ? 64 * scale : 58 * scale);
    panel.setDepth(1);

    const starLabel = addComicText(this, x - panelW / 2 + 70 * scale, y - 4 * scale, `⭐ ${totalStars}`, 22 * scale);
    starLabel.setOrigin(0.5);
    if (totalStars > 0) {
      this.tweens.add({
        targets: starLabel,
        scale: 1.12,
        duration: 450,
        yoyo: true,
        repeat: 2,
        ease: 'Sine.easeInOut',
      });
    }

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
      const starGfx = drawStar(this, x - panelW / 2 + 28 * scale, y - 8 * scale, 16 * scale, true);
      this.tweens.add({
        targets: starGfx,
        angle: 20,
        duration: 600,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
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
      const filled = i < stars;
      const starGfx = drawStar(this, x + width / 2 - 64 * scale + i * 26 * scale, starRowY, 13 * scale, filled);
      if (filled) {
        this.tweens.add({
          targets: starGfx,
          scale: 1.2,
          duration: 320 + i * 80,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
      }
    }
    if (stars > 0) {
      this.add
        .text(x + width / 2 - 64 * scale + 80 * scale, starRowY, `${stars}/3`, {
          fontFamily: 'Fredoka, Comic Sans MS, cursive',
          fontSize: `${12 * scale}px`,
          color: '#3d7a54',
          fontStyle: 'bold',
        })
        .setOrigin(0, 0.5);
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