import type Phaser from 'phaser';
import { COLORS } from './constants';
import { addComicText, createComicButton, drawComicPanel, floatFeedback } from './graphics';
import { feedbackSounds } from './feedbackAudio';
import { celebrateMilestone, getMilestoneById, getPendingMilestones, type AppMilestone } from './appMilestones';

export async function runHubMilestoneCelebrations(scene: Phaser.Scene, cx: number, cy: number, scale: number): Promise<void> {
  const queue = getPendingMilestones();
  if (queue.length === 0) return;

  for (const milestone of queue) {
    await showMilestoneOverlay(scene, cx, cy, scale, milestone);
    celebrateMilestone(milestone.id);
  }
}

function showMilestoneOverlay(
  scene: Phaser.Scene,
  cx: number,
  cy: number,
  scale: number,
  milestone: AppMilestone,
): Promise<void> {
  const meta = getMilestoneById(milestone.id) ?? milestone;
  const w = 340 * scale;
  const h = 220 * scale;

  return new Promise((resolve) => {
    const depth = 50;
    const shade = scene.add.rectangle(cx, cy, scene.scale.width, scene.scale.height, 0x000000, 0.45);
    shade.setDepth(depth);
    shade.setInteractive();

    const panel = drawComicPanel(scene, cx, cy, w, h);
    panel.setDepth(depth + 1);

    const title = addComicText(scene, cx, cy - 72 * scale, 'Super!', 32 * scale);
    title.setDepth(depth + 2);

    const emoji = scene.add.text(cx, cy - 18 * scale, meta.emoji, { fontSize: `${64 * scale}px` }).setOrigin(0.5);
    emoji.setDepth(depth + 2);

    const label = addComicText(scene, cx, cy + 42 * scale, `${meta.title}`, 22 * scale);
    label.setDepth(depth + 2);

    feedbackSounds.workshopCheer();
    floatFeedback(scene, cx, cy - 110 * scale, meta.cheer, '#ff6b35', 18 * scale);

    scene.tweens.add({
      targets: emoji,
      scale: 1.15,
      duration: 400,
      yoyo: true,
      repeat: 2,
      ease: 'Sine.easeInOut',
    });

    const cleanup = () => {
      shade.destroy();
      panel.destroy();
      title.destroy();
      emoji.destroy();
      label.destroy();
      btn.destroy();
      resolve();
    };

    const btn = createComicButton(scene, cx, cy + 92 * scale, 'Juhu!', () => cleanup(), COLORS.success, 160);
    btn.setDepth(depth + 3);
  });
}