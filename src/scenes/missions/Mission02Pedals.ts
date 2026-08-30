import Phaser from 'phaser';
import { COLORS } from '../../game/constants';
import {
  drawSamuel,
  drawBike,
  addComicText,
  createComicButton,
  drawStar,
} from '../../game/graphics';
import { getGameCenter } from '../BootScene';
import { completeMission, unlockPart } from '../../game/Progress';
import { MISSIONS } from '../../data/missions';
import { showSpeech, hideSpeech } from '../../ui/speech';

type PartId = 'pedal' | 'chain' | 'wheel';

const CORRECT_ORDER: PartId[] = ['pedal', 'chain', 'wheel'];

const PART_LABELS: Record<PartId, string> = {
  pedal: 'Pedal',
  chain: 'Kette',
  wheel: 'Rad',
};

export class Mission02Pedals extends Phaser.Scene {
  private missionData = MISSIONS['mission-02-pedals'];
  private currentStep = 0;
  private hintShown = false;
  private failCount = 0;
  private instructionText?: Phaser.GameObjects.Text;
  private slotIndicators: Phaser.GameObjects.Container[] = [];

  constructor() {
    super({ key: 'Mission02Pedals' });
  }

  create(): void {
    this.currentStep = 0;
    this.hintShown = false;
    this.failCount = 0;
    this.slotIndicators = [];

    this.drawBackground();
    const { x, y, scale } = getGameCenter(this);

    this.instructionText = addComicText(
      this,
      x,
      y - 220 * scale,
      'Tippe in der richtigen Reihenfolge!',
      22 * scale,
    );

    drawBike(this, x, y + 20 * scale, 1.4 * scale, {
      showFrame: true,
      showWheels: true,
      showPedals: false,
    });

    drawSamuel(this, x - 220 * scale, y + 10 * scale, 0.9 * scale);

    this.createOrderSlots(x, y - 80 * scale, scale);
    this.createPartButtons(x, y + 140 * scale, scale);

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

    void this.runIntro();
  }

  private async runIntro(): Promise<void> {
    await showSpeech(this.missionData.intro);
    this.instructionText?.setText(this.missionData.learn1);
    await showSpeech(this.missionData.learn1);
  }

  private createOrderSlots(cx: number, cy: number, scale: number): void {
    const labels = ['1', '2', '3'];
    for (let i = 0; i < 3; i++) {
      const sx = cx + (i - 1) * 100 * scale;
      const container = this.add.container(sx, cy);

      const box = this.add.rectangle(0, 0, 80 * scale, 80 * scale, COLORS.white);
      box.setStrokeStyle(3, COLORS.outline);

      const num = this.add
        .text(0, -28 * scale, labels[i], {
          fontFamily: 'Fredoka, Comic Sans MS, cursive',
          fontSize: `${16 * scale}px`,
          color: '#888888',
          fontStyle: 'bold',
        })
        .setOrigin(0.5);

      const placeholder = this.add
        .text(0, 4 * scale, '?', {
          fontFamily: 'Fredoka, Comic Sans MS, cursive',
          fontSize: `${28 * scale}px`,
          color: '#cccccc',
        })
        .setOrigin(0.5);

      container.add([box, num, placeholder]);
      this.slotIndicators.push(container);
    }
  }

  private createPartButtons(cx: number, cy: number, scale: number): void {
    const shuffled = Phaser.Utils.Array.Shuffle<PartId>(['pedal', 'chain', 'wheel']);

    for (let i = 0; i < shuffled.length; i++) {
      const part = shuffled[i];
      const bx = cx + (i - 1) * 150 * scale;
      this.createPartButton(bx, cy, scale, part);
    }
  }

  private createPartButton(x: number, y: number, scale: number, part: PartId): void {
    const size = 90;
    const container = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, size * scale, size * scale, this.getPartColor(part));
    bg.setStrokeStyle(3, COLORS.outline);
    bg.setInteractive({ useHandCursor: true });

    const icon = this.createPartIcon(part, scale);
    const label = this.add
      .text(0, (size / 2 + 14) * scale, PART_LABELS[part], {
        fontFamily: 'Fredoka, Comic Sans MS, cursive',
        fontSize: `${14 * scale}px`,
        color: '#1a1a2e',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    container.add([bg, icon, label]);
    container.setData('bg', bg);

    bg.on('pointerover', () => bg.setFillStyle(this.getPartColor(part), 0.8));
    bg.on('pointerout', () => bg.setFillStyle(this.getPartColor(part), 1));
    bg.on('pointerdown', () => this.onPartClicked(part, container, scale));
  }

  private createPartIcon(part: PartId, scale: number): Phaser.GameObjects.Container {
    const icon = this.add.container(0, 0);

    if (part === 'pedal') {
      const crank = this.add.circle(0, 0, 10 * scale, COLORS.wheel);
      crank.setStrokeStyle(2, COLORS.outline);
      const pedal = this.add.rectangle(16 * scale, 0, 18 * scale, 8 * scale, COLORS.wheelRim);
      pedal.setStrokeStyle(2, COLORS.outline);
      icon.add([crank, pedal]);
    } else if (part === 'chain') {
      const g = this.add.graphics();
      g.lineStyle(3 * scale, COLORS.outline);
      for (let i = 0; i < 5; i++) {
        g.strokeCircle(-24 * scale + i * 12 * scale, 0, 5 * scale);
      }
      icon.add(g);
    } else {
      const tire = this.add.circle(0, 0, 16 * scale, COLORS.wheel);
      tire.setStrokeStyle(2, COLORS.outline);
      icon.add(tire);
    }

    return icon;
  }

  private getPartColor(part: PartId): number {
    const colors: Record<PartId, number> = {
      pedal: 0xffd93d,
      chain: 0xaaaaaa,
      wheel: 0x4ecdc4,
    };
    return colors[part];
  }

  private onPartClicked(
    part: PartId,
    container: Phaser.GameObjects.Container,
    scale: number,
  ): void {
    const expected = CORRECT_ORDER[this.currentStep];

    if (part !== expected) {
      this.onWrongClick(container, scale);
      return;
    }

    this.onCorrectClick(part, container, scale);
  }

  private onWrongClick(container: Phaser.GameObjects.Container, scale: number): void {
    this.failCount++;
    this.cameras.main.shake(100, 0.005);

    const expected = CORRECT_ORDER[this.currentStep];
    const msg = `Erst ${PART_LABELS[expected]}!`;

    const feedback = this.add
      .text(container.x, container.y - 60 * scale, msg, {
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

    this.tweens.add({
      targets: container,
      x: container.x + 8,
      duration: 50,
      yoyo: true,
      repeat: 3,
    });

    if (this.failCount >= 2 && !this.hintShown) {
      this.hintShown = true;
      void showSpeech(this.missionData.hint);
    }
  }

  private onCorrectClick(
    part: PartId,
    container: Phaser.GameObjects.Container,
    scale: number,
  ): void {
    const slot = this.slotIndicators[this.currentStep];
    const slotX = slot.x;
    const slotY = slot.y;

    container.setAlpha(0.5);
    const bg = container.getData('bg') as Phaser.GameObjects.Rectangle;
    bg.disableInteractive();

    const mini = this.add
      .text(slotX, slotY, PART_LABELS[part], {
        fontFamily: 'Fredoka, Comic Sans MS, cursive',
        fontSize: `${14 * scale}px`,
        color: '#1a1a2e',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    const sparkle = this.add.star(slotX, slotY - 20 * scale, 4, 4 * scale, 8 * scale, COLORS.star);
    this.tweens.add({
      targets: sparkle,
      alpha: 0,
      scale: 2,
      duration: 500,
      onComplete: () => sparkle.destroy(),
    });

    this.tweens.add({
      targets: mini,
      scale: 1.3,
      duration: 200,
      yoyo: true,
    });

    this.currentStep++;

    if (this.currentStep >= CORRECT_ORDER.length) {
      this.time.delayedCall(800, () => void this.onMissionComplete(scale));
    }
  }

  private async onMissionComplete(scale: number): Promise<void> {
    const { x, y } = getGameCenter(this);

    unlockPart('pedals');
    completeMission('mission-02-pedals', 3);

    drawBike(this, x, y + 20 * scale, 1.4 * scale, {
      showFrame: true,
      showWheels: true,
      showPedals: true,
    });

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

    createComicButton(this, x, y + 220 * scale, 'Zur Werkstatt!', () => {
      this.scene.start('WorkshopScene');
    });
  }

  private drawBackground(): void {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, COLORS.sky);
    this.add.rectangle(width / 2, height * 0.8, width, height * 0.4, COLORS.grass);
  }
}
