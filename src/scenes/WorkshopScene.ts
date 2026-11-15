import Phaser from 'phaser';
import { COLORS, PART_LABELS, type VehiclePart } from '../game/constants';
import {
  drawSamuel,
  drawBike,
  addComicText,
  createComicButton,
  drawStar,
  floatFeedback,
} from '../game/graphics';
import { getGameCenter } from './BootScene';
import { attachIdleBounce, reactCompanionCheer } from '../game/characterCompanion';
import { drawLockIcon, drawWorkshopBackdrop } from '../game/sceneBackgrounds';
import { getDetectiveLayoutMode } from '../game/detectiveLayout';
import { feedbackSounds } from '../game/feedbackAudio';
import { bindSceneMusic } from '../game/sceneMusic';
import { playConfettiBurst } from '../game/celebrationConfetti';
import { readSceneEnterStyle, runSceneEnter, transitionToHub, transitionToScene } from '../game/sceneTransition';
import { CORE_BIKE_MISSIONS } from '../game/kidDifficultyCurve';
import {
  isMissionAvailable,
  isPartUnlocked,
  loadProgress,
  getNextMission,
} from '../game/Progress';
import { getBikeBuildProgressLabel } from '../game/appProgress';
import { MISSIONS } from '../data/missions';

const PART_ICONS: Record<VehiclePart, string> = {
  wheels: '🛞',
  pedals: '⚙️',
  handlebar: '🎯',
  bell: '🔔',
};

const MISSION_MAP: { id: string; part: VehiclePart; x: number; y: number }[] = [
  { id: 'mission-01-wheels', part: 'wheels', x: -200, y: -50 },
  { id: 'mission-02-pedals', part: 'pedals', x: -70, y: -120 },
  { id: 'mission-03-handlebar', part: 'handlebar', x: 70, y: -120 },
  { id: 'mission-04-bell', part: 'bell', x: 200, y: -50 },
];

export class WorkshopScene extends Phaser.Scene {
  private samuelCompanion?: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'WorkshopScene' });
  }

  create(): void {
    runSceneEnter(this, readSceneEnterStyle(this));
    bindSceneMusic(this, 'workshop');
    this.drawBackground();
    const { x, y, scale } = getGameCenter(this);
    const layout = getDetectiveLayoutMode(this);
    const s = scale * (layout.portrait ? 0.86 : 1);
    const progress = loadProgress();
    addComicText(this, x, y - (layout.portrait ? 248 : 220) * s, '🚲 Werkstatt', 32 * s);
    addComicText(this, x, y - (layout.portrait ? 212 : 186) * s, `Ziel: ${getBikeBuildProgressLabel()}`, 20 * s);

    const bikeY = y + (layout.portrait ? 100 : 80) * s;
    drawBike(this, x, bikeY, (layout.portrait ? 1.05 : 1.3) * s, {
      showFrame: true,
      showWheels: isPartUnlocked('wheels'),
      showPedals: isPartUnlocked('pedals'),
      showHandlebar: isPartUnlocked('handlebar'),
      showBell: isPartUnlocked('bell'),
    });

    this.samuelCompanion = drawSamuel(
      this,
      x - (layout.portrait ? 120 : 200) * s,
      bikeY + 20 * s,
      (layout.portrait ? 0.82 : 1) * s,
    );
    attachIdleBounce(this, this.samuelCompanion, 5 * s, 1200);

    const bikeReady = CORE_BIKE_MISSIONS.every((id) => progress.completedMissions.includes(id));

    if (bikeReady) {
      feedbackSounds.workshopCheer();
      reactCompanionCheer(this, this.samuelCompanion);
      playConfettiBurst(this, x, bikeY - 40 * s, s, { count: 12, emojis: ['⭐', '🚲', '✨', '🎉'] });
      addComicText(this, x, y + (layout.portrait ? 168 : 168) * s, '✅ Fertig!', 26 * s);
    }

    const missionLayout = layout.portrait
      ? MISSION_MAP.map((m, index) => ({ ...m, x: 0, y: -112 + index * 58 }))
      : MISSION_MAP;

    for (const mission of missionLayout) {
      this.createMissionNode(x, y, s, mission, progress, getNextMission() === mission.id);
    }

    const btnY = y + (layout.portrait ? 250 : 220) * s;
    createComicButton(this, x - (layout.portrait ? 115 : 200) * s, btnY, 'Zuhause', () => transitionToHub(this), 0x5b6ee1, layout.portrait ? 120 : 140);

    const next = getNextMission();
    if (bikeReady) {
      createComicButton(
        this,
        x + (layout.portrait ? 115 : 200) * s,
        btnY,
        '🏁 Fahrt',
        () => transitionToScene(this, 'RideScene'),
        COLORS.success,
        layout.portrait ? 120 : 150,
      );
    } else if (next) {
      const label = next === 'mission-01-wheels' ? '▶ Los!' : '▶ Weiter';
      createComicButton(this, x + (layout.portrait ? 115 : 200) * s, btnY, label, () => {
        feedbackSounds.tap();
        this.startMission(next);
      }, COLORS.bikeFrame, layout.portrait ? 120 : 150);
    }
  }

  private createMissionNode(
    cx: number,
    cy: number,
    scale: number,
    mission: (typeof MISSION_MAP)[0],
    progress: ReturnType<typeof loadProgress>,
    isNext: boolean,
  ): void {
    const mx = cx + mission.x * scale;
    const my = cy + mission.y * scale;
    const available = isMissionAvailable(mission.id);
    const completed = progress.completedMissions.includes(mission.id);
    const locked = !available;
    const radius = 46 * scale;

    const color = completed ? COLORS.success : locked ? 0xcccccc : COLORS.bikeFrame;
    const node = this.add.circle(mx, my, radius, color);
    node.setStrokeStyle(4, COLORS.outline);

    this.add
      .text(mx, my - 6 * scale, PART_ICONS[mission.part], { fontSize: `${28 * scale}px` })
      .setOrigin(0.5);

    if (!locked) {
      this.add
        .text(mx, my + 22 * scale, PART_LABELS[mission.part].split(' ')[0], {
          fontFamily: 'Fredoka, Comic Sans MS, cursive',
          fontSize: `${12 * scale}px`,
          color: '#ffffff',
          fontStyle: 'bold',
        })
        .setOrigin(0.5);
    }

    if (completed) {
      const stars = progress.stars[mission.id] ?? 1;
      for (let i = 0; i < stars; i++) {
        drawStar(this, mx - 20 * scale + i * 20 * scale, my - 52 * scale, 11 * scale);
      }
    }

    if (locked) {
      drawLockIcon(this, mx, my + 4 * scale, scale * 0.85);
    } else {
      const hit = this.add.circle(mx, my, radius + 14 * scale, 0xffffff, 0.001);
      hit.setInteractive({ useHandCursor: true });
      hit.on('pointerdown', () => {
        feedbackSounds.tap();
        reactCompanionCheer(this, this.samuelCompanion);
        this.startMission(mission.id);
      });
      if (isNext) {
        this.tweens.add({
          targets: [node, hit],
          scale: 1.06,
          duration: 600,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
        floatFeedback(this, mx, my - 64 * scale, 'Hier!', '#ff6b35', 16 * scale);
      }
    }
  }

  private startMission(missionId: string): void {
    if (!MISSIONS[missionId]) return;

    const keyMap: Record<string, string> = {
      'mission-01-wheels': 'Mission01Wheels',
      'mission-02-pedals': 'Mission02Pedals',
      'mission-03-handlebar': 'Mission03Handlebar',
      'mission-04-bell': 'Mission04Bell',
    };
    const target = keyMap[missionId];
    if (target) {
      transitionToScene(this, target, undefined, { label: 'Mission!', showOverlay: true });
    } else {
      transitionToScene(this, 'WorkshopScene', undefined, { showOverlay: false });
    }
  }

  private drawBackground(): void {
    drawWorkshopBackdrop(this);
  }
}