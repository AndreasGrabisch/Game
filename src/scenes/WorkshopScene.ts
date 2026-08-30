import Phaser from 'phaser';
import { COLORS, PART_LABELS, type VehiclePart } from '../game/constants';
import {
  drawSamuel,
  drawBike,
  addComicText,
  createComicButton,
  drawStar,
} from '../game/graphics';
import { getGameCenter } from './BootScene';
import {
  isMissionAvailable,
  isPartUnlocked,
  loadProgress,
  getNextMission,
} from '../game/Progress';
import { MISSIONS } from '../data/missions';

const MISSION_MAP: { id: string; part: VehiclePart; x: number; y: number }[] = [
  { id: 'mission-01-wheels', part: 'wheels', x: -180, y: -60 },
  { id: 'mission-02-pedals', part: 'pedals', x: 0, y: -120 },
  { id: 'mission-03-handlebar', part: 'handlebar', x: 180, y: -60 },
];

export class WorkshopScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WorkshopScene' });
  }

  create(): void {
    this.drawBackground();
    const { x, y, scale } = getGameCenter(this);
    const progress = loadProgress();

    addComicText(this, x, y - 220 * scale, 'Samuels Werkstatt', 32 * scale);

    const bike = drawBike(this, x, y + 80 * scale, 1.3 * scale, {
      showFrame: true,
      showWheels: isPartUnlocked('wheels'),
      showPedals: isPartUnlocked('pedals'),
      showHandlebar: isPartUnlocked('handlebar'),
    });

    drawSamuel(this, x - 200 * scale, y + 60 * scale, 1.0 * scale);

    if (isPartUnlocked('wheels') && isPartUnlocked('pedals') && isPartUnlocked('handlebar')) {
      this.tweens.add({
        targets: bike,
        x: x + 30 * scale,
        duration: 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
      addComicText(this, x, y + 200 * scale, 'Fahrrad fertig!', 26 * scale);
    }

    for (const mission of MISSION_MAP) {
      this.createMissionNode(x, y, scale, mission, progress);
    }

    createComicButton(
      this,
      x - 200 * scale,
      y + 220 * scale,
      'Menü',
      () => this.scene.start('MenuScene'),
      0x5b6ee1,
    );

    const next = getNextMission();
    if (next) {
      createComicButton(this, x + 200 * scale, y + 220 * scale, 'Weiter!', () => {
        this.startMission(next);
      });
    }
  }

  private createMissionNode(
    cx: number,
    cy: number,
    scale: number,
    mission: (typeof MISSION_MAP)[0],
    progress: ReturnType<typeof loadProgress>,
  ): void {
    const mx = cx + mission.x * scale;
    const my = cy + mission.y * scale;
    const available = isMissionAvailable(mission.id);
    const completed = progress.completedMissions.includes(mission.id);
    const locked = !available;

    const color = completed ? COLORS.success : locked ? 0xcccccc : COLORS.bikeFrame;
    const node = this.add.circle(mx, my, 36 * scale, color);
    node.setStrokeStyle(3, COLORS.outline);

    const label = this.add
      .text(mx, my, PART_LABELS[mission.part].split(' ')[0], {
        fontFamily: 'Fredoka, Comic Sans MS, cursive',
        fontSize: `${14 * scale}px`,
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    if (completed) {
      const stars = progress.stars[mission.id] ?? 1;
      for (let i = 0; i < stars; i++) {
        drawStar(this, mx - 20 * scale + i * 20 * scale, my - 50 * scale, 10 * scale);
      }
    }

    if (locked) {
      const lock = this.add
        .text(mx, my + 4 * scale, '🔒', { fontSize: `${20 * scale}px` })
        .setOrigin(0.5);
      label.setVisible(false);
      lock.setVisible(true);
    } else {
      node.setInteractive({ useHandCursor: true });
      node.on('pointerdown', () => this.startMission(mission.id));
      node.on('pointerover', () => node.setFillStyle(color, 0.8));
      node.on('pointerout', () => node.setFillStyle(color, 1));
    }
  }

  private startMission(missionId: string): void {
    if (!MISSIONS[missionId]) return;

    if (missionId === 'mission-01-wheels') {
      this.scene.start('Mission01Wheels');
    } else if (missionId === 'mission-02-pedals') {
      this.scene.start('Mission02Pedals');
    } else {
      this.scene.start('WorkshopScene');
    }
  }

  private drawBackground(): void {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0xfff8e7);
    this.add.rectangle(width / 2, height * 0.85, width, height * 0.3, COLORS.grass);

    const panel = this.add.rectangle(width / 2, height * 0.15, width * 0.9, 60, COLORS.panel);
    panel.setStrokeStyle(3, COLORS.outline);
  }
}
