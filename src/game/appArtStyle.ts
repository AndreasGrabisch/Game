import Phaser from 'phaser';
import { COLORS } from './constants';

export const ART = {
  cornerRadius: 14,
  outline: 4,
  shadowAlpha: 0.12,
} as const;

/** Soft drop shadow behind illustrated panels (one blurred rect). */
export function addPanelShadow(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  depth = 0,
): Phaser.GameObjects.Rectangle {
  return scene.add
    .rectangle(x + 5, y + 6, width, height, 0x000000, ART.shadowAlpha)
    .setDepth(depth);
}

/** Rounded comic panel with warm fill and thick outline. */
export function drawIllustratedPanel(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  fill: number = COLORS.panel,
  depth = 0,
): Phaser.GameObjects.Container {
  const root = scene.add.container(x, y).setDepth(depth);
  const shadow = scene.add.graphics();
  shadow.fillStyle(0x000000, ART.shadowAlpha);
  shadow.fillRoundedRect(-width / 2 + 4, -height / 2 + 5, width, height, ART.cornerRadius);
  const panel = scene.add.graphics();
  panel.fillStyle(fill, 1);
  panel.lineStyle(ART.outline, COLORS.outline);
  panel.fillRoundedRect(-width / 2, -height / 2, width, height, ART.cornerRadius);
  panel.strokeRoundedRect(-width / 2, -height / 2, width, height, ART.cornerRadius);
  panel.lineStyle(2, 0xffffff, 0.45);
  panel.strokeRoundedRect(-width / 2 + 6, -height / 2 + 6, width - 12, height - 12, 8);
  const shine = scene.add.graphics();
  shine.fillStyle(0xffffff, 0.22);
  shine.fillRoundedRect(-width / 2 + 8, -height / 2 + 8, width - 16, height * 0.22, 8);
  root.add([shadow, panel, shine]);
  return root;
}

/** Accent stripe for mode / scene headers. */
export function drawHeaderRibbon(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  color: number,
  depth = 1,
): Phaser.GameObjects.Container {
  const c = scene.add.container(x, y).setDepth(depth);
  const body = scene.add.graphics();
  body.fillStyle(color, 1);
  body.lineStyle(3, COLORS.outline);
  body.fillRoundedRect(-width / 2, -height / 2, width, height, 10);
  body.strokeRoundedRect(-width / 2, -height / 2, width, height, 10);
  const gloss = scene.add.rectangle(0, -height / 2 + 6, width - 12, 4, COLORS.white, 0.35);
  c.add([body, gloss]);
  return c;
}