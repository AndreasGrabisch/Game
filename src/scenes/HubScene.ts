import Phaser from 'phaser';
import { COLORS } from '../game/constants';
import { drawSamuel, addComicText, createComicButton } from '../game/graphics';
import { getGameCenter } from './BootScene';
import { APP_HOME_MODES, type AppHomeMode } from '../data/appModes';
import { getAppRewardSummary, getAppTotalStars } from '../game/appProgress';
import { runHubMilestoneCelebrations } from '../game/hubMilestoneCelebration';
import { drawHomeTitleBadge, drawModeIcon, drawPlaygroundSky } from '../game/appHomeGraphics';
import { drawHubProgressBoard } from '../game/hubProgressDisplay';
import { getHubWorldTier } from '../game/hubWorldProgress';
import { drawLockIcon } from '../game/sceneBackgrounds';
import { getDetectiveLayoutMode } from '../game/detectiveLayout';
import { getMuteButtonLabel, toggleGameAudio } from '../game/audioUi';
import { feedbackSounds } from '../game/feedbackAudio';
import { bindSceneMusic } from '../game/sceneMusic';
import { readSceneEnterStyle, runSceneEnter, transitionToScene } from '../game/sceneTransition';
import { playConfettiBurst } from '../game/celebrationConfetti';
import { hideSpeech, showSpeechIf } from '../ui/speech';

export class HubScene extends Phaser.Scene {
  constructor() {
    super({ key: 'HubScene' });
  }

  create(): void {
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => hideSpeech());
    runSceneEnter(this, readSceneEnterStyle(this), 320);
    bindSceneMusic(this, 'home');

    drawPlaygroundSky(this, getHubWorldTier());
    const { x, y, scale } = getGameCenter(this);
    const layout = getDetectiveLayoutMode(this);
    const s = scale * (layout.portrait ? 0.82 : 1);

    drawHomeTitleBadge(this, x, y - (layout.portrait ? 252 : 228) * s, s);
    addComicText(this, x, y - (layout.portrait ? 252 : 228) * s, 'Samuels Spielewelt', 36 * s);
    addComicText(this, x, y - (layout.portrait ? 216 : 194) * s, 'Wähle dein Abenteuer!', 18 * s);

    const summary = getAppRewardSummary();
    drawHubProgressBoard(this, x, y - (layout.portrait ? 188 : 162) * s, s, layout.portrait, summary);

    createComicButton(
      this,
      x + (layout.portrait ? 0 : 280) * s,
      y - (layout.portrait ? 248 : 228) * s,
      '🏆 Schatz',
      () => transitionToScene(this, 'TreasureChestScene'),
      COLORS.star,
      layout.portrait ? 130 : 150,
    ).setDepth(5);

    const samuel = drawSamuel(this, x - (layout.portrait ? 150 : 320) * s, y + (layout.portrait ? 200 : 120) * s, 0.9 * s);
    samuel.setDepth(2);
    this.tweens.add({
      targets: samuel,
      y: samuel.y - 6 * s,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    const modes = APP_HOME_MODES;
    if (layout.portrait) {
      const cardW = Math.min(168 * s, (this.scale.width - 36) / 2);
      const cardH = 140 * s;
      const gapX = 12 * s;
      const gapY = 14 * s;
      const gridW = cardW * 2 + gapX;
      const startX = x - gridW / 2 + cardW / 2;
      const startY = y - 48 * s;
      modes.forEach((mode, index) => {
        const col = index % 2;
        const row = Math.floor(index / 2);
        this.createModeCard(startX + col * (cardW + gapX), startY + row * (cardH + gapY), cardW, cardH, s, mode, layout.portrait);
      });
    } else {
      const cardW = Math.min(200 * s, (860 * s - (modes.length - 1) * 16 * s) / modes.length);
      const cardH = 230 * s;
      const gap = 16 * s;
      const totalW = modes.length * cardW + (modes.length - 1) * gap;
      const startX = x - totalW / 2 + cardW / 2;
      modes.forEach((mode, index) => {
        this.createModeCard(startX + index * (cardW + gap), y + 18 * s, cardW, cardH, s, mode, layout.portrait);
      });
    }

    const btnY = y + (layout.portrait ? 248 : 228) * s;
    const muteBtn = createComicButton(this, x - 155 * s, btnY, getMuteButtonLabel(), () => {
      toggleGameAudio();
      const label = muteBtn.list[1] as Phaser.GameObjects.Text;
      label.setText(getMuteButtonLabel());
    }, 0x6bcb77, 100);
    void muteBtn;
    createComicButton(this, x - 35 * s, btnY, '🔊 Vorlesen', () => void this.readHomeAloud(), 0xff6b35, 110);
    createComicButton(this, x + 110 * s, btnY, 'Neu starten', () => {
      transitionToScene(this, 'MenuScene');
    }, 0x888899, 120);

    this.input.once('pointerdown', () => {
      void feedbackSounds.unlock();
      feedbackSounds.hubWelcome();
    });

    this.time.delayedCall(500, () => {
      if (this.scene.isActive()) {
        void showSpeechIf(this, 'Hallo! Tippe 🏆 Schatz für Sticker aus allen Spielen!');
      }
    });

    this.time.delayedCall(900, () => {
      if (this.scene.isActive()) {
        void runHubMilestoneCelebrations(this, x, y, s).then((celebrated) => {
          if (celebrated > 0) playConfettiBurst(this, x, y - 40 * s, s, { count: 12 });
        });
      }
    });
  }

  private async readHomeAloud(): Promise<void> {
    const total = getAppTotalStars();
    const lines = [
      'Willkommen in Samuels Spielewelt!',
      `Du hast ${total} Sterne gesammelt.`,
      ...APP_HOME_MODES.map((m) => {
        if (!m.isUnlocked()) return `${m.title} ist noch gesperrt. ${m.lockHint}`;
        return m.title;
      }),
    ];
    await showSpeechIf(this, lines.join(' '));
  }

  private createModeCard(
    x: number,
    y: number,
    width: number,
    height: number,
    scale: number,
    mode: AppHomeMode,
    portrait: boolean,
  ): void {
    const unlocked = mode.isUnlocked();
    const container = this.add.container(x, y);
    const bg = this.add.rectangle(0, 0, width, height, COLORS.panel);
    bg.setStrokeStyle(4, unlocked ? mode.accentColor : COLORS.outline);
    bg.setAlpha(unlocked ? 1 : 0.82);

    const header = this.add.rectangle(0, -height / 2 + 24 * scale, width - 8 * scale, 46 * scale, mode.accentColor, unlocked ? 1 : 0.45);
    header.setStrokeStyle(2, COLORS.outline);

    const icon = drawModeIcon(this, mode.icon, 0.55 * scale);
    icon.setPosition(0, -height / 2 + 26 * scale);
    container.add([bg, header, icon]);

    const title = this.add
      .text(0, -height / 2 + 62 * scale, mode.title, {
        fontFamily: 'Fredoka, Comic Sans MS, cursive',
        fontSize: `${16 * scale}px`,
        color: '#1a1a2e',
        fontStyle: 'bold',
        align: 'center',
        wordWrap: { width: width - 20 * scale },
      })
      .setOrigin(0.5, 0);

    const tag = this.add
      .text(0, height / 2 - 78 * scale, unlocked ? mode.shortKidLine : mode.lockHint, {
        fontFamily: 'Fredoka, Comic Sans MS, cursive',
        fontSize: `${13 * scale}px`,
        color: unlocked ? '#444466' : '#886666',
        align: 'center',
        wordWrap: { width: width - 24 * scale },
      })
      .setOrigin(0.5, 0);

    container.add([title, tag]);

    if (!unlocked) {
      const lock = drawLockIcon(this, 0, -8 * scale, scale);
      lock.setAlpha(0.92);
      container.add(lock);
    }

    const openMode = () => {
      if (!unlocked) {
        void showSpeechIf(this, mode.lockHint);
        return;
      }
      transitionToScene(this, mode.sceneKey);
    };

    const btnW = Math.min(portrait ? 130 : 120, width - 16);
    const btnY = height / 2 - 36 * scale;
    const btn = createComicButton(
      this,
      x,
      y + btnY,
      unlocked ? 'Los!' : 'Sperre',
      openMode,
      unlocked ? mode.accentColor : 0xaaaaaa,
      btnW,
    );

    if (unlocked) {
      const hit = this.add.rectangle(x, y, width, height, 0xffffff, 0.001);
      hit.setDepth(2);
      hit.setInteractive({ useHandCursor: true });
      hit.on('pointerdown', openMode);
    }

    container.setDepth(3);
    btn.setDepth(4);

    this.tweens.add({
      targets: container,
      y: y - 3 * scale,
      duration: 1300 + (mode.id === 'detective' ? 0 : 120),
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }
}