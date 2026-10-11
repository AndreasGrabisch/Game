import Phaser from 'phaser';
import { COLORS } from '../game/constants';
import { addComicText, createComicButton, drawComicPanel } from '../game/graphics';
import { getGameCenter } from './BootScene';
import {
  DECOY_ITEMS,
  DETECTIVE_GEAR,
  getItemById,
  shuffleArray,
  type DecoyId,
  type DetectiveGearId,
} from '../data/detectiveItems';
import { createDrawerParts, drawCabinetItem } from '../game/detectiveGraphics';
import {
  animateSamuel,
  createDetectiveSamuel,
  DETECTIVE_MARKER_GREEN,
  DETECTIVE_MARKER_GREY,
  DETECTIVE_PAPER,
  drawScribbleRect,
  type SamuelMood,
} from '../game/detectiveSamuel';
import { detectiveSounds } from '../game/detectiveAudio';

interface DrawerModel {
  uid: number;
  slot: number;
  itemId: string;
  isDetective: boolean;
  lockedOpen: boolean;
}

interface DrawerView {
  model: DrawerModel;
  root: Phaser.GameObjects.Container;
  front: Phaser.GameObjects.Container;
  itemHolder: Phaser.GameObjects.Container;
  hit: Phaser.GameObjects.Rectangle;
  openOffsetY: number;
  isOpen: boolean;
}

const GRID_COLS = 3;
const GRID_ROWS = 3;

export class DetectiveCabinetScene extends Phaser.Scene {
  private drawers: DrawerModel[] = [];
  private drawerViews: DrawerView[] = [];
  private collected = new Set<DetectiveGearId>();
  private backpackSlots: Phaser.GameObjects.Container[] = [];
  private inputLocked = false;
  private cabinetOrigin = { x: 0, y: 0 };
  private layoutScale = 1;
  private drawerW = 0;
  private drawerH = 0;
  private gap = 0;
  private hintText?: Phaser.GameObjects.Text;
  private samuel?: Phaser.GameObjects.Container;
  private samuelBase = { x: 0, y: 0 };

  constructor() {
    super({ key: 'DetectiveCabinetScene' });
  }

  preload(): void {
    this.load.image('detective-samuel', '/detective/samuel.jpg');
  }

  create(): void {
    this.drawers = [];
    this.drawerViews = [];
    this.collected = new Set();
    this.backpackSlots = [];
    this.inputLocked = false;
    this.hintText = undefined;

    this.drawBackground();
    const { x, y, scale } = getGameCenter(this);
    this.layoutScale = scale;

    addComicText(this, x + 40 * scale, y - 230 * scale, 'Samuels Detektiv-Schrank', 32 * scale);
    addComicText(this, x + 40 * scale, y - 195 * scale, 'Finde alle Detektiv-Sachen!', 18 * scale);

    this.drawerW = 108 * scale;
    this.drawerH = 88 * scale;
    this.gap = 10 * scale;
    this.cabinetOrigin = { x: x + 20 * scale, y: y - 30 * scale };

    this.samuelBase = { x: x - 340 * scale, y: y + 55 * scale };
    this.samuel = createDetectiveSamuel(this, this.samuelBase.x, this.samuelBase.y, scale);
    this.reactSamuel('idle');

    this.initDrawerModels();
    this.buildCabinetFrame();
    this.createDrawerViews();
    this.createBackpackPanel(x + 300 * scale, y - 20 * scale, scale);
    this.createFooterButtons(x, y + 220 * scale, scale);

    this.inputLocked = true;
    this.showIntro(x, y, scale);
  }

  private showIntro(x: number, y: number, scale: number): void {
    const overlay = this.add.container(0, 0).setDepth(60);
    const veil = this.add.rectangle(x, y, this.scale.width, this.scale.height, DETECTIVE_PAPER, 0.96);
    const panel = drawScribbleRect(this, x, y - 10 * scale, 620 * scale, 360 * scale, COLORS.white, DETECTIVE_MARKER_GREEN, 5);

    const introSamuel = createDetectiveSamuel(this, x - 200 * scale, y - 30 * scale, scale * 1.15);
    introSamuel.setDepth(61);

    const introLine = this.add
      .text(x + 70 * scale, y - 70 * scale, 'ICH SUCHE MEINE\nDETEKTIV SACHEN', {
        fontFamily: 'Fredoka, Comic Sans MS, cursive',
        fontSize: `${34 * scale}px`,
        color: '#1a1a2e',
        fontStyle: 'bold',
        align: 'center',
        lineSpacing: 8 * scale,
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setScale(0.92);

    const startBtn = createComicButton(this, x, y + 120 * scale, 'LOS!', async () => {
      await detectiveSounds.unlock();
      detectiveSounds.intro();
      this.tweens.add({
        targets: [overlay, introSamuel, introLine],
        alpha: 0,
        duration: 280,
        onComplete: () => {
          overlay.destroy(true);
          introSamuel.destroy(true);
          introLine.destroy();
          this.inputLocked = false;
        },
      });
    }, DETECTIVE_MARKER_GREEN);

    overlay.add([veil, panel, introLine, startBtn]);
    overlay.setAlpha(0);
    this.tweens.add({ targets: overlay, alpha: 1, duration: 350 });
    this.tweens.add({
      targets: introLine,
      alpha: 1,
      scale: 1,
      duration: 500,
      ease: 'Back.easeOut',
    });
  }

  private reactSamuel(mood: SamuelMood): void {
    if (!this.samuel) return;
    this.samuel.setPosition(this.samuelBase.x, this.samuelBase.y);
    this.samuel.setAngle(0);
    this.samuel.setScale(1);
    animateSamuel(this, this.samuel, mood, this.layoutScale);
  }

  private initDrawerModels(): void {
    const items = shuffleArray([
      ...DETECTIVE_GEAR.map((i) => i.id),
      ...DECOY_ITEMS.map((i) => i.id),
    ]);

    this.drawers = items.map((itemId, index) => {
      const item = getItemById(itemId)!;
      return {
        uid: index,
        slot: index,
        itemId,
        isDetective: item.isDetective,
        lockedOpen: false,
      };
    });
  }

  private buildCabinetFrame(): void {
    const { x, y } = this.cabinetOrigin;
    const totalW = GRID_COLS * this.drawerW + (GRID_COLS - 1) * this.gap + 28;
    const totalH = GRID_ROWS * this.drawerH + (GRID_ROWS - 1) * this.gap + 28;
    const frame = drawScribbleRect(this, x, y, totalW, totalH, 0xe8dcc8, DETECTIVE_MARKER_GREEN, 5);
    frame.setDepth(0);
  }

  private createDrawerViews(): void {
    for (const model of this.drawers) {
      const pos = this.slotToWorld(model.slot);
      const root = this.add.container(pos.x, pos.y);
      root.setDepth(1);

      const { cavity, front, openOffsetY } = createDrawerParts(this, this.drawerW, this.drawerH);
      const itemHolder = this.add.container(0, 0);
      const itemGraphic = drawCabinetItem(
        this,
        model.itemId as DetectiveGearId | DecoyId,
        0.55 * this.layoutScale,
      );
      itemHolder.add(itemGraphic);
      itemHolder.setVisible(false);
      itemHolder.setScale(0.2);
      cavity.add(itemHolder);

      root.add([cavity, front]);

      const hit = this.add.rectangle(0, 0, this.drawerW, this.drawerH, 0xffffff, 0.001);
      hit.setInteractive({ useHandCursor: true });
      hit.on('pointerdown', () => this.onDrawerTapped(model.uid));
      root.add(hit);

      const view: DrawerView = {
        model,
        root,
        front,
        itemHolder,
        hit,
        openOffsetY,
        isOpen: false,
      };
      this.drawerViews.push(view);

      if (model.lockedOpen) {
        this.snapDrawerOpen(view);
      }
    }
  }

  private onDrawerTapped(uid: number): void {
    if (this.inputLocked) return;
    const view = this.drawerViews.find((v) => v.model.uid === uid);
    if (!view || view.model.lockedOpen || view.isOpen) return;

    this.inputLocked = true;
    void detectiveSounds.unlock();
    this.reactSamuel('peek');
    this.animateDrawerOpen(view, () => {
      if (view.model.isDetective) {
        this.handleDetectiveFind(view);
      } else {
        this.handleDecoy(view);
      }
    });
  }

  private handleDetectiveFind(view: DrawerView): void {
    const gearId = view.model.itemId as DetectiveGearId;
    view.model.lockedOpen = true;
    this.collected.add(gearId);
    this.refreshBackpack();
    this.reactSamuel('happy');
    this.showSamuelSpeech('Super Fund!');
    detectiveSounds.found();

    this.tweens.add({
      targets: view.itemHolder,
      scale: 1.2,
      duration: 180,
      yoyo: true,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.inputLocked = false;
        if (this.collected.size >= DETECTIVE_GEAR.length) {
          this.showWin();
        }
      },
    });
  }

  private handleDecoy(view: DrawerView): void {
    const item = getItemById(view.model.itemId);
    this.reactSamuel('oops');
    detectiveSounds.decoy();
    if (item) {
      this.showSamuelSpeech(`Hmm… nur ${item.label}!`);
    }

    this.time.delayedCall(850, () => {
      this.animateDrawerClose(view, () => {
        this.playShuffleAnimation(() => {
          this.inputLocked = false;
        });
      });
    });
  }

  private animateDrawerOpen(view: DrawerView, onComplete: () => void): void {
    detectiveSounds.drawerOpen();
    view.isOpen = true;
    view.itemHolder.setVisible(true);
    view.itemHolder.setAlpha(0);
    view.itemHolder.setScale(0.25);
    view.front.y = 0;

    this.tweens.add({
      targets: view.front,
      y: view.openOffsetY,
      duration: 300,
      ease: 'Cubic.easeOut',
    });

    this.tweens.add({
      targets: view.itemHolder,
      alpha: 1,
      scale: 1,
      duration: 320,
      delay: 120,
      ease: 'Back.easeOut',
      onComplete,
    });
  }

  private animateDrawerClose(view: DrawerView, onComplete: () => void): void {
    detectiveSounds.drawerClose();
    this.tweens.add({
      targets: view.itemHolder,
      alpha: 0,
      scale: 0.2,
      duration: 200,
      ease: 'Quad.easeIn',
    });

    this.tweens.add({
      targets: view.front,
      y: 0,
      duration: 280,
      delay: 60,
      ease: 'Cubic.easeIn',
      onComplete: () => {
        view.isOpen = false;
        view.itemHolder.setVisible(false);
        onComplete();
      },
    });
  }

  private snapDrawerOpen(view: DrawerView): void {
    view.isOpen = true;
    view.front.y = view.openOffsetY;
    view.itemHolder.setVisible(true);
    view.itemHolder.setAlpha(1);
    view.itemHolder.setScale(1);
  }

  private playShuffleAnimation(onDone: () => void): void {
    const movable = this.drawers.filter((d) => !d.lockedOpen);
    if (movable.length === 0) {
      onDone();
      return;
    }

    const movableViews = movable.map((d) => this.drawerViews.find((v) => v.model.uid === d.uid)!);
    detectiveSounds.shuffle();
    const swirl = this.add.graphics().setDepth(15);
    swirl.lineStyle(3, DETECTIVE_MARKER_GREEN, 0.35);
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 * i) / 6;
      swirl.lineBetween(
        this.cabinetOrigin.x,
        this.cabinetOrigin.y,
        this.cabinetOrigin.x + Math.cos(angle) * 90 * this.layoutScale,
        this.cabinetOrigin.y + Math.sin(angle) * 70 * this.layoutScale,
      );
    }
    this.tweens.add({
      targets: swirl,
      alpha: 0,
      duration: 500,
      onComplete: () => swirl.destroy(),
    });

    let wiggleDone = movableViews.length;
    movableViews.forEach((view) => {
      this.tweens.add({
        targets: view.root,
        angle: Phaser.Math.Between(-8, 8),
        scaleX: 0.92,
        scaleY: 1.06,
        duration: 90,
        yoyo: true,
        repeat: 2,
        onComplete: () => {
          view.root.setAngle(0);
          view.root.setScale(1);
          wiggleDone -= 1;
          if (wiggleDone === 0) this.shuffleMovableDrawers(onDone);
        },
      });
    });
  }

  private shuffleMovableDrawers(onDone: () => void): void {
    const movable = this.drawers.filter((d) => !d.lockedOpen);
    const slots = shuffleArray(movable.map((d) => d.slot));
    movable.forEach((drawer, i) => {
      drawer.slot = slots[i];
    });

    let pending = movable.length;
    movable.forEach((drawer, index) => {
      const view = this.drawerViews.find((v) => v.model.uid === drawer.uid)!;
      const target = this.slotToWorld(drawer.slot);
      this.tweens.add({
        targets: view.root,
        x: target.x,
        y: target.y,
        angle: Phaser.Math.Between(-12, 12),
        duration: 520,
        delay: index * 45,
        ease: 'Back.easeInOut',
        onComplete: () => {
          view.root.setAngle(0);
          pending -= 1;
          if (pending === 0) onDone();
        },
      });
    });
  }

  private showSamuelSpeech(text: string): void {
    if (!this.samuel) return;
    this.hintText?.destroy();
    this.hintText = this.add
      .text(this.samuel.x + 95 * this.layoutScale, this.samuel.y - 95 * this.layoutScale, text, {
        fontFamily: 'Fredoka, Comic Sans MS, cursive',
        fontSize: `${16 * this.layoutScale}px`,
        color: '#1a1a2e',
        fontStyle: 'bold',
        backgroundColor: '#fff8e7',
        padding: { x: 10, y: 6 },
      })
      .setOrigin(0, 0.5)
      .setDepth(25);
    this.time.delayedCall(1200, () => {
      this.hintText?.destroy();
      this.hintText = undefined;
    });
  }

  private slotToWorld(slot: number): { x: number; y: number } {
    const col = slot % GRID_COLS;
    const row = Math.floor(slot / GRID_COLS);
    const gridW = GRID_COLS * this.drawerW + (GRID_COLS - 1) * this.gap;
    const gridH = GRID_ROWS * this.drawerH + (GRID_ROWS - 1) * this.gap;
    const startX = this.cabinetOrigin.x - gridW / 2 + this.drawerW / 2;
    const startY = this.cabinetOrigin.y - gridH / 2 + this.drawerH / 2;
    return {
      x: startX + col * (this.drawerW + this.gap),
      y: startY + row * (this.drawerH + this.gap),
    };
  }

  private createBackpackPanel(px: number, py: number, scale: number): void {
    const panel = drawScribbleRect(this, px, py, 210 * scale, 290 * scale, DETECTIVE_PAPER, DETECTIVE_MARKER_GREEN, 4);
    panel.setDepth(2);

    addComicText(this, px, py - 118 * scale, 'Rucksack', 22 * scale).setDepth(3);

    const slotSize = 44 * scale;
    const startY = py - 72 * scale;
    DETECTIVE_GEAR.forEach((gear, index) => {
      const slot = this.add.container(px, startY + index * (slotSize + 8 * scale));
      slot.setDepth(3);
      const bg = this.add.rectangle(0, 0, 175 * scale, slotSize, COLORS.white, 0.65);
      bg.setStrokeStyle(2, DETECTIVE_MARKER_GREEN, 0.5);
      const label = this.add
        .text(-74 * scale, 0, gear.label, {
          fontFamily: 'Fredoka, Comic Sans MS, cursive',
          fontSize: `${13 * scale}px`,
          color: '#1a1a2e',
        })
        .setOrigin(0, 0.5);
      const iconHolder = this.add.container(60 * scale, 0);
      slot.add([bg, label, iconHolder]);
      this.backpackSlots.push(iconHolder);
    });

    this.refreshBackpack();
  }

  private refreshBackpack(): void {
    DETECTIVE_GEAR.forEach((gear, index) => {
      const holder = this.backpackSlots[index];
      holder.removeAll(true);
      if (this.collected.has(gear.id)) {
        const icon = drawCabinetItem(this, gear.id, 0.4 * this.layoutScale);
        holder.add(icon);
        this.tweens.add({
          targets: icon,
          scale: 1.15,
          duration: 160,
          yoyo: true,
          ease: 'Back.easeOut',
        });
      } else {
        const placeholder = this.add
          .text(0, 0, '?', {
            fontFamily: 'Fredoka, Comic Sans MS, cursive',
            fontSize: `${22 * this.layoutScale}px`,
            color: '#9999aa',
          })
          .setOrigin(0.5);
        holder.add(placeholder);
      }
    });
  }

  private createFooterButtons(x: number, y: number, scale: number): void {
    createComicButton(this, x - 130 * scale, y, 'Noch einmal', () => this.scene.restart(), 0xff6b35);
    createComicButton(this, x + 130 * scale, y, 'Zum Menü', () => this.scene.start('HubScene'), 0x5b6ee1);
  }

  private showWin(): void {
    this.inputLocked = true;
    detectiveSounds.win();
    this.reactSamuel('happy');
    const { x, y, scale } = getGameCenter(this);
    const overlay = this.add.container(0, 0).setDepth(50);
    const dim = this.add.rectangle(x, y, this.scale.width, this.scale.height, 0x000000, 0.45);
    const panel = drawComicPanel(this, x, y - 20 * scale, 440 * scale, 230 * scale);
    const title = addComicText(this, x, y - 70 * scale, 'Alles gefunden!', 32 * scale);
    const sub = addComicText(this, x, y - 8 * scale, 'Samuel ist bereit\nfür den Fall!', 22 * scale);

    const againBtn = createComicButton(
      this,
      x - 110 * scale,
      y + 72 * scale,
      'Noch einmal',
      () => this.scene.restart(),
      0xff6b35,
    );
    const menuBtn = createComicButton(
      this,
      x + 110 * scale,
      y + 72 * scale,
      'Zum Menü',
      () => this.scene.start('HubScene'),
      0x5b6ee1,
    );

    overlay.add([dim, panel, title, sub, againBtn, menuBtn]);
  }

  private drawBackground(): void {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, DETECTIVE_PAPER);
    const desk = this.add.rectangle(width / 2, height * 0.9, width, height * 0.2, 0xe8dcc8);
    desk.setStrokeStyle(3, DETECTIVE_MARKER_GREEN, 0.35);

    for (let i = 0; i < 10; i++) {
      const dot = this.add.circle(Phaser.Math.Between(20, width - 20), Phaser.Math.Between(20, height - 20), 2, DETECTIVE_MARKER_GREY, 0.08);
      dot.setDepth(0);
    }
  }
}
