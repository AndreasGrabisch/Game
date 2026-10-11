import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './game/constants';
import { BootScene } from './scenes/BootScene';
import { HubScene } from './scenes/HubScene';
import { MenuScene } from './scenes/MenuScene';
import { WorkshopScene } from './scenes/WorkshopScene';
import { DetectivePlaceholderScene } from './scenes/DetectivePlaceholderScene';
import { Mission01Wheels } from './scenes/missions/Mission01Wheels';
import { Mission02Pedals } from './scenes/missions/Mission02Pedals';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#87ceeb',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [
    BootScene,
    HubScene,
    MenuScene,
    WorkshopScene,
    DetectivePlaceholderScene,
    Mission01Wheels,
    Mission02Pedals,
  ],
  input: {
    activePointers: 2,
  },
  render: {
    antialias: true,
    pixelArt: false,
  },
};

new Phaser.Game(config);
