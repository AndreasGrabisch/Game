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
import { drawCabinetItem, drawDrawerFront } from '../game/detectiveGraphics';

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

  constructor() {
    super({ key: 'DetectiveCabinetScene' });
  }

  create(): void {
    this.drawers = [];
    this.drawerViews = [];
    this.collected = new Set();
    this.backpackSlots = [];
    this.inputLocked = false;
    this.drawBackground();
    const { x, y, scale } = getGameCenter(this);
    this.layoutScale = scale;

    addComicText(this, x, y - 230 * scale, 'Detektiv-Schrank', 34 * scale);
    addComicText(this, x - 220 * scale, y - 195 * scale, 'Finde alle Detektiv-Sachen!', 18 * scale);

    this.drawerW = 108 * scale;
    this.drawerH = 88 * scale;
    this.gap = 10 * scale;
    this.cabinetOrigin = { x: x - 120 * scale, y: y - 30 * scale };

    this.initDrawerModels();
    this.buildCabinetFrame();
    this.createDrawerViews();
    this.createBackpackPanel(x + 250 * scale, y - 20 * scale, scale);
    this.createFooterButtons(x, y + 220 * scale, scale);
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
    const totalW = GRID_COLS * this.drawerW + (GRID_COLS - 1) * this.gap + 24;
    const totalH = GRID_ROWS * this.drawerH + (GRID_ROWS - 1) * this.gap + 24;
    const frame = this.add.rectangle(x, y, totalW, totalH, 0x5c3d2e);
    frame.setStrokeStyle(4, COLORS.outline);
    frame.setDepth(0);
  }

  private createDrawerViews(): void {
    for (const model of this.drawers) {
      const pos = this.slotToWorld(model.slot);
      const root = this.add.container(pos.x, pos.y);
      root.setDepth(1);

      const itemHolder = this.add.container(0, -6 * this.layoutScale);
      const itemGraphic = drawCabinetItem(
        this,
        model.itemId as DetectiveGearId | DecoyId,
        0.55 * this.layoutScale,
      );
      itemHolder.add(itemGraphic);
      itemHolder.setVisible(false);

      const front = drawDrawerFront(this, this.drawerW, this.drawerH, false);
      root.add([itemHolder, front]);

      const hit = this.add.rectangle(0, 0, this.drawerW, this.drawerH, 0xffffff, 0.001);
      hit.setInteractive({ useHandCursor: true });
      hit.on('pointerdown', () => this.onDrawerTapped(model.uid));
      root.add(hit);

      const view: DrawerView = { model, root, front, itemHolder, hit, isOpen: false };
      this.drawerViews.push(view);

      if (model.lockedOpen) {
        this.setDrawerOpen(view, true);
      }
    }
  }

  private onDrawerTapped(uid: number): void {
    if (this.inputLocked) return;
    const view = this.drawerViews.find((v) => v.model.uid === uid);
    if (!view || view.model.lockedOpen || view.isOpen) return;

    this.inputLocked = true;
    this.setDrawerOpen(view, true);

    if (view.model.isDetective) {
      this.handleDetectiveFind(view);
    } else {
      this.handleDecoy(view);
    }
  }

  private handleDetectiveFind(view: DrawerView): void {
    const gearId = view.model.itemId as DetectiveGearId;
    view.model.lockedOpen = true;
    this.collected.add(gearId);
    this.refreshBackpack();

    this.tweens.add({
      targets: view.itemHolder,
      scale: 1.15,
      duration: 200,
      yoyo: true,
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
    this.time.delayedCall(700, () => {
      this.setDrawerOpen(view, false);
      this.shuffleMovableDrawers(() => {
        if (item) {
          this.hintText?.destroy();
          this.hintText = addComicText(
            this,
            this.cabinetOrigin.x,
            this.cabinetOrigin.y - 100 * this.layoutScale,
            `Das ist nur\n${item.label}!`,
            20 * this.layoutScale,
          )
            .setDepth(20)
            .setAlpha(0.9);
          this.time.delayedCall(900, () => {
            this.hintText?.destroy();
            this.hintText = undefined;
          });
        }
        this.inputLocked = false;
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
    if (pending === 0) {
      onDone();
      return;
    }

    for (const drawer of movable) {
      const view = this.drawerViews.find((v) => v.model.uid === drawer.uid)!;
      const target = this.slotToWorld(drawer.slot);
      this.tweens.add({
        targets: view.root,
        x: target.x,
        y: target.y,
        duration: 450,
        ease: 'Back.easeOut',
        onComplete: () => {
          pending -= 1;
          if (pending === 0) onDone();
        },
      });
    }
  }

  private setDrawerOpen(view: DrawerView, open: boolean): void {
    view.isOpen = open;
    view.front.destroy();
    view.front = drawDrawerFront(this, this.drawerW, this.drawerH, open);
    view.root.addAt(view.front, 1);
    view.itemHolder.setVisible(open);
    view.root.bringToTop(view.hit);
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
    const panel = drawComicPanel(this, px, py, 200 * scale, 280 * scale);
    panel.setDepth(2);

    addComicText(this, px, py - 115 * scale, 'Rucksack', 22 * scale).setDepth(3);

    const slotSize = 44 * scale;
    const startY = py - 70 * scale;
    DETECTIVE_GEAR.forEach((gear, index) => {
      const slot = this.add.container(px, startY + index * (slotSize + 8 * scale));
      slot.setDepth(3);
      const bg = this.add.rectangle(0, 0, 170 * scale, slotSize, COLORS.white, 0.5);
      bg.setStrokeStyle(2, COLORS.outline, 0.4);
      const label = this.add
        .text(-72 * scale, 0, gear.label, {
          fontFamily: 'Fredoka, Comic Sans MS, cursive',
          fontSize: `${13 * scale}px`,
          color: '#1a1a2e',
        })
        .setOrigin(0, 0.5);
      const iconHolder = this.add.container(58 * scale, 0);
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
    const { x, y, scale } = getGameCenter(this);
    const overlay = this.add.container(0, 0).setDepth(50);
    const dim = this.add.rectangle(x, y, this.scale.width, this.scale.height, 0x000000, 0.45);
    const panel = drawComicPanel(this, x, y - 20 * scale, 420 * scale, 220 * scale);
    const title = addComicText(this, x, y - 70 * scale, 'Alles gefunden!', 32 * scale);
    const sub = addComicText(this, x, y - 10 * scale, 'Du bist bereit\nfür den Fall!', 22 * scale);

    const againBtn = createComicButton(
      this,
      x - 110 * scale,
      y + 70 * scale,
      'Noch einmal',
      () => this.scene.restart(),
      0xff6b35,
    );
    const menuBtn = createComicButton(
      this,
      x + 110 * scale,
      y + 70 * scale,
      'Zum Menü',
      () => this.scene.start('HubScene'),
      0x5b6ee1,
    );

    overlay.add([dim, panel, title, sub, againBtn, menuBtn]);
  }

  private drawBackground(): void {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x3d4a5c);
    this.add.rectangle(width / 2, height * 0.88, width, height * 0.24, 0x5c4a3a);
  }
}
