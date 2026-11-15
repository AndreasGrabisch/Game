import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './game/constants';
import { bindFullscreenOnFirstTap } from './game/display';
import { setupRotateHint } from './game/rotateHint';
import { BootScene } from './scenes/BootScene';
import { HubScene } from './scenes/HubScene';
import { MenuScene } from './scenes/MenuScene';
import { WorkshopScene } from './scenes/WorkshopScene';
import { DetectiveCabinetScene } from './scenes/DetectiveCabinetScene';
import { DetectiveHubScene } from './scenes/DetectiveHubScene';
import { DetectiveWallScene } from './scenes/DetectiveWallScene';
import { Mission01Wheels } from './scenes/missions/Mission01Wheels';
import { Mission02Pedals } from './scenes/missions/Mission02Pedals';
import { Mission03Handlebar } from './scenes/missions/Mission03Handlebar';
import { Mission04Bell } from './scenes/missions/Mission04Bell';
import { ComingSoonScene } from './scenes/ComingSoonScene';
import { TreasureChestScene } from './scenes/TreasureChestScene';
import { RideScene } from './scenes/RideScene';
import { ColorSortScene } from './scenes/ColorSortScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#87ceeb',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
  },
  scene: [
    BootScene,
    HubScene,
    MenuScene,
    WorkshopScene,
    DetectiveHubScene,
    DetectiveWallScene,
    DetectiveCabinetScene,
    Mission01Wheels,
    Mission02Pedals,
    Mission03Handlebar,
    Mission04Bell,
    ComingSoonScene,
    TreasureChestScene,
    RideScene,
    ColorSortScene,
  ],
  input: {
    activePointers: 2,
  },
  render: {
    antialias: true,
    pixelArt: false,
  },
};

bindFullscreenOnFirstTap();
setupRotateHint();

const game = new Phaser.Game(config);
(window as Window & { __samuelGame?: Phaser.Game }).__samuelGame = game;
