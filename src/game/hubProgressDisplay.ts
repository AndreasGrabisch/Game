import Phaser from 'phaser';
import { COLORS } from './constants';
import { drawComicPanel } from './graphics';
import { DETECTIVE_CASES } from '../data/detectiveCases';
import { loadDetectiveProgress } from './detectiveProgress';
import { loadProgress } from './Progress';
import { CORE_BIKE_MISSIONS, BIKE_MISSION_ORDER } from './kidDifficultyCurve';
import type { AppRewardSummary } from './appProgress';

export function drawHubProgressBoard(
  scene: Phaser.Scene,
  x: number,
  y: number,
  scale: number,
  portrait: boolean,
  summary: AppRewardSummary,
): Phaser.GameObjects.Container {
  const root = scene.add.container(x, y);
  const w = portrait ? Math.min(340 * scale, scene.scale.width - 24) : 600 * scale;
  const h = portrait ? 132 * scale : 108 * scale;
  const panel = drawComicPanel(scene, 0, 0, w, h);
  root.add(panel);

  const starText = scene.add.text(-w / 2 + 52 * scale, -h / 2 + 12 * scale, `⭐ ${summary.totalStars}`, {
    fontFamily: 'Fredoka, Comic Sans MS, cursive',
    fontSize: `${22 * scale}px`,
    color: '#1a1a2e',
    fontStyle: 'bold',
  });
  starText.setOrigin(0.5, 0);
  root.add(starText);

  const bike = loadProgress();
  const det = loadDetectiveProgress();
  const coreDone = CORE_BIKE_MISSIONS.filter((id) => bike.completedMissions.includes(id)).length;
  const bonusBell = bike.completedMissions.includes('mission-04-bell');

  const bikeRowY = -h / 2 + (portrait ? 52 : 44) * scale;
  drawMiniMissionTrail(scene, root, -w / 2 + 28 * scale, bikeRowY, scale, coreDone, CORE_BIKE_MISSIONS.length, bonusBell);

  const detRowY = bikeRowY + (portrait ? 38 : 32) * scale;
  const detDone = det.completedCases.length;
  drawDetectiveCaseTrail(scene, root, -w / 2 + 28 * scale, detRowY, scale, det);

  const nextBike = BIKE_MISSION_ORDER.find((id) => !bike.completedMissions.includes(id));
  const caption =
    nextBike && !bonusBell
      ? portrait
        ? `Nächstes: ${bike.completedMissions.length < 3 ? 'Werkstatt' : 'Klingel'}`
        : `Nächstes Abenteuer: ${bike.completedMissions.length < CORE_BIKE_MISSIONS.length ? 'Werkstatt-Mission' : 'Bonus-Klingel'} · Detektiv ${detDone}/${DETECTIVE_CASES.length}`
      : `Alle Kern-Teile da!${bonusBell ? ' 🔔' : ''} · Detektiv ${detDone}/${DETECTIVE_CASES.length}`;

  const cap = scene.add.text(0, h / 2 - (portrait ? 22 : 18) * scale, caption, {
    fontFamily: 'Fredoka, Comic Sans MS, cursive',
    fontSize: `${portrait ? 13 : 14}px`,
    color: '#1a1a2e',
    fontStyle: 'bold',
    align: 'center',
    wordWrap: { width: w - 24 },
  });
  cap.setOrigin(0.5, 1);
  root.add(cap);

  const dailyLine = summary.dailyDone
    ? `📋 Heute: ✅ ${summary.dailyEmoji}`
    : `📋 Heute: ${summary.dailyProgress} ${summary.dailyEmoji}`;
  const daily = scene.add.text(-w / 2 + 18 * scale, h / 2 - (portrait ? 6 : 4) * scale, dailyLine, {
    fontFamily: 'Fredoka, Comic Sans MS, cursive',
    fontSize: `${12}px`,
    color: summary.dailyDone ? '#1f5c38' : '#2d2d44',
    fontStyle: 'bold',
  });
  daily.setOrigin(0, 1);
  root.add(daily);

  root.setDepth(1);
  return root;
}

function drawMiniMissionTrail(
  scene: Phaser.Scene,
  root: Phaser.GameObjects.Container,
  startX: number,
  y: number,
  scale: number,
  done: number,
  total: number,
  bonus: boolean,
): void {
  const labelText = scene.add.text(startX, y, '🚲', { fontSize: `${18 * scale}px` }).setOrigin(0, 0.5);
  root.add(labelText);

  const step = 28 * scale;
  for (let i = 0; i < total; i++) {
    const filled = i < done;
    const dot = scene.add.circle(startX + 36 * scale + i * step, y, 10 * scale, filled ? COLORS.success : COLORS.white);
    dot.setStrokeStyle(3, COLORS.outline, filled ? 1 : 0.35);
    root.add(dot);
  }
  const bellX = startX + 36 * scale + total * step + 8 * scale;
  const bell = scene.add.text(bellX, y, bonus ? '🔔' : '🔕', { fontSize: `${16 * scale}px` }).setOrigin(0, 0.5);
  root.add(bell);
}

function drawDetectiveCaseTrail(
  scene: Phaser.Scene,
  root: Phaser.GameObjects.Container,
  startX: number,
  y: number,
  scale: number,
  det: ReturnType<typeof loadDetectiveProgress>,
): void {
  const labelText = scene.add.text(startX, y, '🔍', { fontSize: `${18 * scale}px` }).setOrigin(0, 0.5);
  root.add(labelText);

  const step = 34 * scale;
  DETECTIVE_CASES.forEach((c, i) => {
    const complete = det.completedCases.includes(c.id);
    const cx = startX + 36 * scale + i * step;
    const badge = scene.add.circle(cx, y, 13 * scale, complete ? 0x5b6ee1 : COLORS.white, complete ? 1 : 0.9);
    badge.setStrokeStyle(3, COLORS.outline, complete ? 1 : 0.4);
    root.add(badge);
    const emoji = scene.add.text(cx, y, c.emoji, { fontSize: `${14 * scale}px` }).setOrigin(0.5);
    emoji.setAlpha(complete ? 1 : 0.45);
    root.add(emoji);
  });
}