import Phaser from 'phaser';
import { COLORS } from '../game/constants';
import { addComicText, createComicButton, floatFeedback } from '../game/graphics';
import { reactCompanionCheer, reactCompanionOops, spawnSamuelCompanion } from '../game/characterCompanion';
import { feedbackSounds } from '../game/feedbackAudio';
import { drawComingSoonParkBackdrop } from '../game/sceneBackgrounds';
import { drawSoccerBall, drawSparkleSoccerBall } from '../game/objectGraphics';
import { attachTitleMark } from '../game/comicIcons';
import { bindSceneMusic } from '../game/sceneMusic';
import { playConfettiBurst } from '../game/celebrationConfetti';
import { readSceneEnterStyle, runSceneEnter, transitionToHub } from '../game/sceneTransition';
import { getGameCenter } from './BootScene';
import { getDetectiveLayoutMode } from '../game/detectiveLayout';
import { recordBallGameWin, recordBallSuperRound } from '../game/appTreasury';
import { hideSpeech, showSpeechIf } from '../ui/speech';

const MAIN_GOAL = 10;
const BONUS_GOAL = 5;
const ROUND_SECONDS = 60;
const SPARKLE_CHANCE = 0.22;

interface FallingBall {
  container: Phaser.GameObjects.Container;
  speed: number;
  sparkle: boolean;
}

export class BallGameScene extends Phaser.Scene {
  private balls: FallingBall[] = [];
  private points = 0;
  private bonusPoints = 0;
  private superActive = false;
  private superAnnounced = false;
  private streak = 0;
  private timeLeft = ROUND_SECONDS;
  private playing = false;
  private finished = false;
  private layoutScale = 1;
  private groundY = 0;
  private spawnTimer?: Phaser.Time.TimerEvent;
  private clockTimer?: Phaser.Time.TimerEvent;
  private counterText?: Phaser.GameObjects.Text;
  private timerText?: Phaser.GameObjects.Text;
  private streakText?: Phaser.GameObjects.Text;
  private samuelCompanion?: Phaser.GameObjects.Container;
  private playBounds = { left: 0, right: 0 };

  constructor() {
    super({ key: 'BallGameScene' });
  }

  create(): void {
    this.balls = [];
    this.points = 0;
    this.bonusPoints = 0;
    this.superActive = false;
    this.superAnnounced = false;
    this.streak = 0;
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

    const ballTitle = addComicText(this, x, y - (layout.portrait ? 248 : 228) * this.layoutScale, 'Ballspiel', 32 * this.layoutScale);
    attachTitleMark(this, ballTitle, '⚽');
    addComicText(
      this,
      x,
      y - (layout.portrait ? 186 : 172) * this.layoutScale,
      '10 Punkte = Super-Runde! Glitzer-Bälle zählen doppelt.',
      16 * this.layoutScale,
    );

    this.counterText = addComicText(
      this,
      x,
      y - (layout.portrait ? 150 : 136) * this.layoutScale,
      `Punkte: 0 / ${MAIN_GOAL}`,
      22 * this.layoutScale,
    );
    this.timerText = addComicText(
      this,
      x,
      y - (layout.portrait ? 120 : 104) * this.layoutScale,
      `Zeit: ${ROUND_SECONDS}`,
      20 * this.layoutScale,
    );
    this.streakText = addComicText(
      this,
      x,
      y - (layout.portrait ? 116 : 98) * this.layoutScale,
      '',
      18 * this.layoutScale,
    );
    this.streakText.setAlpha(0);

    const basket = this.add.graphics().setDepth(1);
    const basketLeft = this.playBounds.left;
    const basketW = this.playBounds.right - this.playBounds.left;
    const basketTop = this.groundY - 18 * this.layoutScale;
    const basketH = 34 * this.layoutScale;
    basket.fillStyle(0xc68642, 1);
    basket.lineStyle(4 * this.layoutScale, COLORS.outline);
    basket.fillRoundedRect(basketLeft, basketTop, basketW, basketH, 12);
    basket.strokeRoundedRect(basketLeft, basketTop, basketW, basketH, 12);
    basket.lineStyle(2 * this.layoutScale, 0x8b5a2b, 0.55);
    for (let i = 1; i < 7; i++) {
      const lx = basketLeft + (basketW * i) / 7;
      basket.lineBetween(lx, basketTop + 4, lx, basketTop + basketH - 4);
    }
    basket.fillStyle(0xe0a85c, 1);
    basket.fillRoundedRect(basketLeft + 8, basketTop + 4, basketW - 16, 10 * this.layoutScale, 5);

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

  private elapsedSeconds(): number {
    return ROUND_SECONDS - this.timeLeft;
  }

  private spawnDelayMs(): number {
    return Math.max(520, 920 - this.elapsedSeconds() * 7);
  }

  private ballSpeed(): number {
    const ramp = this.elapsedSeconds() * 2.2 + this.points * 0.35;
    return Phaser.Math.Between(110 + Math.floor(ramp), 155 + Math.floor(ramp * 1.2)) * this.layoutScale;
  }

  private refreshCounter(): void {
    if (this.superActive) {
      this.counterText?.setText(`Super-Runde! Bonus: ${this.bonusPoints} / ${BONUS_GOAL}`);
    } else {
      this.counterText?.setText(`Punkte: ${this.points} / ${MAIN_GOAL}`);
    }
  }

  private rescheduleSpawn(): void {
    if (!this.playing || this.finished) return;
    this.spawnTimer?.remove(false);
    this.spawnTimer = this.time.addEvent({
      delay: this.spawnDelayMs(),
      loop: true,
      callback: () => this.spawnBall(),
    });
  }

  private async begin(): Promise<void> {
    if (!(await showSpeechIf(this, 'Tippe die Bälle, bevor sie unten sind — jeder Versuch zählt!'))) return;
    this.playing = true;
    this.spawnTimer = this.time.addEvent({
      delay: this.spawnDelayMs(),
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
    if (this.timeLeft > 0 && this.timeLeft % 12 === 0) {
      this.rescheduleSpawn();
    }
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
    const sparkle = Math.random() < SPARKLE_CHANCE;

    const container = this.add.container(px, startY);
    container.setDepth(4);
    const visual = sparkle ? drawSparkleSoccerBall(this, radius) : drawSoccerBall(this, radius);
    container.add(visual);
    const hit = this.add.circle(0, 0, radius * 1.1, 0xffffff, 0.001);
    hit.setInteractive({ useHandCursor: true });
    container.setSize(radius * 2.2, radius * 2.2);

    const entry: FallingBall = {
      container,
      speed: this.ballSpeed(),
      sparkle,
    };
    this.balls.push(entry);

    hit.on('pointerdown', () => this.catchBall(entry));

    if (sparkle) {
      this.tweens.add({
        targets: container,
        scale: { from: 1, to: 1.08 },
        duration: 350,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    } else {
      this.tweens.add({
        targets: container,
        angle: Phaser.Math.Between(-6, 6),
        duration: 400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  private async maybeStartSuperRound(): Promise<void> {
    if (this.superAnnounced || this.points < MAIN_GOAL) return;
    this.superAnnounced = true;
    this.superActive = true;
    this.bonusPoints = 0;
    this.refreshCounter();
    const { x, y } = getGameCenter(this);
    feedbackSounds.crowdCheer();
    playConfettiBurst(this, x, y - 60 * this.layoutScale, this.layoutScale, { count: 14, emojis: ['⚽', '✨', '🎉'] });
    reactCompanionCheer(this, this.samuelCompanion);
    await showSpeechIf(this, 'Super-Runde! Fang noch 5 Bonus-Bälle für einen Extra-Sticker!');
    this.rescheduleSpawn();
  }

  private catchBall(entry: FallingBall): void {
    if (this.finished || !this.playing) return;
    this.balls = this.balls.filter((b) => b !== entry);
    const value = entry.sparkle ? 2 : 1;
    if (entry.sparkle) feedbackSounds.colorPop();
    else feedbackSounds.catch();

    reactCompanionCheer(this, this.samuelCompanion);
    this.streak += 1;
    this.showStreakFeedback(entry.container.x, entry.container.y, entry.sparkle);

    if (this.superActive) {
      this.bonusPoints += value;
      if (this.bonusPoints >= BONUS_GOAL && this.bonusPoints - value < BONUS_GOAL) {
        recordBallSuperRound();
        feedbackSounds.crowdCheer();
        floatFeedback(
          this,
          entry.container.x,
          entry.container.y - 40 * this.layoutScale,
          'Bonus-Sticker!',
          '#ffd93d',
          22 * this.layoutScale,
        );
      }
    } else {
      this.points += value;
      void this.maybeStartSuperRound();
    }
    this.refreshCounter();

    this.tweens.add({
      targets: entry.container,
      scale: 0.2,
      alpha: 0,
      y: entry.container.y - 30 * this.layoutScale,
      duration: 200,
      onComplete: () => entry.container.destroy(),
    });

    const label = entry.sparkle ? 'Doppelt!' : this.streak >= 5 ? 'Mega!' : 'Super!';
    floatFeedback(this, entry.container.x, entry.container.y - 24 * this.layoutScale, label, '#6bcb77', 20 * this.layoutScale);
  }

  private showStreakFeedback(x: number, y: number, sparkle: boolean): void {
    if (this.streak === 3 || this.streak === 5 || (this.streak > 5 && this.streak % 3 === 0)) {
      feedbackSounds.crowdCheer();
      const msg = this.streak >= 5 ? `${this.streak} in Folge! 🔥` : `${this.streak}er-Serie!`;
      floatFeedback(this, x, y - 56 * this.layoutScale, msg, sparkle ? '#ffd93d' : '#5b6ee1', 24 * this.layoutScale);
      this.streakText?.setText(msg);
      this.streakText?.setAlpha(1);
      this.tweens.add({
        targets: this.streakText,
        alpha: 0,
        duration: 1200,
        delay: 400,
      });
      if (this.samuelCompanion) {
        this.tweens.add({
          targets: this.samuelCompanion,
          scaleX: this.samuelCompanion.scaleX * 1.12,
          scaleY: this.samuelCompanion.scaleY * 1.12,
          duration: 160,
          yoyo: true,
          ease: 'Back.easeOut',
        });
      }
      const { x: cx, y: cy } = getGameCenter(this);
      playConfettiBurst(this, cx, cy - 80 * this.layoutScale, this.layoutScale * 0.85, {
        count: this.streak >= 5 ? 12 : 8,
        emojis: ['⭐', '⚽'],
      });
    }
  }

  private onMiss(entry: FallingBall): void {
    this.balls = this.balls.filter((b) => b !== entry);
    entry.container.destroy();
    this.streak = 0;
    this.streakText?.setAlpha(0);
    reactCompanionOops(this, this.samuelCompanion);
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
    const gotBonus = this.bonusPoints >= BONUS_GOAL;
    feedbackSounds.success();
    if (gotBonus) feedbackSounds.crowdCheer();
    reactCompanionCheer(this, this.samuelCompanion);
    playConfettiBurst(this, x, y - 40 * this.layoutScale, this.layoutScale, { count: 18, emojis: ['⚽', '⭐', '🎉', '✨'] });

    let praise: string;
    if (this.superActive && gotBonus) {
      praise = `Fantastisch! Super-Runde mit ${this.bonusPoints} Bonus-Punkten — du bist ein Ball-Star!`;
    } else if (this.superActive) {
      praise = `Super-Runde geschafft! ${this.bonusPoints} Bonus-Punkte — toll mitgemacht!`;
    } else if (this.points >= MAIN_GOAL) {
      praise = `Wow, ${this.points} Punkte! Du bist ein Ball-Star!`;
    } else {
      praise = `Toll! ${this.points} Punkte gefangen — du hast super mitgespielt!`;
    }

    const stickers: string[] = [];
    if (firstWin) stickers.push('Neuer Ball-Sticker in der Schatzkiste!');
    if (gotBonus) stickers.push('Bonus-Sticker freigeschaltet!');
    const stickerLine = stickers.length ? ` ${stickers.join(' ')}` : '';

    if (!(await showSpeechIf(this, praise + stickerLine))) return;

    createComicButton(this, x - 110 * this.layoutScale, y + 120 * this.layoutScale, 'Nochmal', () => {
      this.scene.restart();
    }, 0x6bcb77, 150).setDepth(20);

    createComicButton(this, x + 120 * this.layoutScale, y + 120 * this.layoutScale, 'Spielplatz', () => {
      transitionToHub(this);
    }, 0x5b6ee1, 160).setDepth(20);
  }
}