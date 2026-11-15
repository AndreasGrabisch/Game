import Phaser from 'phaser';
import { COLORS } from '../game/constants';
import { addComicText, createComicButton, drawStar, floatFeedback } from '../game/graphics';
import { feedbackSounds } from '../game/feedbackAudio';
import { starsForMistakes } from '../game/scoring';
import { getGameCenter } from './BootScene';
import { reactCompanionCheer, reactCompanionOops, spawnSamuelCompanion } from '../game/characterCompanion';
import { drawColorSortBackdrop } from '../game/sceneBackgrounds';
import { drawColorSortPiece, type ColorSortShapeKind } from '../game/objectGraphics';
import { getDetectiveLayoutMode } from '../game/detectiveLayout';
import { bindSceneMusic } from '../game/sceneMusic';
import { playConfettiBurst } from '../game/celebrationConfetti';
import { readSceneEnterStyle, runSceneEnter, transitionToHub } from '../game/sceneTransition';
import { hideSpeech, showSpeechIf } from '../ui/speech';

type ColorId = 'rot' | 'blau' | 'gelb' | 'gruen';

interface ColorDef {
  id: ColorId;
  label: string;
  tint: number;
  text: string;
}

interface SortItem {
  id: ColorId;
  container: Phaser.GameObjects.Container;
  homeX: number;
  homeY: number;
  placed: boolean;
}

interface Bucket {
  id: ColorId;
  x: number;
  y: number;
  countText: Phaser.GameObjects.Text;
  count: number;
}

const COLOR_DEFS: ColorDef[] = [
  { id: 'rot', label: 'Rot', tint: 0xe23d3d, text: '#ffffff' },
  { id: 'blau', label: 'Blau', tint: 0x3b6fe0, text: '#ffffff' },
  { id: 'gelb', label: 'Gelb', tint: 0xf5c518, text: '#1a1a2e' },
  { id: 'gruen', label: 'Grün', tint: 0x3cba5a, text: '#ffffff' },
];

const BEST_KEY = 'samuel-color-stars';

function loadBest(): number {
  try {
    const value = Number(localStorage.getItem(BEST_KEY));
    return Number.isFinite(value) ? value : 0;
  } catch {
    return 0;
  }
}

function saveBest(stars: number): number {
  const best = Math.max(loadBest(), stars);
  try {
    localStorage.setItem(BEST_KEY, String(best));
  } catch {
    // Rekord bleibt in dieser Runde sichtbar, auch wenn Speicher fehlt.
  }
  return best;
}

function colorDef(id: ColorId): ColorDef {
  return COLOR_DEFS.find((entry) => entry.id === id) ?? COLOR_DEFS[0];
}

export class ColorSortScene extends Phaser.Scene {
  private items: SortItem[] = [];
  private buckets: Bucket[] = [];
  private selected: SortItem | null = null;
  private placed = 0;
  private mistakes = 0;
  private hintShown = false;
  private finished = false;
  private layoutScale = 1;
  private total = 0;
  private counterText?: Phaser.GameObjects.Text;
  private samuelCompanion?: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'ColorSortScene' });
  }

  create(): void {
    this.items = [];
    this.buckets = [];
    this.selected = null;
    this.placed = 0;
    this.mistakes = 0;
    this.hintShown = false;
    this.finished = false;

    runSceneEnter(this, readSceneEnterStyle(this));
    bindSceneMusic(this, 'colors');
    this.drawBackground();
    const { x, y, scale } = getGameCenter(this);
    const layout = getDetectiveLayoutMode(this);
    this.layoutScale = scale * (layout.portrait ? 0.85 : 1);

    this.samuelCompanion = spawnSamuelCompanion(
      this,
      x - (layout.portrait ? 150 : 340) * this.layoutScale,
      y + (layout.portrait ? 210 : 120) * this.layoutScale,
      0.85 * this.layoutScale,
    );

    const titleY = layout.portrait ? y - 252 * this.layoutScale : y - 236 * scale;
    addComicText(this, x, titleY, '🎨 Farben', 32 * this.layoutScale);
    this.drawGoalIcons(x, titleY + 38 * this.layoutScale, this.layoutScale);
    const best = loadBest();
    if (best > 0) {
      addComicText(this, x, titleY + 70 * this.layoutScale, `⭐ Best: ${best}`, 16 * this.layoutScale);
    }
    this.counterText = addComicText(this, x, titleY + (best > 0 ? 94 : 72) * this.layoutScale, '0 / 4', 20 * this.layoutScale);

    const bucketY = y + (layout.portrait ? 188 : 168) * this.layoutScale;
    const itemsY = y + (layout.portrait ? -48 : -70) * this.layoutScale;
    this.createBuckets(x, bucketY, this.layoutScale, layout.portrait);
    this.createItems(x, itemsY, this.layoutScale, layout.portrait);
    this.total = this.items.length;
    this.counterText.setText(`0 / ${this.total}`);

    createComicButton(
      this,
      x + (layout.portrait ? 140 : 340) * this.layoutScale,
      titleY - 8 * this.layoutScale,
      '←',
      () => {
        hideSpeech();
        transitionToHub(this);
      },
      0x5b6ee1,
      layout.portrait ? 88 : 100,
    ).setDepth(12);

    this.input.once('pointerdown', () => {
      void feedbackSounds.unlock();
    });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.finished = true;
      hideSpeech();
    });

    void this.runIntro();
  }

  private async runIntro(): Promise<void> {
    await showSpeechIf(
      this,
      'Tippe eine Farbe, dann den passenden Eimer.',
    );
  }

  private drawBackground(): void {
    drawColorSortBackdrop(this);
  }

  private drawGoalIcons(cx: number, cy: number, scale: number): void {
    COLOR_DEFS.forEach((def, index) => {
      const dot = this.add.circle(cx - 54 * scale + index * 36 * scale, cy, 14 * scale, def.tint);
      dot.setStrokeStyle(3, COLORS.outline);
    });
  }

  private createBuckets(centerX: number, y: number, scale: number, portrait: boolean): void {
    COLOR_DEFS.forEach((def, index) => {
      const col = portrait ? index % 2 : index;
      const row = portrait ? Math.floor(index / 2) : 0;
      const x = portrait
        ? centerX + (col === 0 ? -78 : 78) * scale
        : centerX + (index - 1.5) * 168 * scale;
      const bucketY = y + (portrait ? row * 94 * scale : 0);
      const bucket = this.add.container(x, bucketY);
      bucket.setDepth(2);

      const body = this.add.rectangle(0, 12 * scale, (portrait ? 118 : 128) * scale, 72 * scale, def.tint);
      body.setStrokeStyle(3 * scale, COLORS.outline);
      const rim = this.add.rectangle(0, -28 * scale, 140 * scale, 16 * scale, def.tint);
      rim.setStrokeStyle(3 * scale, COLORS.outline);
      const icon = this.add.circle(-42 * scale, -8 * scale, 12 * scale, COLORS.white, 0.35);
      icon.setStrokeStyle(2 * scale, def.tint);
      const hit = this.add.rectangle(0, 4 * scale, 156 * scale, 118 * scale, 0xffffff, 0.001);
      hit.setInteractive({ useHandCursor: true });
      const label = this.add
        .text(0, 8 * scale, def.label, {
          fontFamily: 'Fredoka, Comic Sans MS, cursive',
          fontSize: `${22 * scale}px`,
          color: def.text,
          fontStyle: 'bold',
        })
        .setOrigin(0.5);
      const countText = this.add
        .text(0, 32 * scale, '0', {
          fontFamily: 'Fredoka, Comic Sans MS, cursive',
          fontSize: `${16 * scale}px`,
          color: def.text,
          fontStyle: 'bold',
        })
        .setOrigin(0.5);

      bucket.add([body, rim, icon, label, countText, hit]);
      hit.on('pointerdown', () => this.onBucketChosen(def.id));

      this.buckets.push({ id: def.id, x, y: bucketY, countText, count: 0 });
    });
  }

  private createItems(centerX: number, y: number, scale: number, portrait: boolean): void {
    const trayW = portrait ? 300 * scale : 420 * scale;
    const tray = this.add.rectangle(centerX, y + 24 * scale, trayW, (portrait ? 110 : 140) * scale, COLORS.panel, 0.92);
    tray.setStrokeStyle(3 * scale, COLORS.outline);

    const ids: ColorId[] = COLOR_DEFS.map((def) => def.id);
    Phaser.Utils.Array.Shuffle(ids);

    ids.forEach((id, index) => {
      const col = index % 4;
      const row = Math.floor(index / 4);
      const homeX = centerX + (col - 1.5) * (portrait ? 72 : 96) * scale;
      const homeY = y + row * (portrait ? 0 : 8) * scale;
      const container = this.add.container(homeX, homeY);
      container.setDepth(4);
      const hit = 88 * scale;
      container.setSize(hit, hit);
      const ring = this.add.circle(0, 0, 30 * scale);
      ring.setStrokeStyle(4 * scale, COLORS.star);
      ring.setFillStyle(COLORS.star, 0.18);
      ring.setVisible(false);
      const shape = this.makeShape(id, index, scale);
      container.add([ring, shape]);
      container.setData('ring', ring);
      container.setInteractive({
        hitArea: new Phaser.Geom.Rectangle(0, 0, hit, hit),
        hitAreaCallback: Phaser.Geom.Rectangle.Contains,
        draggable: true,
        useHandCursor: true,
      });
      this.input.setDraggable(container);

      const item: SortItem = { id, container, homeX, homeY, placed: false };
      this.items.push(item);

      container.on('pointerdown', () => this.selectItem(item));
      container.on('drag', (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
        if (item.placed || this.finished) return;
        container.x = dragX;
        container.y = dragY;
        container.setDepth(8);
      });
      container.on('dragend', () => {
        if (item.placed || this.finished) return;
        container.setDepth(4);
        const bucket = this.bucketAt(container.x, container.y);
        if (bucket) this.tryPlace(item, bucket.id);
        else this.returnHome(item);
      });
    });
  }

  private makeShape(id: ColorId, index: number, scale: number): Phaser.GameObjects.GameObject {
    const tint = colorDef(id).tint;
    const kind = (index % 4) as ColorSortShapeKind;
    return drawColorSortPiece(this, tint, kind, scale);
  }

  private selectItem(item: SortItem): void {
    if (item.placed || this.finished) return;
    if (this.selected && this.selected !== item) {
      this.selected.container.setScale(1);
      (this.selected.container.getData('ring') as Phaser.GameObjects.Arc).setVisible(false);
    }
    this.selected = item;
    item.container.setScale(1.08);
    (item.container.getData('ring') as Phaser.GameObjects.Arc).setVisible(true);
  }

  private onBucketChosen(id: ColorId): void {
    if (!this.selected || this.finished) return;
    this.tryPlace(this.selected, id);
  }

  private bucketAt(x: number, y: number): Bucket | undefined {
    const reach = 78 * this.layoutScale;
    return this.buckets.find((bucket) => Phaser.Math.Distance.Between(x, y, bucket.x, bucket.y) < reach);
  }

  private tryPlace(item: SortItem, bucketId: ColorId): void {
    if (item.placed || this.finished) return;
    if (item.id !== bucketId) {
      this.mistakes += 1;
      feedbackSounds.miss();
      reactCompanionOops(this, this.samuelCompanion);
      this.cameras.main.shake(70, 0.003);
      floatFeedback(
        this,
        item.container.x,
        item.container.y - 36 * this.layoutScale,
        `Das ist ${colorDef(item.id).label}!`,
        '#ff6b6b',
        18 * this.layoutScale,
      );
      this.returnHome(item);
      if (this.mistakes >= 2 && !this.hintShown) {
        this.hintShown = true;
        void showSpeechIf(this, 'Schau auf die Farbe und auf das Wort. Rot gehört in den roten Eimer.');
      }
      return;
    }

    const bucket = this.buckets.find((entry) => entry.id === bucketId);
    if (!bucket) return;
    this.placeItem(item, bucket);
  }

  private placeItem(item: SortItem, bucket: Bucket): void {
    item.placed = true;
    item.container.disableInteractive();
    if (this.selected === item) this.selected = null;
    (item.container.getData('ring') as Phaser.GameObjects.Arc).setVisible(false);
    item.container.setScale(1);
    feedbackSounds.colorPop();
    reactCompanionCheer(this, this.samuelCompanion);

    bucket.count += 1;
    bucket.countText.setText(String(bucket.count));
    this.placed += 1;
    this.counterText?.setText(`${this.placed} / ${this.total}`);

    this.tweens.add({
      targets: item.container,
      x: bucket.x,
      y: bucket.y,
      scale: 0.25,
      alpha: 0,
      duration: 260,
      onComplete: () => item.container.destroy(),
    });

    if (this.placed >= this.total) {
      this.finished = true;
      this.time.delayedCall(420, () => {
        if (this.sys.isActive()) void this.finish();
      });
    }
  }

  private returnHome(item: SortItem): void {
    item.container.setScale(this.selected === item ? 1.08 : 1);
    this.tweens.add({
      targets: item.container,
      x: item.homeX,
      y: item.homeY,
      duration: 240,
      ease: 'Back.easeOut',
    });
  }

  private async finish(): Promise<void> {
    if (!this.sys.isActive()) return;
    const earned = starsForMistakes(this.mistakes);
    const previous = loadBest();
    const best = saveBest(earned);
    feedbackSounds.success();

    const { x, y, scale } = getGameCenter(this);
    playConfettiBurst(this, x, y - 40 * scale, scale, { count: 14 });
    for (let i = 0; i < 3; i++) {
      const star = drawStar(this, x - 50 * scale + i * 50 * scale, y - 20 * scale, 18 * scale, i < earned);
      star.setDepth(20);
      star.setScale(0);
      this.tweens.add({
        targets: star,
        scale: 1,
        delay: i * 160,
        duration: 280,
        ease: 'Back.easeOut',
      });
    }

    const message =
      earned > previous
        ? 'Neuer Rekord! Du kennst die Farben.'
        : earned === 3
          ? 'Ohne Fehler! Du kennst die Farben.'
          : `Stark! Rekord: ${best} Sterne.`;

    const continued = await showSpeechIf(this, message);
    if (!continued) return;

    createComicButton(this, x - 110 * scale, y + 96 * scale, 'Nochmal', () => {
      this.scene.restart();
    }, 0x6bcb77, 160).setDepth(20);

    createComicButton(this, x + 120 * scale, y + 96 * scale, 'Alle Spiele', () => {
      transitionToHub(this);
    }, 0x5b6ee1, 180).setDepth(20);
  }
}
