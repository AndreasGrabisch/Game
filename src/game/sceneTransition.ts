import Phaser from 'phaser';
import { COLORS } from './constants';
import { drawSamuel } from './graphics';
import { playSamuelCheer, playSamuelWave, startSamuelIdle } from './samuelCharacter';
import { feedbackSounds } from './feedbackAudio';
import { duckAppMusic } from './appMusic';

export type TransitionStyle = 'fade' | 'slide';

export interface TransitionOptions {
  style?: TransitionStyle;
  label?: string;
  duckMusic?: boolean;
  showOverlay?: boolean;
}

export function runSceneFadeIn(scene: Phaser.Scene, durationMs = 280): void {
  scene.cameras.main.fadeIn(durationMs, 0, 0, 0);
}

export function runSceneEnter(scene: Phaser.Scene, style: TransitionStyle = 'fade', durationMs = 300): void {
  const cam = scene.cameras.main;
  if (style === 'slide') {
    cam.setZoom(1.045);
    cam.fadeIn(durationMs, 0, 0, 0);
    scene.tweens.add({
      targets: cam,
      zoom: 1,
      duration: durationMs + 40,
      ease: 'Cubic.easeOut',
    });
    return;
  }
  runSceneFadeIn(scene, durationMs);
}

export function transitionToHub(scene: Phaser.Scene): void {
  transitionToScene(scene, 'HubScene', undefined, { style: 'slide', duckMusic: true, label: 'Zurück!' });
}

export function runTransitionOverlay(
  scene: Phaser.Scene,
  label: string,
  onReady: () => void,
): void {
  const { width, height } = scene.scale;
  const cx = width / 2;
  const cy = height / 2;
  const depth = 2000;
  const scale = Math.min(width / 960, height / 540);

  const shade = scene.add.rectangle(cx, cy, width, height, COLORS.panel, 0.94).setDepth(depth);
  const samuel = drawSamuel(scene, cx - 70 * scale, cy + 10 * scale, 0.55 * scale);
  samuel.setDepth(depth + 1);
  startSamuelIdle(scene, samuel, 5 * scale, 900);
  playSamuelWave(scene, samuel);
  scene.time.delayedCall(900, () => playSamuelCheer(scene, samuel));

  const title = scene.add.text(cx, cy - 72 * scale, label, {
    fontFamily: 'Fredoka, Comic Sans MS, cursive',
    fontSize: `${22 * scale}px`,
    color: '#1a1a2e',
    fontStyle: 'bold',
  }).setOrigin(0.5);
  title.setDepth(depth + 2);

  const barW = 220 * scale;
  const barY = cy + 52 * scale;
  const track = scene.add.rectangle(cx, barY, barW, 14 * scale, 0xdddddd).setDepth(depth + 1);
  track.setStrokeStyle(2, COLORS.outline, 0.3);
  const fill = scene.add.rectangle(cx - barW / 2, barY, 6, 14 * scale, COLORS.bikeFrame).setOrigin(0, 0.5).setDepth(depth + 2);

  scene.tweens.add({
    targets: fill,
    width: barW,
    duration: 420,
    ease: 'Sine.easeInOut',
    onComplete: () => {
      shade.destroy();
      samuel.destroy();
      title.destroy();
      track.destroy();
      fill.destroy();
      onReady();
    },
  });
}

export function transitionToScene(
  scene: Phaser.Scene,
  key: string,
  data?: Record<string, unknown>,
  options: TransitionOptions = {},
): void {
  void feedbackSounds.unlock();
  feedbackSounds.tap();

  const style = options.style ?? (key === 'HubScene' ? 'slide' : 'fade');
  const duck = options.duckMusic ?? key === 'HubScene';
  const showOverlay = options.showOverlay ?? true;
  const label = options.label ?? (key === 'HubScene' ? 'Zurück zum Spielplatz!' : 'Los geht’s!');

  if (duck) duckAppMusic(0.22, 1400);

  const startTransition = () => {
    const cam = scene.cameras.main;
    const outMs = style === 'slide' ? 260 : 220;
    cam.fadeOut(outMs, 0, 0, 0);
    cam.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      scene.scene.start(key, { ...data, __enterStyle: style });
    });
  };

  if (showOverlay) {
    runTransitionOverlay(scene, label, startTransition);
  } else {
    startTransition();
  }
}

export function launchInitialHub(scene: Phaser.Scene): void {
  runTransitionOverlay(scene, 'Samuels Spielewelt', () => {
    const cam = scene.cameras.main;
    cam.fadeOut(280, 0, 0, 0);
    cam.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      scene.scene.start('HubScene', { __enterStyle: 'slide' });
    });
  });
}

export function readSceneEnterStyle(scene: Phaser.Scene): TransitionStyle {
  const data = scene.scene.settings.data as { __enterStyle?: TransitionStyle } | undefined;
  return data?.__enterStyle ?? 'fade';
}