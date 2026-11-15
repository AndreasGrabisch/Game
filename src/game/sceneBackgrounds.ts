import Phaser from 'phaser';
import { COLORS } from './constants';
import {
  paintCloudRow,
  paintFlowers,
  paintGrassBand,
  paintHills,
  paintKite,
  paintSun,
  paintVerticalSky,
} from './comicScenery';

export function drawWorkshopBackdrop(scene: Phaser.Scene): void {
  const { width, height } = scene.scale;
  paintVerticalSky(scene, 0xfff6ea, 0xf3d7b4);
  const floorY = height * 0.74;

  const wall = scene.add.graphics().setDepth(0);
  wall.fillStyle(0xfaf0dc, 1);
  wall.fillRoundedRect(width * 0.05, height * 0.05, width * 0.9, height * 0.66, 18);
  wall.lineStyle(4, COLORS.outline, 0.18);
  wall.strokeRoundedRect(width * 0.05, height * 0.05, width * 0.9, height * 0.66, 18);

  const floor = scene.add.graphics().setDepth(0);
  floor.fillStyle(0xd7b48a, 1);
  floor.fillRect(0, floorY, width, height - floorY);
  floor.lineStyle(2, 0xb8926a, 0.6);
  for (let x = 0; x < width; x += 42) {
    floor.lineBetween(x, floorY, x, height);
  }
  floor.lineStyle(5, 0x8b6914, 0.9);
  floor.lineBetween(0, floorY, width, floorY);

  const peg = scene.add.graphics().setDepth(0);
  const px = width * 0.09;
  const py = height * 0.1;
  const pw = width * 0.36;
  const ph = height * 0.3;
  peg.fillStyle(0xe7d7c3, 1);
  peg.lineStyle(3, COLORS.outline, 0.35);
  peg.fillRoundedRect(px, py, pw, ph, 8);
  peg.strokeRoundedRect(px, py, pw, ph, 8);
  peg.fillStyle(0x6b5344, 0.4);
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 6; col++) {
      peg.fillCircle(px + 18 + col * (pw / 6.5), py + 16 + row * (ph / 4.5), 2.5);
    }
  }

  const tools = scene.add.graphics().setDepth(0);
  const hx = width * 0.15;
  const hy = height * 0.15;
  tools.fillStyle(0x8b6914, 1);
  tools.lineStyle(2.5, COLORS.outline);
  tools.fillRoundedRect(hx - 3, hy + 8, 7, 52, 2);
  tools.strokeRoundedRect(hx - 3, hy + 8, 7, 52, 2);
  tools.fillStyle(0x5c6770, 1);
  tools.fillRoundedRect(hx - 16, hy, 34, 14, 3);
  tools.strokeRoundedRect(hx - 16, hy, 34, 14, 3);
  tools.fillStyle(0xffffff, 0.25);
  tools.fillRoundedRect(hx - 12, hy + 3, 12, 4, 2);

  const wx = width * 0.24;
  tools.lineStyle(6, 0xc5ccd2);
  tools.lineBetween(wx, hy + 10, wx, hy + 50);
  tools.lineStyle(2.5, COLORS.outline);
  tools.strokeCircle(wx, hy + 8, 9);
  tools.fillStyle(0xe8eef2, 1);
  tools.fillCircle(wx, hy + 8, 7);

  const sx = width * 0.32;
  tools.fillStyle(0xff6b35, 1);
  tools.lineStyle(2.5, COLORS.outline);
  tools.fillRoundedRect(sx - 5, hy + 16, 10, 28, 3);
  tools.strokeRoundedRect(sx - 5, hy + 16, 10, 28, 3);
  tools.fillStyle(0xd0d4d8, 1);
  tools.fillTriangle(sx, hy, sx - 4, hy + 18, sx + 4, hy + 18);
  tools.strokeTriangle(sx, hy, sx - 4, hy + 18, sx + 4, hy + 18);

  const win = scene.add.graphics().setDepth(0);
  const wix = width * 0.56;
  const wiy = height * 0.1;
  const wiw = width * 0.32;
  const wih = height * 0.28;
  win.fillStyle(0x9ed8ff, 1);
  win.fillRoundedRect(wix, wiy, wiw, wih, 10);
  win.fillStyle(0xffd93d, 1);
  win.fillCircle(wix + wiw * 0.78, wiy + wih * 0.28, 14);
  win.fillStyle(0xffffff, 0.92);
  win.fillEllipse(wix + wiw * 0.32, wiy + wih * 0.42, wiw * 0.28, wih * 0.22);
  win.fillEllipse(wix + wiw * 0.48, wiy + wih * 0.38, wiw * 0.18, wih * 0.16);
  win.lineStyle(6, 0x8b6914);
  win.strokeRoundedRect(wix, wiy, wiw, wih, 10);
  win.lineStyle(3, 0x8b6914, 0.75);
  win.lineBetween(wix + wiw / 2, wiy, wix + wiw / 2, wiy + wih);
  win.lineBetween(wix, wiy + wih / 2, wix + wiw, wiy + wih / 2);
  win.fillStyle(0x8b6914, 1);
  win.fillRoundedRect(wix - 8, wiy + wih - 4, wiw + 16, 12, 3);

  const shelf = scene.add.graphics().setDepth(0);
  const shx = width * 0.58;
  const shy = height * 0.48;
  shelf.fillStyle(0x8b6914, 1);
  shelf.lineStyle(2, COLORS.outline, 0.45);
  shelf.fillRoundedRect(shx, shy, width * 0.3, 12, 3);
  shelf.strokeRoundedRect(shx, shy, width * 0.3, 12, 3);
  const jars = [0x6bcb77, 0xff6b6b, 0x5b6ee1];
  jars.forEach((color, i) => {
    const jx = shx + 18 + i * 52;
    shelf.fillStyle(0xe9f7ff, 0.95);
    shelf.lineStyle(2, COLORS.outline, 0.4);
    shelf.fillRoundedRect(jx, shy - 40, 30, 38, 5);
    shelf.strokeRoundedRect(jx, shy - 40, 30, 38, 5);
    shelf.fillStyle(color, 0.9);
    shelf.fillRoundedRect(jx + 4, shy - 22, 22, 16, 3);
    shelf.fillStyle(0xffffff, 0.45);
    shelf.fillEllipse(jx + 10, shy - 32, 10, 6);
  });

  const box = scene.add.graphics().setDepth(0);
  box.fillStyle(0xe23d3d, 1);
  box.lineStyle(3, COLORS.outline);
  box.fillRoundedRect(width * 0.1, floorY - 32, 78, 32, 5);
  box.strokeRoundedRect(width * 0.1, floorY - 32, 78, 32, 5);
  box.fillStyle(0xffd93d, 1);
  box.fillRoundedRect(width * 0.1 + 26, floorY - 40, 26, 12, 3);
  box.strokeRoundedRect(width * 0.1 + 26, floorY - 40, 26, 12, 3);
}

export function drawColorSortBackdrop(scene: Phaser.Scene): void {
  const { width, height } = scene.scale;
  paintVerticalSky(scene, 0xb8e7ff, 0xffe4f2);
  paintSun(scene, width * 0.12, height * 0.16, 28);
  paintCloudRow(scene, height * 0.12, 4);
  const rainbow = scene.add.graphics().setDepth(0);
  const bands = [0xff6b6b, 0xffd93d, 0x6bcb77, 0x5b6ee1];
  bands.forEach((color, index) => {
    rainbow.lineStyle(10, color, 0.28);
    rainbow.beginPath();
    rainbow.arc(width / 2, height * 0.02, 160 + index * 28, 0.15, Math.PI - 0.15, false);
    rainbow.strokePath();
  });
  paintGrassBand(scene, height * 0.78);
  paintFlowers(scene, height * 0.8);
  const mat = scene.add.graphics().setDepth(0);
  mat.fillStyle(COLORS.panel, 0.92);
  mat.lineStyle(3, COLORS.outline, 0.2);
  mat.fillEllipse(width / 2, height * 0.9, width * 0.72, 70);
  mat.strokeEllipse(width / 2, height * 0.9, width * 0.72, 70);
  mat.lineStyle(2, 0xe7d3a8, 0.8);
  mat.strokeEllipse(width / 2, height * 0.9, width * 0.6, 48);
}

export function drawRideBackdrop(scene: Phaser.Scene, groundY: number, scale: number): void {
  const { width, height } = scene.scale;
  paintVerticalSky(scene, COLORS.sky, 0xc9eaff);
  paintSun(scene, width * 0.86, height * 0.14, 34 * scale);
  paintCloudRow(scene, height * 0.12, 4);
  paintKite(scene, width * 0.18, height * 0.2, 0xff6b6b);
  paintHills(scene, groundY - 10 * scale);
  paintGrassBand(scene, groundY - 28 * scale);

  const road = scene.add.graphics().setDepth(0);
  road.fillStyle(0x5c6770, 1);
  road.fillRect(0, groundY - 8 * scale, width, 78 * scale);
  road.lineStyle(3, COLORS.outline, 0.8);
  road.strokeRect(0, groundY - 8 * scale, width, 78 * scale);
  road.lineStyle(4, 0xfff4c2, 0.9);
  const dash = 36 * scale;
  const gap = 28 * scale;
  for (let x = 0; x < width; x += dash + gap) {
    road.lineBetween(x, groundY + 28 * scale, x + dash, groundY + 28 * scale);
  }
}

export function drawMissionYardBackdrop(scene: Phaser.Scene): void {
  const { width, height } = scene.scale;
  paintVerticalSky(scene, 0xa8ddff, 0xfff6e5);
  paintSun(scene, width * 0.84, height * 0.12, 32);
  paintCloudRow(scene, 52, 4);
  paintKite(scene, width * 0.16, height * 0.2, 0x5b6ee1);
  paintHills(scene, height * 0.7);
  paintGrassBand(scene, height * 0.66);

  const fence = scene.add.graphics().setDepth(0);
  fence.lineStyle(4, 0x8b6914, 0.9);
  fence.lineBetween(16, height * 0.7, width - 16, height * 0.7);
  fence.lineBetween(16, height * 0.76, width - 16, height * 0.76);
  for (let x = 36; x < width; x += 52) {
    fence.fillStyle(0xc68642, 1);
    fence.fillRoundedRect(x - 4, height * 0.64, 8, height * 0.16, 2);
    fence.lineStyle(2, COLORS.outline, 0.45);
    fence.strokeRoundedRect(x - 4, height * 0.64, 8, height * 0.16, 2);
  }

  const path = scene.add.graphics().setDepth(0);
  path.fillStyle(0xe7d3b0, 0.9);
  path.fillEllipse(width / 2, height * 0.9, width * 0.46, 48);
  path.lineStyle(2, COLORS.outline, 0.15);
  path.strokeEllipse(width / 2, height * 0.9, width * 0.46, 48);
  path.fillStyle(0xd7c4a4, 0.95);
  for (let i = 0; i < 5; i++) {
    path.fillEllipse(width * 0.32 + i * width * 0.09, height * 0.9, 28, 14);
  }
  paintFlowers(scene, height * 0.84);
}

export function drawDetectiveHubBackdrop(scene: Phaser.Scene): void {
  const { width, height } = scene.scale;
  const wall = scene.add.graphics().setDepth(0);
  wall.fillStyle(0xf6efe4, 1);
  wall.fillRect(0, 0, width, height);
  wall.fillStyle(0xe7d8c4, 1);
  wall.fillRect(0, height * 0.82, width, height * 0.18);
  wall.fillStyle(0x8b6914, 1);
  wall.fillRect(0, height * 0.8, width, 8);

  const boardX = width * 0.08;
  const boardY = height * 0.06;
  const boardW = width * 0.62;
  const boardH = height * 0.42;
  wall.fillStyle(0xc68642, 1);
  wall.lineStyle(4, COLORS.outline, 0.35);
  wall.fillRoundedRect(boardX - 8, boardY - 8, boardW + 16, boardH + 16, 8);
  wall.strokeRoundedRect(boardX - 8, boardY - 8, boardW + 16, boardH + 16, 8);
  wall.fillStyle(0xd7a15a, 1);
  wall.fillRoundedRect(boardX, boardY, boardW, boardH, 4);
  wall.fillStyle(0x8b6914, 0.18);
  for (let i = 0; i < 18; i++) {
    const dx = boardX + 16 + ((i * 47) % (boardW - 24));
    const dy = boardY + 14 + ((i * 29) % (boardH - 20));
    wall.fillCircle(dx, dy, 1.6);
  }

  const papers = [
    { x: boardX + 24, y: boardY + 20, w: 70, h: 48, c: 0xfff8e7 },
    { x: boardX + boardW * 0.4, y: boardY + 36, w: 84, h: 56, c: 0xfff1f1 },
    { x: boardX + boardW * 0.62, y: boardY + 18, w: 64, h: 44, c: 0xf3ffe8 },
  ];
  papers.forEach((paper) => {
    wall.fillStyle(paper.c, 1);
    wall.lineStyle(2, COLORS.outline, 0.25);
    wall.fillRoundedRect(paper.x, paper.y, paper.w, paper.h, 3);
    wall.strokeRoundedRect(paper.x, paper.y, paper.w, paper.h, 3);
    wall.lineStyle(1.5, 0x8aa0c8, 0.45);
    wall.lineBetween(paper.x + 8, paper.y + 14, paper.x + paper.w - 8, paper.y + 14);
    wall.lineBetween(paper.x + 8, paper.y + 24, paper.x + paper.w - 14, paper.y + 24);
  });
  wall.lineStyle(2, 0xff6b6b, 0.7);
  wall.lineBetween(papers[0].x + 40, papers[0].y + 20, papers[1].x + 10, papers[1].y + 16);
  wall.lineBetween(papers[1].x + 70, papers[1].y + 24, papers[2].x + 8, papers[2].y + 20);

  for (let i = 0; i < 6; i++) {
    const pinX = boardX + 30 + i * (boardW / 6.5);
    wall.fillStyle(i % 2 === 0 ? 0xff6b6b : 0x5b6ee1, 1);
    wall.fillCircle(pinX, boardY + 12, 5);
    wall.lineStyle(1.5, COLORS.outline, 0.35);
    wall.strokeCircle(pinX, boardY + 12, 5);
  }

  const lampX = width * 0.86;
  const lampY = height * 0.12;
  wall.fillStyle(0xfff1c2, 0.45);
  wall.fillCircle(lampX, lampY + 20, 48);
  wall.fillStyle(0xffe08a, 1);
  wall.lineStyle(3, COLORS.outline, 0.4);
  wall.fillCircle(lampX, lampY, 18);
  wall.strokeCircle(lampX, lampY, 18);
  wall.lineStyle(4, 0x8b6914);
  wall.lineBetween(lampX, lampY - 18, lampX, lampY - 36);

  const plantX = width * 0.9;
  const plantY = height * 0.72;
  wall.fillStyle(0xc68642, 1);
  wall.fillRoundedRect(plantX - 16, plantY, 32, 28, 4);
  wall.lineStyle(2, COLORS.outline, 0.4);
  wall.strokeRoundedRect(plantX - 16, plantY, 32, 28, 4);
  wall.fillStyle(0x3cba5a, 1);
  wall.fillCircle(plantX, plantY - 10, 16);
  wall.fillCircle(plantX - 12, plantY - 2, 12);
  wall.fillCircle(plantX + 12, plantY - 4, 12);
  wall.strokeCircle(plantX, plantY - 10, 16);
}

export function drawDetectiveCabinetBackdrop(scene: Phaser.Scene): void {
  const { width, height } = scene.scale;
  const g = scene.add.graphics().setDepth(0);
  g.fillStyle(0xf4ecdf, 1);
  g.fillRect(0, 0, width, height);
  g.fillStyle(0xe7f0ea, 0.55);
  for (let y = 0; y < height; y += 28) {
    g.fillRect(0, y, width, 8);
  }
  g.fillStyle(0xd8c7ae, 1);
  g.fillRect(0, height * 0.86, width, height * 0.14);
  g.fillStyle(0xc9b89a, 0.85);
  g.fillEllipse(width / 2, height * 0.93, width * 0.7, 56);
  g.lineStyle(2, COLORS.outline, 0.15);
  g.strokeEllipse(width / 2, height * 0.93, width * 0.7, 56);
  g.lineStyle(3, 0xa88b6a, 0.45);
  g.strokeEllipse(width / 2, height * 0.93, width * 0.48, 32);

  g.lineStyle(8, 0x6b4f2a, 1);
  g.strokeRoundedRect(width * 0.08, height * 0.08, width * 0.84, height * 0.72, 18);
  g.lineStyle(3, 0xe0b97a, 0.7);
  g.strokeRoundedRect(width * 0.1, height * 0.1, width * 0.8, height * 0.68, 14);
}

export function drawTreasureChestBackdrop(scene: Phaser.Scene): void {
  const { width, height } = scene.scale;
  paintVerticalSky(scene, 0x8d7cf2, 0xffe0c4);
  const stars = scene.add.graphics().setDepth(0);
  for (let i = 0; i < 10; i++) {
    const sx = 36 + ((i * 97) % (width - 60));
    const sy = 28 + ((i * 53) % Math.floor(height * 0.45));
    stars.fillStyle(0xfff6c8, 0.75);
    stars.fillTriangle(sx, sy - 7, sx + 3, sy, sx, sy + 7);
    stars.fillTriangle(sx - 7, sy, sx, sy - 3, sx + 7, sy);
  }
  paintCloudRow(scene, height * 0.42, 3);

  const cx = width / 2;
  const cy = height * 0.9;
  const chest = scene.add.graphics().setDepth(0);
  chest.fillStyle(0x000000, 0.12);
  chest.fillEllipse(cx, cy + 28, 220, 24);
  chest.fillStyle(0xc68642, 1);
  chest.lineStyle(4, COLORS.outline);
  chest.fillRoundedRect(cx - 100, cy - 20, 200, 64, 8);
  chest.strokeRoundedRect(cx - 100, cy - 20, 200, 64, 8);
  chest.fillStyle(0xe0a85c, 1);
  chest.fillRoundedRect(cx - 108, cy - 52, 216, 40, 16);
  chest.strokeRoundedRect(cx - 108, cy - 52, 216, 40, 16);
  chest.fillStyle(0xf0d060, 1);
  chest.fillRoundedRect(cx - 10, cy - 52, 20, 96, 3);
  chest.fillCircle(cx, cy + 4, 8);
  chest.lineStyle(2, COLORS.outline);
  chest.strokeCircle(cx, cy + 4, 8);
  chest.fillStyle(0xffffff, 0.28);
  chest.fillEllipse(cx - 40, cy - 40, 36, 10);
}

export function drawComingSoonParkBackdrop(scene: Phaser.Scene): void {
  const { width, height } = scene.scale;
  paintVerticalSky(scene, 0x9ed8ff, 0xd7f5ff);
  paintSun(scene, width * 0.14, height * 0.16, 30);
  paintCloudRow(scene, height * 0.14, 4);
  paintHills(scene, height * 0.62);
  paintGrassBand(scene, height * 0.58);
  paintFlowers(scene, height * 0.78);

  const goal = scene.add.graphics().setDepth(0);
  const gx = width * 0.78;
  const gy = height * 0.5;
  goal.lineStyle(5, COLORS.white, 1);
  goal.strokeRect(gx, gy, 92, 58);
  goal.lineStyle(1.5, COLORS.white, 0.65);
  for (let i = 1; i < 4; i++) {
    goal.lineBetween(gx + i * 23, gy, gx + i * 23, gy + 58);
    goal.lineBetween(gx, gy + i * 14, gx + 92, gy + i * 14);
  }
  goal.lineStyle(4, COLORS.outline, 0.35);
  goal.strokeRect(gx, gy, 92, 58);

  const flag = scene.add.graphics().setDepth(0);
  flag.fillStyle(0xdddddd, 1);
  flag.fillRect(width * 0.2, height * 0.58, 4, 36);
  flag.fillStyle(0xff6b35, 1);
  flag.fillTriangle(width * 0.2 + 4, height * 0.58, width * 0.2 + 22, height * 0.58 + 8, width * 0.2 + 4, height * 0.58 + 16);
}

export function drawDetectiveWallBackdrop(scene: Phaser.Scene): void {
  drawDetectiveHubBackdrop(scene);
}

export function drawLockIcon(scene: Phaser.Scene, x: number, y: number, scale: number): Phaser.GameObjects.Container {
  const root = scene.add.container(x, y);
  const body = scene.add.rectangle(0, 6 * scale, 22 * scale, 18 * scale, 0xb7bcc8);
  body.setStrokeStyle(2, COLORS.outline);
  const shine = scene.add.rectangle(-4 * scale, 2 * scale, 6 * scale, 4 * scale, COLORS.white, 0.55);
  const shackle = scene.add.arc(0, -6 * scale, 10 * scale, 180, 360, false, undefined, 0);
  shackle.setStrokeStyle(3, COLORS.outline);
  root.add([body, shine, shackle]);
  return root;
}
