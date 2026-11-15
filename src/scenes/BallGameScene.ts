import Phaser from 'phaser';
import { COLORS } from '../game/constants';
import { addComicText, createComicButton, floatFeedback } from '../game/graphics';
import { reactCompanionCheer, spawnSamuelCompanion } from '../game/characterCompanion';
import { feedbackSounds } from '../game/feedbackAudio';
import { drawComingSoonParkBackdrop } from '../game/sceneBackgrounds';
import { drawSoccerBall } from '../game/objectGraphics';
import { bindSceneMusic } from '../game/sceneMusic';
import { playConfettiBurst } from '../game/celebrationConfetti';
import { readSceneEnterStyle, runSceneEnter, transitionToHub } from '../game/sceneTransition';
import { getGameCenter } from './BootScene';
import { getDetectiveLayoutMode } from '../game/detectiveLayout';
import { recordBallGameWin } from '../game/appTreasury';
import { hideSpeech, showSpeechIf } from '../ui/speech';

const GOAL_CATCHES = 10;
const ROUND_SECONDS = 60;

interface FallingBall {
  container: Phaser.GameObjects.Container;
  speed: number;
}

export class BallGameScene extends Phaser.Scene {
  private balls: FallingBall[] = [];
  private caught = 0;
  private timeLeft = ROUND_SECONDS;
  private playing = false;
  private finished = false;
  private layoutScale = 1;
  private groundY = 0;
  private spawnTimer?: Phaser.Time.TimerEvent;
  private clockTimer?: Phaser.Time.TimerEvent;
  private counterText?: Phaser.GameObjects.Text;
  private timerText?: Phaser.GameObjects.Text;
  private samuelCompanion?: Phaser.GameObjects.Container;
  private playBounds = { left: 0, right: 0 };

  constructor() {
    super({ key: 'BallGameScene' });
  }

  create(): void {
    this.balls = [];
    this.caught = 0;
    this.timeLeft = ROUND_SECONDS;
    this.playing = false;
    this.finished = false;

    runSceneEnter(this, readSceneEnterStyle(this));
    bindSceneMusic(this, 'home');
    drawComingSoonParkBackdrop(this);

    const { x, y, scale } = getGameCenter(this);
    const layout = getDetectiveLayoutMode(this);
    this.layoutScale = scale * (layout.portrait ? 0.88 : 1);
    this.groundY = y + (layout.portrait ? 200 : 180) * this.layoutScale;
    this.playBounds = {
      left: x - (layout.portrait ? 150 : 220) * this.layoutScale,
      right: x + (layout.portrait ? 150 : 220) * this.layoutScale,
    };

    addComicText(this, x, y - (layout.portrait ? 248 : 228) * this.layoutScale, 'Ballspiel', 32 * this.layoutScale);
    addComicText(
      this,
      x,
      y - (layout.portrait ? 212 : 192) * this.layoutScale,
      'Tippe die Bälle — fang 10 oder spiel 60 Sekunden!',
      17 * this.layoutScale,
    );

    this.counterText = addComicText(
      this,
      x,
      y - (layout.portrait ? 176 : 158) * this.layoutScale,
      `Gefangen: 0 / ${GOAL_CATCHES}`,
      22 * this.layoutScale,
    );
    this.timerText = addComicText(
      this,
      x,
      y - (layout.portrait ? 146 : 128) * this.layoutScale,
      `Zeit: ${ROUND_SECONDS}`,
      20 * this.layoutScale,
    );

    const basket = this.add.graphics();
    basket.fillStyle(COLORS.success, 0.25);
    basket.lineStyle(4 * this.layoutScale, COLORS.outline);
    basket.fillRoundedRect(
      this.playBounds.left,
      this.groundY - 16 * this.layoutScale,
      this.playBounds.right - this.playBounds.left,
      28 * this.layoutScale,
      10,
    );
    basket.strokeRoundedRect(
      this.playBounds.left,
      this.groundY - 16 * this.layoutScale,
      this.playBounds.right - this.playBounds.left,
      28 * this.layoutScale,
      10,
    );
    basket.setDepth(1);

    this.samuelCompanion = spawnSamuelCompanion(
      this,
      this.playBounds.left - 52 * this.layoutScale,
      this.groundY - 40 * this.layoutScale,
      0.75 * this.layoutScale,
      5,
    );

    createComicButton(
      this,
      x + (layout.portrait ? 130 : 300) * this.layoutScale,
      y - (layout.portrait ? 248 : 228) * this.layoutScale,
      '←',
      () => {
        hideSpeech();
        transitionToHub(this);
      },
      0x5b6ee1,
      layout.portrait ? 72 : 100,
    ).setDepth(12);

    this.input.once('pointerdown', () => void feedbackSounds.unlock());
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.stopLoops();
      hideSpeech();
    });

    void this.begin();
  }

  update(_time: number, delta: number): void {
    if (!this.playing || this.finished) return;
    const dt = Math.min(delta / 1000, 0.05);
    for (const entry of [...this.balls]) {
      entry.container.y += entry.speed * dt;
      if (entry.container.y > this.groundY + 20 * this.layoutScale) {
        this.onMiss(entry);
      }
    }
  }

  private async begin(): Promise<void> {
  if (!(await showSpeechIf(this, 'Tippe die Bälle, bevor sie unten sind!'))) return;
    this.playing = true;
    this.spawnTimer = this.time.addEvent({
      delay: 900,
      loop: true,
      callback: () => this.spawnBall(),
    });
    this.spawnBall();
    this.clockTimer = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => this.tickSecond(),
    });
  }

  private tickSecond(): void {
    if (this.finished || !this.playing) return;
    this.timeLeft -= 1;
    this.timerText?.setText(`Zeit: ${Math.max(0, this.timeLeft)}`);
    if (this.timeLeft <= 0) {
      void this.finishRound();
    }
  }

  private spawnBall(): void {
    if (this.finished || !this.playing) return;
    const radius = (42 + Math.random() * 14) * this.layoutScale;
    const px = Phaser.Math.Between(
      Math.floor(this.playBounds.left + radius),
      Math.floor(this.playBounds.right - radius),
    );
    const startY = getGameCenter(this).y - 120 * this.layoutScale;

    const container = this.add.container(px, startY);
    container.setDepth(4);
    const visual = drawSoccerBall(this, radius);
    container.add(visual);
    const hit = this.add.circle(0, 0, radius * 1.1, 0xffffff, 0.001);
    hit.setInteractive({ useHandCursor: true });
    container.setSize(radius * 2.2, radius * 2.2);

    const entry: FallingBall = {
      container,
      speed: Phaser.Math.Between(110, 155) * this.layoutScale,
    };
    this.balls.push(entry);

    hit.on('pointerdown', () => this.catchBall(entry));

    this.tweens.add({
      targets: container,
      angle: Phaser.Math.Between(-6, 6),
      duration: 400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private catchBall(entry: FallingBall): void {
    if (this.finished || !this.playing) return;
    this.balls = this.balls.filter((b) => b !== entry);
    feedbackSounds.catch();
    reactCompanionCheer(this, this.samuelCompanion);
    this.caught += 1;
    this.counterText?.setText(`Gefangen: ${this.caught} / ${GOAL_CATCHES}`);

    this.tweens.add({
      targets: entry.container,
      scale: 0.2,
      alpha: 0,
      y: entry.container.y - 30 * this.layoutScale,
      duration: 200,
      onComplete: () => entry.container.destroy(),
    });

    floatFeedback(this, entry.container.x, entry.container.y - 24 * this.layoutScale, 'Super!', '#6bcb77', 20 * this.layoutScale);

    if (this.caught >= GOAL_CATCHES) {
      void this.finishRound();
    }
  }

  private onMiss(entry: FallingBall): void {
    this.balls = this.balls.filter((b) => b !== entry);
    entry.container.destroy();
    floatFeedback(
      this,
      entry.container.x,
      this.groundY - 40 * this.layoutScale,
      'Fast!',
      '#5b6ee1',
      16 * this.layoutScale,
    );
  }

  private stopLoops(): void {
    this.playing = false;
    this.spawnTimer?.remove(false);
    this.clockTimer?.remove(false);
    for (const b of this.balls) b.container.destroy();
    this.balls = [];
  }

  private async finishRound(): Promise<void> {
    if (this.finished) return;
    this.finished = true;
    this.stopLoops();

    const { x, y } = getGameCenter(this);
    const { firstWin } = recordBallGameWin();
    feedbackSounds.success();
    reactCompanionCheer(this, this.samuelCompanion);
    playConfettiBurst(this, x, y - 40 * this.layoutScale, this.layoutScale, { count: 16, emojis: ['⚽', '⭐', '🎉'] });

    const praise =
      this.caught >= GOAL_CATCHES
        ? `Wow, ${this.caught} Bälle! Du bist ein Ball-Star!`
        : `Toll! ${this.caught} Bälle gefangen — du hast mitgemacht!`;
    const stickerLine = firstWin ? ' Neuer Sticker in der Schatzkiste!' : '';

    if (!(await showSpeechIf(this, praise + stickerLine))) return;

    createComicButton(this, x - 110 * this.layoutScale, y + 120 * this.layoutScale, 'Nochmal', () => {
      this.scene.restart();
    }, 0x6bcb77, 150).setDepth(20);

    createComicButton(this, x + 120 * this.layoutScale, y + 120 * this.layoutScale, 'Spielplatz', () => {
      transitionToHub(this);
    }, 0x5b6ee1, 160).setDepth(20);
  }
}