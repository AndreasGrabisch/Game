import Phaser from 'phaser';
import { feedbackSounds } from './feedbackAudio';

export function runSceneFadeIn(scene: Phaser.Scene, durationMs = 280): void {
  scene.cameras.main.fadeIn(durationMs, 0, 0, 0);
}

export function transitionToScene(scene: Phaser.Scene, key: string, data?: Record<string, unknown>): void {
  void feedbackSounds.unlock();
  feedbackSounds.tap();
  const cam = scene.cameras.main;
  cam.fadeOut(220, 0, 0, 0);
  cam.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
    scene.scene.start(key, data);
  });
}