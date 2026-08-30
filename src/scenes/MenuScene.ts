import Phaser from 'phaser';
import { COLORS } from '../game/constants';
import { drawSamuel, drawBike, addComicText, createComicButton } from '../game/graphics';
import { getGameCenter } from './BootScene';
import { resetProgress } from '../game/Progress';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    this.drawBackground();
    const { x, y, scale } = getGameCenter(this);

    addComicText(this, x, y - 160 * scale, 'Samuel baut\nsein Fahrrad', 42 * scale);

    const samuel = drawSamuel(this, x - 80 * scale, y + 40 * scale, 1.2 * scale);
    const bike = drawBike(this, x + 100 * scale, y + 60 * scale, 1.0 * scale, {
      showFrame: true,
      showWheels: false,
    });

    this.tweens.add({
      targets: [samuel, bike],
      y: `+=${8 * scale}`,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    createComicButton(this, x, y + 170 * scale, 'Spielen!', () => {
      this.scene.start('WorkshopScene');
    });

    createComicButton(
      this,
      x,
      y + 240 * scale,
      'Neu starten',
      () => {
        resetProgress();
        this.scene.restart();
      },
      0x5b6ee1,
    );
  }

  private drawBackground(): void {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, COLORS.sky);
    this.add.rectangle(width / 2, height * 0.82, width, height * 0.36, COLORS.grass);

    for (let i = 0; i < 6; i++) {
      const cx = (width / 7) * (i + 1);
      const cloud = this.add.ellipse(cx, 60 + (i % 3) * 30, 90, 40, COLORS.white, 0.9);
      cloud.setStrokeStyle(2, COLORS.outline, 0.2);
    }
  }
}
