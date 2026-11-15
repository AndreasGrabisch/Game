import Phaser from 'phaser';
import { COLORS } from '../../game/constants';
import { addComicText, createComicButton, drawBike, drawStar, floatFeedback } from '../../game/graphics';
import { feedbackSounds } from '../../game/feedbackAudio';
import { starsForMistakes } from '../../game/scoring';
import { getGameCenter } from '../BootScene';
import { completeMission, unlockPart } from '../../game/Progress';
import { MISSIONS } from '../../data/missions';
import { playConfettiBurst } from '../../game/celebrationConfetti';
import { readSceneEnterStyle, runSceneEnter, transitionToScene } from '../../game/sceneTransition';
import { drawMissionYardBackdrop } from '../../game/sceneBackgrounds';
import { hideSpeech, showSpeechIf } from '../../ui/speech';
import { getDetectiveLayoutMode } from '../../game/detectiveLayout';

const GOAL = 3;
const DECOYS = ['🧦', '🍌', '🦆', '🧁'];

export class Mission04Bell extends Phaser.Scene {
  private missionData = MISSIONS['mission-04-bell'];
  private hits = 0;
  private mistakes = 0;
  private activeBell?: Phaser.GameObjects.Container;
  private counterText?: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'Mission04Bell' });
  }

  create(): void {
    this.hits = 0;
    this.mistakes = 0;
    this.activeBell = undefined;

    runSceneEnter(this, readSceneEnterStyle(this));
    this.drawBackground();
    const { x, y, scale } = getGameCenter(this);
    const layout = getDetectiveLayoutMode(this);
    const s = scale * (layout.portrait ? 0.92 : 1);

    addComicText(this, x, y - (layout.portrait ? 220 : 236) * s, '🔔 Klingel-Tanz', 28 * s);
    this.counterText = addComicText(this, x, y - (layout.portrait ? 186 : 200) * s, `Klingeln: 0 / ${GOAL}`, 22 * s);

    drawBike(this, x, y + (layout.portrait ? 48 : 32) * s, 1.2 * s, {
      showFrame: true,
      showWheels: true,
      showPedals: true,
      showHandlebar: true,
      showBell: true,
    });

    createComicButton(
      this,
      x + (layout.portrait ? 140 : 340) * s,
      y - (layout.portrait ? 220 : 236) * s,
      '←',
      () => {
        hideSpeech();
        transitionToScene(this, 'WorkshopScene', undefined, { label: 'Werkstatt' });
      },
      0x5b6ee1,
      layout.portrait ? 72 : 100,
    ).setDepth(15);

    this.input.once('pointerdown', () => {
      void feedbackSounds.unlock();
    });

    void this.runIntro(s, x, y);
  }

  private async runIntro(s: number, x: number, y: number): Promise<void> {
    if (!(await showSpeechIf(this, this.missionData.intro))) return;
    if (!(await showSpeechIf(this, this.missionData.learn1))) return;
    this.spawnBellRound(x, y, s);
  }

  private spawnBellRound(cx: number, cy: number, scale: number): void {
    this.activeBell?.destroy();
    const layout = getDetectiveLayoutMode(this);
    const slots = layout.portrait
      ? [
          { x: cx - 90 * scale, y: cy - 40 * scale },
          { x: cx + 90 * scale, y: cy - 20 * scale },
          { x: cx, y: cy - 80 * scale },
        ]
      : [
          { x: cx - 160 * scale, y: cy - 30 * scale },
          { x: cx, y: cy - 70 * scale },
          { x: cx + 160 * scale, y: cy - 30 * scale },
        ];

    const bellSlot = Phaser.Utils.Array.GetRandom(slots);
    const bell = this.makeBellButton(bellSlot.x, bellSlot.y, scale, true);
    this.activeBell = bell;

    for (const slot of slots) {
      if (slot === bellSlot) continue;
      this.makeBellButton(slot.x, slot.y, scale, false);
    }

    this.tweens.add({
      targets: bell,
      scale: 1.08,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private makeBellButton(px: number, py: number, scale: number, isBell: boolean): Phaser.GameObjects.Container {
    const root = this.add.container(px, py);
    const radius = 54 * scale;
    const color = isBell ? COLORS.star : COLORS.panel;
    const bg = this.add.circle(0, 0, radius, color, isBell ? 1 : 0.95);
    bg.setStrokeStyle(4, isBell ? COLORS.bikeFrame : COLORS.outline);
    const label = this.add.text(0, 0, isBell ? '🔔' : Phaser.Utils.Array.GetRandom(DECOYS), {
      fontSize: `${isBell ? 42 : 36}px`,
    }).setOrigin(0.5);
    root.add([bg, label]);

    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerdown', () => {
      if (isBell) this.onBellHit(scale);
      else this.onDecoy(scale, px, py);
    });
    return root;
  }

  private onDecoy(scale: number, px: number, py: number): void {
    this.mistakes += 1;
    feedbackSounds.miss();
    floatFeedback(this, px, py - 40 * scale, 'Nur 🔔', '#ff6b6b', 18 * scale);
    if (this.mistakes === 2) {
      void showSpeechIf(this, this.missionData.hint);
    }
  }

  private onBellHit(scale: number): void {
    feedbackSounds.colorPop();
    this.hits += 1;
    this.counterText?.setText(`Klingeln: ${this.hits} / ${GOAL}`);
    this.activeBell?.destroy();
    this.activeBell = undefined;

    if (this.hits >= GOAL) {
      void this.onComplete(scale);
      return;
    }

    const { x, y } = getGameCenter(this);
    this.time.delayedCall(400, () => this.spawnBellRound(x, y, scale));
  }

  private async onComplete(scale: number): Promise<void> {
    const { x, y } = getGameCenter(this);
    const stars = starsForMistakes(this.mistakes);
    unlockPart('bell');
    completeMission('mission-04-bell', stars);

    for (let i = 0; i < stars; i++) {
      const star = drawStar(this, x - 40 * scale + i * 40 * scale, y - 140 * scale, 18 * scale);
      star.setScale(0);
      this.tweens.add({
        targets: star,
        scale: 1,
        duration: 300,
        delay: i * 180,
        ease: 'Back.easeOut',
      });
    }

    feedbackSounds.workshopCheer();
    if (!(await showSpeechIf(this, this.missionData.success))) return;

    playConfettiBurst(this, x, y - 80 * scale, scale, { count: 12 });
    createComicButton(this, x, y + 200 * scale, 'Zur Werkstatt!', () => transitionToScene(this, 'WorkshopScene', undefined, { label: 'Werkstatt' }));
  }

  private drawBackground(): void {
    drawMissionYardBackdrop(this);
  }
}