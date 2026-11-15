import Phaser from 'phaser';
import { startAppMusic, stopAppMusic, type MusicTheme } from './appMusic';

export function bindSceneMusic(scene: Phaser.Scene, theme: MusicTheme): void {
  void startAppMusic(theme);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => stopAppMusic());
}