import Phaser from 'phaser';
import { COLORS } from '../game/constants';
import { addComicText, createComicButton, drawComicPanel } from '../game/graphics';
import { getGameCenter } from './BootScene';

export class DetectivePlaceholderScene extends Phaser.Scene {
  constructor() {
    super({ key: 'DetectivePlaceholderScene' });
  }

  create(): void {
    this.drawBackground();
    const { x, y, scale } = getGameCenter(this);

    addComicText(this, x, y - 200 * scale, 'Detektivspiel', 40 * scale);

    const panel = drawComicPanel(this, x, y + 10 * scale, 520 * scale, 260 * scale);
    panel.setDepth(1);

    this.add
      .text(x, y - 50 * scale, '🔍', { fontSize: `${64 * scale}px` })
      .setOrigin(0.5)
      .setDepth(2);

    addComicText(this, x, y + 20 * scale, 'Hier entsteht bald\nein neues Abenteuer!', 26 * scale).setDepth(2);

    this.add
      .text(x, y + 100 * scale, 'Du wirst Hinweise suchen,\nFragen stellen und Rätsel lösen.', {
        fontFamily: 'Fredoka, Comic Sans MS, cursive',
        fontSize: `${18 * scale}px`,
        color: '#444466',
        align: 'center',
        wordWrap: { width: 460 * scale },
      })
      .setOrigin(0.5)
      .setDepth(2);

    createComicButton(
      this,
      x,
      y + 220 * scale,
      'Zurück zur Auswahl',
      () => this.scene.start('HubScene'),
      0x5b6ee1,
    );
  }

  private drawBackground(): void {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x2d2d44);
    this.add.rectangle(width / 2, height * 0.15, width, height * 0.35, 0x3d3d5c);

    for (let i = 0; i < 5; i++) {
      const star = this.add.circle(80 + i * 180, 40 + (i % 2) * 30, 3, COLORS.star, 0.8);
      star.setDepth(0);
    }
  }
}
