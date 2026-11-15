import Phaser from 'phaser';
import { COLORS } from '../game/constants';
import { addComicText, createComicButton } from '../game/graphics';
import { reactCompanionCheer, spawnSamuelCompanion } from '../game/characterCompanion';
import { feedbackSounds } from '../game/feedbackAudio';
import { drawComingSoonParkBackdrop } from '../game/sceneBackgrounds';
import { bindSceneMusic } from '../game/sceneMusic';
import { readSceneEnterStyle, runSceneEnter, transitionToHub } from '../game/sceneTransition';
import { getGameCenter } from './BootScene';
import { getDetectiveLayoutMode } from '../game/detectiveLayout';

export class ComingSoonScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ComingSoonScene' });
  }

  create(): void {
    runSceneEnter(this, readSceneEnterStyle(this));
    bindSceneMusic(this, 'home');
    drawComingSoonParkBackdrop(this);

    const { x, y, scale } = getGameCenter(this);
    const layout = getDetectiveLayoutMode(this);
    const s = scale * (layout.portrait ? 0.9 : 1);

    addComicText(this, x, y - (layout.portrait ? 120 : 100) * s, '⚽ Ballspiel', 36 * s);
    addComicText(this, x, y - (layout.portrait ? 72 : 58) * s, 'Bald da!', 42 * s);

    const ball = this.add.circle(x, y + 20 * s, 48 * s, COLORS.white);
    ball.setStrokeStyle(5, COLORS.outline);
    this.add.circle(x - 12 * s, y + 8 * s, 14 * s, 0x222222, 0.35);
    this.add.circle(x + 14 * s, y + 28 * s, 10 * s, 0x222222, 0.25);

    const samuel = spawnSamuelCompanion(this, x - (layout.portrait ? 140 : 220) * s, y + 80 * s, 0.85 * s);

    this.tweens.add({
      targets: ball,
      y: y + 8 * s,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.time.delayedCall(400, () => {
      feedbackSounds.workshopCheer();
      reactCompanionCheer(this, samuel);
    });

    addComicText(this, x, y + (layout.portrait ? 120 : 100) * s, 'Samuel freut sich schon mit!', 18 * s);

    createComicButton(this, x, y + (layout.portrait ? 200 : 180) * s, 'Zurück', () => transitionToHub(this), 0x5b6ee1, 150);
  }
}