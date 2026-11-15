import Phaser from 'phaser';
import { COLORS } from './constants';
import type { DetectiveGearId, DecoyId } from '../data/detectiveItems';
import { DETECTIVE_MARKER_GREEN, DETECTIVE_MARKER_GREY, DETECTIVE_PAPER } from './detectiveSamuel';

export interface DrawerParts {
  cavity: Phaser.GameObjects.Container;
  front: Phaser.GameObjects.Container;
  openOffsetY: number;
}

export function createDrawerParts(scene: Phaser.Scene, width: number, height: number): DrawerParts {
  const cavity = scene.add.container(0, 0);
  const innerShade = scene.add.rectangle(0, 4, width - 8, height - 8, 0x2a2018, 0.25);
  const inner = scene.add.graphics();
  inner.fillStyle(DETECTIVE_PAPER, 1);
  inner.lineStyle(2, DETECTIVE_MARKER_GREEN, 0.6);
  inner.fillRoundedRect(-(width - 10) / 2, -(height - 10) / 2, width - 10, height - 10, 6);
  inner.strokeRoundedRect(-(width - 10) / 2, -(height - 10) / 2, width - 10, height - 10, 6);
  cavity.add([innerShade, inner]);

  const front = scene.add.container(0, 0);
  const shadow = scene.add.rectangle(3, 4, width, height, 0x000000, 0.12);
  const bodyGfx = scene.add.graphics();
  bodyGfx.fillStyle(0xdeb887, 1);
  bodyGfx.lineStyle(4, 0x6b4f2a);
  bodyGfx.fillRoundedRect(-width / 2, -height / 2, width, height, 8);
  bodyGfx.strokeRoundedRect(-width / 2, -height / 2, width, height, 8);
  const grain = scene.add.graphics();
  grain.lineStyle(1, 0x8b6914, 0.25);
  for (let y = -height / 2 + 8; y < height / 2 - 8; y += 10) {
    grain.lineBetween(-width / 2 + 6, y, width / 2 - 6, y + 2);
  }
  const plaque = scene.add.rectangle(0, -height * 0.18, width - 20, height * 0.22, DETECTIVE_MARKER_GREY, 0.22);
  plaque.setStrokeStyle(2, DETECTIVE_MARKER_GREEN, 0.35);
  const knob = scene.add.circle(0, height * 0.28, 10, 0xd4d4d4);
  knob.setStrokeStyle(3, COLORS.outline);
  const knobShine = scene.add.circle(-3, height * 0.28 - 3, 3, COLORS.white, 0.7);
  front.add([shadow, bodyGfx, grain, plaque, knob, knobShine]);

  return { cavity, front, openOffsetY: height * 0.42 };
}

export function drawCabinetItem(
  scene: Phaser.Scene,
  itemId: DetectiveGearId | DecoyId,
  scale: number,
): Phaser.GameObjects.Container {
  const c = scene.add.container(0, 0);
  const s = scale;

  switch (itemId) {
    case 'magnifier': {
      const lens = scene.add.circle(0, -8 * s, 18 * s, 0xa8d8ff, 0.6);
      lens.setStrokeStyle(3 * s, COLORS.outline);
      const handle = scene.add.rectangle(12 * s, 8 * s, 8 * s, 28 * s, 0x5c3d2e);
      handle.setStrokeStyle(2 * s, COLORS.outline);
      handle.setAngle(35);
      c.add([handle, lens]);
      break;
    }
    case 'tape': {
      const roll = scene.add.circle(0, 0, 16 * s, 0xffd93d);
      roll.setStrokeStyle(3 * s, COLORS.outline);
      const stripe = scene.add.rectangle(0, 0, 40 * s, 10 * s, 0xff6b6b, 0.9);
      stripe.setStrokeStyle(2 * s, COLORS.outline);
      stripe.setAngle(-25);
      c.add([roll, stripe]);
      break;
    }
    case 'flashlight': {
      const tube = scene.add.rectangle(0, 4 * s, 14 * s, 36 * s, 0x888899);
      tube.setStrokeStyle(2 * s, COLORS.outline);
      const bulb = scene.add.circle(0, -18 * s, 10 * s, COLORS.star);
      bulb.setStrokeStyle(2 * s, COLORS.outline);
      c.add([tube, bulb]);
      break;
    }
    case 'uvLamp': {
      const box = scene.add.rectangle(0, 0, 32 * s, 22 * s, 0x5b6ee1);
      box.setStrokeStyle(2 * s, COLORS.outline);
      const glow = scene.add.rectangle(0, -14 * s, 24 * s, 8 * s, 0xcc77ff, 0.8);
      glow.setStrokeStyle(2 * s, COLORS.outline);
      c.add([box, glow]);
      break;
    }
    case 'chalk': {
      const stick = scene.add.rectangle(-8 * s, 0, 10 * s, 28 * s, COLORS.white);
      stick.setStrokeStyle(2 * s, COLORS.outline);
      stick.setAngle(-15);
      const stick2 = scene.add.rectangle(8 * s, 2 * s, 10 * s, 28 * s, 0xffe4a8);
      stick2.setStrokeStyle(2 * s, COLORS.outline);
      stick2.setAngle(10);
      c.add([stick, stick2]);
      break;
    }
    case 'sock': {
      const sock = scene.add.ellipse(0, 0, 22 * s, 34 * s, 0xff6b9d);
      sock.setStrokeStyle(2 * s, COLORS.outline);
      c.add(sock);
      break;
    }
    case 'duck': {
      const body = scene.add.ellipse(0, 4 * s, 28 * s, 22 * s, COLORS.star);
      body.setStrokeStyle(2 * s, COLORS.outline);
      const head = scene.add.circle(-10 * s, -8 * s, 10 * s, COLORS.star);
      head.setStrokeStyle(2 * s, COLORS.outline);
      const beak = scene.add.triangle(-18 * s, -6 * s, 0, 0, 8 * s, 4 * s, 0, 8 * s, 0xff6b35);
      beak.setStrokeStyle(1 * s, COLORS.outline);
      c.add([body, head, beak]);
      break;
    }
    case 'banana': {
      const banana = scene.add.arc(0, 0, 20 * s, 200, 340, false, 0xffd93d);
      banana.setStrokeStyle(3 * s, COLORS.outline);
      c.add(banana);
      break;
    }
    case 'car': {
      const chassis = scene.add.rectangle(0, 4 * s, 36 * s, 14 * s, 0x4ecdc4);
      chassis.setStrokeStyle(2 * s, COLORS.outline);
      const roof = scene.add.rectangle(-4 * s, -6 * s, 20 * s, 12 * s, 0x4ecdc4);
      roof.setStrokeStyle(2 * s, COLORS.outline);
      const w1 = scene.add.circle(-12 * s, 12 * s, 6 * s, COLORS.wheel);
      const w2 = scene.add.circle(12 * s, 12 * s, 6 * s, COLORS.wheel);
      c.add([w1, w2, chassis, roof]);
      break;
    }
  }

  return c;
}
