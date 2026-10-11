import Phaser from 'phaser';
import { COLORS } from '../game/constants';
import { addComicText, createComicButton } from '../game/graphics';
import { getGameCenter } from './BootScene';
import { MINIGAMES, type MinigameDefinition } from '../data/minigames';

export class HubScene extends Phaser.Scene {
  constructor() {
    super({ key: 'HubScene' });
  }

  create(): void {
    this.drawBackground();
    const { x, y, scale } = getGameCenter(this);

    addComicText(this, x, y - 220 * scale, 'Minispiele', 44 * scale);
    addComicText(this, x, y - 175 * scale, 'Wähle ein Spiel aus', 20 * scale);

    const cardGap = 24 * scale;
    const cardWidth = 280 * scale;
    const cardHeight = 200 * scale;
    const totalWidth = MINIGAMES.length * cardWidth + (MINIGAMES.length - 1) * cardGap;
    const startX = x - totalWidth / 2 + cardWidth / 2;

    MINIGAMES.forEach((game, index) => {
      const cx = startX + index * (cardWidth + cardGap);
      const cy = y + 20 * scale;
      this.createMinigameCard(cx, cy, cardWidth, cardHeight, scale, game);
    });
  }

  private createMinigameCard(
    x: number,
    y: number,
    width: number,
    height: number,
    scale: number,
    game: MinigameDefinition,
  ): void {
    const container = this.add.container(x, y);
    const isSoon = game.status === 'coming_soon';

    const bg = this.add.rectangle(0, 0, width, height, COLORS.panel);
    bg.setStrokeStyle(4, COLORS.outline);
    container.add(bg);

    const accent = this.add.rectangle(0, -height / 2 + 8 * scale, width - 8 * scale, 56 * scale, game.accentColor);
    accent.setStrokeStyle(2, COLORS.outline);
    container.add(accent);

    const emoji = this.add
      .text(0, -height / 2 + 36 * scale, game.emoji, { fontSize: `${36 * scale}px` })
      .setOrigin(0.5);
    container.add(emoji);

    const title = this.add
      .text(0, -height / 2 + 88 * scale, game.title, {
        fontFamily: 'Fredoka, Comic Sans MS, cursive',
        fontSize: `${20 * scale}px`,
        color: '#1a1a2e',
        fontStyle: 'bold',
        align: 'center',
        wordWrap: { width: width - 24 * scale },
      })
      .setOrigin(0.5, 0);
    container.add(title);

    const tagline = this.add
      .text(0, height / 2 - 72 * scale, game.tagline, {
        fontFamily: 'Fredoka, Comic Sans MS, cursive',
        fontSize: `${14 * scale}px`,
        color: '#444466',
        align: 'center',
        wordWrap: { width: width - 32 * scale },
      })
      .setOrigin(0.5, 0);
    container.add(tagline);

    if (isSoon) {
      const badge = this.add.rectangle(width / 2 - 52 * scale, -height / 2 + 14 * scale, 88 * scale, 26 * scale, 0x888899);
      badge.setStrokeStyle(2, COLORS.outline);
      const badgeText = this.add
        .text(badge.x, badge.y, 'Bald!', {
          fontFamily: 'Fredoka, Comic Sans MS, cursive',
          fontSize: `${12 * scale}px`,
          color: '#ffffff',
          fontStyle: 'bold',
        })
        .setOrigin(0.5);
      container.add([badge, badgeText]);
    }

    const btnLabel = isSoon ? 'Vorschau' : 'Spielen';
    const btn = createComicButton(this, 0, height / 2 - 28 * scale, btnLabel, () => {
      this.scene.start(game.sceneKey);
    }, game.accentColor);
    container.add(btn);

    this.tweens.add({
      targets: container,
      y: y - 4 * scale,
      duration: 1400 + indexOffset(game.id) * 200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private drawBackground(): void {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, COLORS.sky);
    this.add.rectangle(width / 2, height * 0.82, width, height * 0.36, COLORS.grass);

    for (let i = 0; i < 8; i++) {
      const cx = (width / 9) * (i + 1);
      const cloud = this.add.ellipse(cx, 50 + (i % 4) * 28, 80, 36, COLORS.white, 0.85);
      cloud.setStrokeStyle(2, COLORS.outline, 0.15);
    }

    const shelf = this.add.rectangle(width / 2, height * 0.72, width * 0.92, 12, 0x8b6914);
    shelf.setStrokeStyle(2, COLORS.outline);
  }
}

function indexOffset(id: string): number {
  const i = MINIGAMES.findIndex((g) => g.id === id);
  return i >= 0 ? i : 0;
}
