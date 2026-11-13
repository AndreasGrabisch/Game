import Phaser from 'phaser';
import { COLORS } from '../../game/constants';
import { addComicText, createComicButton, drawStar, floatFeedback } from '../../game/graphics';
import { feedbackSounds } from '../../game/feedbackAudio';
import { starsForMistakes } from '../../game/scoring';
import { getGameCenter } from '../BootScene';
import { completeMission, unlockPart } from '../../game/Progress';
import { MISSIONS } from '../../data/missions';
import { hideSpeech, showSpeechIf } from '../../ui/speech';

type Lane = -1 | 0 | 1;

interface Faller {
  lane: Lane;
  star: Phaser.GameObjects.Star;
  tween: Phaser.Tweens.Tween;
  settled: boolean;
}

const GOAL = 5;

export class Mission03Handlebar extends Phaser.Scene {
  private missionData = MISSIONS['mission-03-handlebar'];
  private lane: Lane = 0;
  private lastStarLane: Lane = 0;
  private catches = 0;
  private misses = 0;
  private playing = false;
  private finished = false;
  private learn2Shown = false;
  private hintShown = false;
  private speechBusy = false;
  private speechQueue: string[] = [];
  private fallers: Faller[] = [];
  private spawnTimer?: Phaser.Time.TimerEvent;
  private laneCenters: number[] = [];
  private laneRects: Phaser.GameObjects.Rectangle[] = [];
  private bike!: Phaser.GameObjects.Container;
  private frontWheel!: Phaser.GameObjects.Container;
  private controls!: Phaser.GameObjects.Container;
  private catchY = 0;
  private layoutScale = 1;
  private instructionText?: Phaser.GameObjects.Text;
  private counterText?: Phaser.GameObjects.Text;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super({ key: 'Mission03Handlebar' });
  }

  create(): void {
    this.lane = 0;
    this.lastStarLane = 0;
    this.catches = 0;
    this.misses = 0;
    this.playing = false;
    this.finished = false;
    this.learn2Shown = false;
    this.hintShown = false;
    this.speechBusy = false;
    this.speechQueue = [];
    this.fallers = [];
    this.spawnTimer = undefined;
    this.laneRects = [];

    this.drawBackground();
    const { x, y, scale } = getGameCenter(this);
    this.layoutScale = scale;
    this.catchY = y + 28 * scale;

    this.instructionText = addComicText(this, x, y - 236 * scale, 'Lenke in die Spur mit dem Stern!', 22 * scale);
    this.instructionText.setDepth(12);
    this.counterText = addComicText(this, x, y - 200 * scale, `Sterne: 0 / ${GOAL}`, 20 * scale);
    this.counterText.setDepth(12);

    const roadTop = y - 168 * scale;
    const roadBottom = this.catchY + 36 * scale;
    this.createRoad(x, roadTop, roadBottom, scale);
    this.createRider(scale);
    this.createControls(x, y + 132 * scale, y + 214 * scale, scale);

    createComicButton(
      this,
      x + 340 * scale,
      y - 236 * scale,
      'Zurück',
      () => {
        hideSpeech();
        this.scene.start('WorkshopScene');
      },
      0x5b6ee1,
      150,
    ).setDepth(15);

    this.cursors = this.input.keyboard?.createCursorKeys();
    this.input.once('pointerdown', () => {
      void feedbackSounds.unlock();
    });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.finished = true;
      hideSpeech();
    });

    this.enqueueSpeech(this.missionData.intro);
    this.enqueueSpeech(this.missionData.learn1);
  }

  update(): void {
    if (!this.playing || this.finished) return;
    this.pollKeys();
    this.checkCatches();
  }

  private pollKeys(): void {
    if (!this.cursors) return;
    if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) this.applySteer(-1);
    if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) this.applySteer(1);
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      this.applySteer(0);
    }
  }

  private checkCatches(): void {
    const windowTop = this.catchY - 52 * this.layoutScale;
    const windowBottom = this.catchY + 16 * this.layoutScale;
    for (const faller of this.fallers) {
      if (faller.settled || !faller.star.active) continue;
      if (faller.star.y < windowTop || faller.star.y > windowBottom) continue;
      if (faller.lane === this.lane) this.onCatch(faller);
    }
  }

  private drawBackground(): void {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, COLORS.sky);
    this.add.rectangle(width / 2, height * 0.78, width, height * 0.44, COLORS.grass);
  }

  private createRoad(centerX: number, top: number, bottom: number, scale: number): void {
    const roadHeight = bottom - top;
    const road = this.add.rectangle(centerX, (top + bottom) / 2, 250 * scale, roadHeight, 0x5c6770);
    road.setStrokeStyle(4 * scale, COLORS.outline);

    const laneOffset = 78 * scale;
    this.laneCenters = [centerX - laneOffset, centerX, centerX + laneOffset];

    this.laneRects = this.laneCenters.map((laneX) => {
      const rect = this.add.rectangle(laneX, (top + bottom) / 2, 72 * scale, roadHeight - 10 * scale, COLORS.star, 0.08);
      rect.setDepth(1);
      return rect;
    });
    this.highlightLane(0);

    const marks = this.add.graphics();
    marks.setDepth(2);
    marks.lineStyle(3 * scale, 0xffffff, 0.75);
    const dash = 16 * scale;
    const gap = 12 * scale;
    for (const dx of [-laneOffset / 2, laneOffset / 2]) {
      for (let y = top + 10 * scale; y < bottom - 6 * scale; y += dash + gap) {
        marks.lineBetween(centerX + dx, y, centerX + dx, Math.min(y + dash, bottom - 6 * scale));
      }
    }
  }

  private createRider(scale: number): void {
    this.bike = this.add.container(this.laneCenter(0), this.catchY);
    this.bike.setDepth(5);

    const shadow = this.add.ellipse(0, 20 * scale, 56 * scale, 16 * scale, 0x000000, 0.15);
    const rear = this.add.ellipse(0, 16 * scale, 18 * scale, 30 * scale, COLORS.wheel);
    rear.setStrokeStyle(2 * scale, COLORS.outline);
    const frame = this.add.rectangle(0, -2 * scale, 14 * scale, 34 * scale, COLORS.bikeFrame);
    frame.setStrokeStyle(2 * scale, COLORS.outline);

    this.frontWheel = this.add.container(0, -26 * scale);
    const tire = this.add.ellipse(0, 0, 16 * scale, 28 * scale, COLORS.wheel);
    tire.setStrokeStyle(2 * scale, COLORS.outline);
    const spoke = this.add.rectangle(0, 0, 3 * scale, 20 * scale, COLORS.wheelRim);
    const bars = this.add.rectangle(0, -14 * scale, 28 * scale, 5 * scale, COLORS.bikeFrame);
    bars.setStrokeStyle(2 * scale, COLORS.outline);
    this.frontWheel.add([tire, spoke, bars]);

    const head = this.add.circle(0, -6 * scale, 11 * scale, COLORS.samuelSkin);
    head.setStrokeStyle(2 * scale, COLORS.outline);
    const hair = this.add.ellipse(0, -14 * scale, 18 * scale, 9 * scale, 0x5c3d2e);
    hair.setStrokeStyle(2 * scale, COLORS.outline);
    const eyeL = this.add.circle(-4 * scale, -7 * scale, 1.6 * scale, COLORS.outline);
    const eyeR = this.add.circle(4 * scale, -7 * scale, 1.6 * scale, COLORS.outline);

    this.bike.add([shadow, rear, frame, this.frontWheel, hair, head, eyeL, eyeR]);
  }

  private createControls(barX: number, barY: number, buttonY: number, scale: number): void {
    this.controls = this.add.container(0, 0);
    this.controls.setDepth(8);

    const handlebar = this.add.container(barX, barY);
    const zone = this.add.rectangle(0, 6 * scale, 280 * scale, 84 * scale, COLORS.panel);
    zone.setStrokeStyle(3 * scale, COLORS.outline);
    zone.setInteractive({ draggable: true, useHandCursor: true });

    const caption = this.add
      .text(0, -24 * scale, 'Lenker ziehen', {
        fontFamily: 'Fredoka, Comic Sans MS, cursive',
        fontSize: `${16 * scale}px`,
        color: '#1a1a2e',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    const barGraphic = this.add.container(0, 14 * scale);
    const gripL = this.add.rectangle(-78 * scale, 0, 18 * scale, 28 * scale, 0x333333);
    gripL.setStrokeStyle(2 * scale, COLORS.outline);
    const gripR = this.add.rectangle(78 * scale, 0, 18 * scale, 28 * scale, 0x333333);
    gripR.setStrokeStyle(2 * scale, COLORS.outline);
    const bar = this.add.rectangle(0, 0, 150 * scale, 8 * scale, COLORS.bikeFrame);
    bar.setStrokeStyle(2 * scale, COLORS.outline);
    barGraphic.add([bar, gripL, gripR]);

    const nudgeL = this.add
      .text(-118 * scale, 14 * scale, '←', {
        fontFamily: 'Fredoka, Comic Sans MS, cursive',
        fontSize: `${22 * scale}px`,
        color: '#1a1a2e',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    const nudgeR = this.add
      .text(118 * scale, 14 * scale, '→', {
        fontFamily: 'Fredoka, Comic Sans MS, cursive',
        fontSize: `${22 * scale}px`,
        color: '#1a1a2e',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    handlebar.add([zone, caption, nudgeL, nudgeR, barGraphic]);
    this.input.setDraggable(zone);

    zone.on('drag', (pointer: Phaser.Input.Pointer) => {
      const dx = Phaser.Math.Clamp(pointer.x - barX, -100 * scale, 100 * scale);
      const next: Lane = dx < -34 * scale ? -1 : dx > 34 * scale ? 1 : 0;
      this.applySteer(next, (dx / (100 * scale)) * 36);
    });
    zone.on('dragend', () => {
      this.applySteer(this.lane, this.lane * 34);
    });

    const left = createComicButton(this, barX - 168 * scale, buttonY, '← Links', () => this.applySteer(-1), 0x3b6fe0, 140);
    const middle = createComicButton(this, barX, buttonY, 'Mitte', () => this.applySteer(0), 0xff6b35, 130);
    const right = createComicButton(this, barX + 168 * scale, buttonY, 'Rechts →', () => this.applySteer(1), 0x3cba5a, 150);

    this.controls.add([handlebar, left, middle, right]);
    this.barGraphic = barGraphic;
  }

  private barGraphic?: Phaser.GameObjects.Container;

  private laneCenter(lane: Lane): number {
    return this.laneCenters[lane + 1] ?? this.laneCenters[1] ?? 0;
  }

  private applySteer(lane: Lane, tilt = lane * 34): void {
    if (this.finished) return;
    this.barGraphic?.setAngle(tilt);
    this.frontWheel?.setAngle(tilt);
    this.highlightLane(lane);
    if (lane === this.lane) return;
    this.lane = lane;
    this.tweens.killTweensOf(this.bike);
    this.tweens.add({
      targets: this.bike,
      x: this.laneCenter(lane),
      duration: 160,
      ease: 'Sine.easeOut',
    });
  }

  private highlightLane(lane: Lane): void {
    this.laneRects.forEach((rect, index) => {
      rect.setFillStyle(COLORS.star, index === lane + 1 ? 0.38 : 0.08);
    });
  }

  private enqueueSpeech(line: string): void {
    this.speechQueue.push(line);
    void this.pumpSpeech();
  }

  private async pumpSpeech(): Promise<void> {
    if (this.speechBusy) return;
    this.speechBusy = true;
    this.pausePlay();
    // isActive() ist während create() noch falsch. Erst nach der Sprechblase prüfen.
    while (this.speechQueue.length > 0) {
      const line = this.speechQueue.shift();
      if (!line) break;
      const continued = await showSpeechIf(this, line);
      if (!continued) {
        this.speechQueue = [];
        break;
      }
    }
    this.speechBusy = false;
    if (this.sys.isActive()) this.resumePlay();
  }

  private pausePlay(): void {
    this.playing = false;
    if (this.spawnTimer) this.spawnTimer.paused = true;
    for (const faller of this.fallers) {
      if (!faller.settled) faller.tween.pause();
    }
  }

  private resumePlay(): void {
    if (this.finished || !this.sys.isActive()) return;
    void feedbackSounds.unlock();
    this.playing = true;
    if (!this.spawnTimer) {
      this.instructionText?.setText('Fang 5 Sterne!');
      this.spawnTimer = this.time.addEvent({
        delay: 1700,
        loop: true,
        callback: () => this.spawnStar(),
      });
      this.spawnStar();
      return;
    }
    this.spawnTimer.paused = false;
    for (const faller of this.fallers) {
      if (!faller.settled) faller.tween.resume();
    }
  }

  private pickLane(): Lane {
    const pool: Lane[] = [];
    const all: Lane[] = [-1, 0, 1];
    for (const lane of all) {
      if (lane !== this.lastStarLane) pool.push(lane);
    }
    const lane = pool[Phaser.Math.Between(0, pool.length - 1)] ?? 0;
    this.lastStarLane = lane;
    return lane;
  }

  private spawnStar(): void {
    if (!this.playing || this.finished || this.catches >= GOAL) return;
    const lane = this.pickLane();
    const star = this.add.star(this.laneCenter(lane), this.catchY - 210 * this.layoutScale, 5, 8, 16, COLORS.star);
    star.setStrokeStyle(2, COLORS.outline);
    star.setDepth(6);

    const faller: Faller = { lane, star, tween: undefined as unknown as Phaser.Tweens.Tween, settled: false };
    const tween = this.tweens.add({
      targets: star,
      y: this.catchY + 46 * this.layoutScale,
      duration: 3800,
      ease: 'Linear',
      onComplete: () => this.onMiss(faller),
    });
    faller.tween = tween;
    this.fallers.push(faller);
  }

  private onCatch(faller: Faller): void {
    if (faller.settled || this.finished) return;
    faller.settled = true;
    faller.tween.stop();
    this.catches += 1;
    this.counterText?.setText(`Sterne: ${this.catches} / ${GOAL}`);
    feedbackSounds.catch();

    this.tweens.add({
      targets: faller.star,
      scale: 1.5,
      alpha: 0,
      duration: 260,
      onComplete: () => faller.star.destroy(),
    });

    if (!this.learn2Shown) {
      this.learn2Shown = true;
      this.enqueueSpeech(this.missionData.learn2);
    }

    if (this.catches >= GOAL) {
      this.finished = true;
      this.pausePlay();
      this.spawnTimer?.remove(false);
      this.clearFallers();
      this.time.delayedCall(450, () => {
        if (this.sys.isActive()) void this.onMissionComplete();
      });
    }
  }

  private onMiss(faller: Faller): void {
    if (faller.settled || this.finished) return;
    faller.settled = true;
    this.misses += 1;
    feedbackSounds.miss();
    floatFeedback(this, faller.star.x, faller.star.y - 20, 'Daneben!', '#ff6b6b', 18 * this.layoutScale);
    this.tweens.add({
      targets: faller.star,
      alpha: 0,
      duration: 200,
      onComplete: () => faller.star.destroy(),
    });

    if (this.misses >= 2 && !this.hintShown) {
      this.hintShown = true;
      this.enqueueSpeech(this.missionData.hint);
    }
  }

  private clearFallers(): void {
    for (const faller of this.fallers) {
      faller.settled = true;
      faller.tween.stop();
      faller.star.destroy();
    }
    this.fallers = [];
  }

  private async onMissionComplete(): Promise<void> {
    if (!this.sys.isActive()) return;
    this.finished = true;
    this.playing = false;
    this.controls?.setVisible(false);

    const earned = starsForMistakes(this.misses);
    unlockPart('handlebar');
    completeMission('mission-03-handlebar', earned);
    feedbackSounds.success();

    const { x, y, scale } = getGameCenter(this);
    this.instructionText?.setText('Geschafft!');
    this.counterText?.setText(earned === 3 ? 'Ohne Fehler!' : `${earned} von 3 Sternen`);

    for (let i = 0; i < 3; i++) {
      const star = drawStar(this, x - 50 * scale + i * 50 * scale, y - 150 * scale, 18 * scale, i < earned);
      star.setDepth(20);
      star.setScale(0);
      this.tweens.add({
        targets: star,
        scale: 1,
        delay: i * 180,
        duration: 280,
        ease: 'Back.easeOut',
      });
    }

    this.tweens.add({
      targets: this.bike,
      y: this.bike.y - 14 * scale,
      duration: 280,
      yoyo: true,
      repeat: 1,
    });

    const continued = await showSpeechIf(this, this.missionData.success);
    if (!continued) return;

    createComicButton(this, x, y + 214 * scale, 'Zur Werkstatt!', () => {
      this.scene.start('WorkshopScene');
    }).setDepth(15);
  }
}
