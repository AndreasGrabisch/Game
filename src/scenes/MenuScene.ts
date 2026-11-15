import Phaser from 'phaser';
import { COLORS } from '../game/constants';
import { drawSamuel, drawBike, addComicText, createComicButton } from '../game/graphics';
import { getGameCenter } from './BootScene';
import { resetProgress } from '../game/Progress';
import { resetDetectiveProgress } from '../game/detectiveProgress';
import { drawPlaygroundSky } from '../game/appHomeGraphics';
import { getMuteButtonLabel, toggleGameAudio } from '../game/audioUi';
import { bindSceneMusic } from '../game/sceneMusic';
import { runSceneFadeIn, transitionToScene } from '../game/sceneTransition';
import { hideSpeech, showSpeechIf } from '../ui/speech';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => hideSpeech());
    runSceneFadeIn(this);
    bindSceneMusic(this, 'home');

    drawPlaygroundSky(this);
    const { x, y, scale } = getGameCenter(this);

    addComicText(this, x, y - 150 * scale, 'Neu starten?', 38 * scale);
    addComicText(this, x, y - 108 * scale, 'Fortschritt wird gelöscht', 18 * scale);

    const samuel = drawSamuel(this, x - 90 * scale, y + 20 * scale, 1.05 * scale);
    const bike = drawBike(this, x + 90 * scale, y + 40 * scale, 0.95 * scale, { showFrame: true, showWheels: false });
    this.tweens.add({
      targets: [samuel, bike],
      y: `+=${6 * scale}`,
      duration: 1100,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    const muteBtn = createComicButton(this, x - 150 * scale, y + 130 * scale, getMuteButtonLabel(), () => {
      toggleGameAudio();
      const label = muteBtn.list[1] as Phaser.GameObjects.Text;
      label.setText(getMuteButtonLabel());
    }, 0x6bcb77, 120);
    void muteBtn;
    createComicButton(this, x + 110 * scale, y + 130 * scale, 'Zurück', () => transitionToScene(this, 'HubScene'), 0x5b6ee1, 150);

    createComicButton(
      this,
      x,
      y + 200 * scale,
      'Alles löschen',
      () => {
        resetProgress();
        resetDetectiveProgress();
        void showSpeechIf(this, 'Alles ist wieder wie am ersten Tag.');
        transitionToScene(this, 'HubScene');
      },
      COLORS.error,
      200,
    );
  }
}