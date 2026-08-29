import Phaser from 'phaser';
import { COLORS } from '../../game/constants';
import {
  drawSamuel,
  drawBike,
  drawWheel,
  drawSquareWheel,
  addComicText,
  createComicButton,
  drawStar,
} from '../../game/graphics';
import { getGameCenter } from '../BootScene';
import { completeMission, unlockPart } from '../../game/Progress';
import { MISSIONS } from '../../data/missions';
import { showSpeech, hideSpeech } from '../../ui/speech';

interface DraggableWheel {
  container: Phaser.GameObjects.Container;
  isRound: boolean;
  placed: boolean;
  startX: number;
  startY: number;
}

export class Mission01Wheels extends Phaser.Scene {
  private wheels: DraggableWheel[] = [];
  private placedCount = 0;
  private hintShown = false;
  private failCount = 0;
  private missionData = MISSIONS['mission-01-wheels'];
  private slotPositions: { x: number; y: number }[] = [];
  private instructionText?: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'Mission01Wheels' });
  }

  create(): void {
    this.placedCount = 0;
    this.hintShown = false;
    this.failCount = 0;
    this.wheels = [];

    this.drawBackground();
    const { x, y, scale } = getGameCenter(this);

    this.instructionText = addComicText(this, x, y - 220 * scale, '', 22 * scale);

    drawBike(this, x, y + 40 * scale, 1.4 * scale, {
      showFrame: true,
      showWheels: false,
    });

    this.slotPositions = [
      { x: x - 77 * scale, y: y + 68 * scale },
      { x: x + 77 * scale, y: y + 68 * scale },
    ];

    for (const slot of this.slotPositions) {
      const ring = this.add.circle(slot.x, slot.y, 40 * scale);
      ring.setStrokeStyle(3, COLORS.outline, 0.4);
      ring.setFillStyle(COLORS.white, 0.2);
    }

    drawSamuel(this, x - 220 * scale, y + 30 * scale, 0.9 * scale);

    this.createDraggableWheels(x, y, scale);

    createComicButton(
      this,
      x + 220 * scale,
      y - 200 * scale,
      'Zurück',
      () => {
        hideSpeech();
        this.scene.start('WorkshopScene');
      },
      0x5b6ee1,
    );

    this.runIntro();
  }

  private async runIntro(): Promise<void> {
    await showSpeech(this.missionData.intro);
    this.instructionText?.setText(this.missionData.learn1);
    await showSpeech(this.missionData.learn1);
  }

  private createDraggableWheels(cx: number, cy: number, scale: number): void {
    const items: { x: number; y: number; round: boolean }[] = [
      { x: cx - 280 * scale, y: cy + 140 * scale, round: true },
      { x: cx - 160 * scale, y: cy + 160 * scale, round: false },
      { x: cx + 160 * scale, y: cy + 160 * scale, round: false },
      { x: cx + 280 * scale, y: cy + 140 * scale, round: true },
    ];

    for (const item of items) {
      const wheel = item.round
        ? drawWheel(this, 0, 0, 32 * scale)
        : drawSquareWheel(this, 0, 0, 56 * scale);

      const container = this.add.container(item.x, item.y, [wheel]);
      container.setSize(80 * scale, 80 * scale);
      container.setInteractive({ draggable: true, useHandCursor: true });

      const data: DraggableWheel = {
        container,
        isRound: item.round,
        placed: false,
        startX: item.x,
        startY: item.y,
      };

      this.wheels.push(data);

      this.input.setDraggable(container);

      container.on('drag', (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
        if (data.placed) return;
        container.x = dragX;
        container.y = dragY;
        container.setScale(1.1);
      });

      container.on('dragend', () => {
        if (data.placed) return;
        container.setScale(1);
        this.handleDrop(data, scale);
      });
    }
  }

  private handleDrop(wheel: DraggableWheel, scale: number): void {
    if (!wheel.isRound) {
      this.onWrongWheel(wheel, scale);
      return;
    }

    for (let i = 0; i < this.slotPositions.length; i++) {
      const slot = this.slotPositions[i];
      const dist = Phaser.Math.Distance.Between(wheel.container.x, wheel.container.y, slot.x, slot.y);

      if (dist < 50 * scale) {
        const occupied = this.wheels.some(
          (w) => w.placed && w.container.x === slot.x && w.container.y === slot.y,
        );
        if (!occupied) {
          this.snapWheel(wheel, slot.x, slot.y, scale);
          return;
        }
      }
    }

    this.returnWheel(wheel);
  }

  private onWrongWheel(wheel: DraggableWheel, scale: number): void {
    this.failCount++;
    this.cameras.main.shake(100, 0.005);

    const feedback = this.add
      .text(wheel.container.x, wheel.container.y - 50 * scale, 'Das rollt nicht!', {
        fontFamily: 'Fredoka, Comic Sans MS, cursive',
        fontSize: `${18 * scale}px`,
        color: '#ff6b6b',
        fontStyle: 'bold',
        backgroundColor: '#fff',
        padding: { x: 8, y: 4 },
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: feedback,
      y: feedback.y - 30 * scale,
      alpha: 0,
      duration: 1000,
      onComplete: () => feedback.destroy(),
    });

    this.returnWheel(wheel);

    if (this.failCount >= 2 && !this.hintShown) {
      this.hintShown = true;
      void showSpeech(this.missionData.hint);
    }
  }

  private returnWheel(wheel: DraggableWheel): void {
    this.tweens.add({
      targets: wheel.container,
      x: wheel.startX,
      y: wheel.startY,
      duration: 300,
      ease: 'Back.easeOut',
    });
  }

  private snapWheel(wheel: DraggableWheel, x: number, y: number, scale: number): void {
    wheel.placed = true;
    wheel.container.x = x;
    wheel.container.y = y;
    wheel.container.disableInteractive();

    this.tweens.add({
      targets: wheel.container,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 150,
      yoyo: true,
      ease: 'Bounce.easeOut',
    });

    const sparkle = this.add.star(x, y - 20 * scale, 4, 4 * scale, 8 * scale, COLORS.star);
    this.tweens.add({
      targets: sparkle,
      alpha: 0,
      scale: 2,
      duration: 500,
      onComplete: () => sparkle.destroy(),
    });

    this.placedCount++;
    if (this.placedCount >= 2) {
      this.time.delayedCall(600, () => void this.onMissionComplete(scale));
    }
  }

  private async onMissionComplete(scale: number): Promise<void> {
    const { x, y } = getGameCenter(this);

    unlockPart('wheels');
    completeMission('mission-01-wheels', 3);

    for (let i = 0; i < 3; i++) {
      const star = drawStar(this, x - 40 * scale + i * 40 * scale, y - 160 * scale, 16 * scale);
      star.setScale(0);
      this.tweens.add({
        targets: star,
        scale: 1,
        duration: 300,
        delay: i * 200,
        ease: 'Back.easeOut',
      });
    }

    await showSpeech(this.missionData.success);

    createComicButton(this, x, y + 200 * scale, 'Zur Werkstatt!', () => {
      this.scene.start('WorkshopScene');
    });
  }

  private drawBackground(): void {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, COLORS.sky);
    this.add.rectangle(width / 2, height * 0.8, width, height * 0.4, COLORS.grass);
  }
}
