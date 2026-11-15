import Phaser from 'phaser';
import { COLORS } from '../game/constants';
import { addComicText, createComicButton, drawComicPanel, drawStar, floatFeedback } from '../game/graphics';
import { hideSpeech, showSpeechIf } from '../ui/speech';
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
import { publicAssetUrl } from '../game/assetPath';
import { tryEnableGameDisplay } from '../game/display';
import { DETECTIVE_TIMING } from '../game/detectiveTiming';

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
  private progressText?: Phaser.GameObjects.Text;
  private decoyCount = 0;
  private hintShown = false;
  private hintPulseTween?: Phaser.Tweens.Tween;
  private hintButton?: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'DetectiveCabinetScene' });
  }

  preload(): void {
    this.load.image('detective-samuel', publicAssetUrl('detective/samuel.png'));
  }

  create(): void {
    this.drawers = [];
    this.drawerViews = [];
    this.collected = new Set();
    this.backpackSlots = [];
    this.inputLocked = false;
    this.hintText = undefined;
    this.progressText = undefined;
    this.decoyCount = 0;
    this.hintShown = false;
    this.hintPulseTween = undefined;
    this.hintButton = undefined;

    this.drawBackground();
    const { x, y, scale } = getGameCenter(this);
    this.layoutScale = scale;

    addComicText(this, x + 40 * scale, y - 230 * scale, '🔍 Detektiv-Schrank', 30 * scale);
    this.progressText = addComicText(this, x + 40 * scale, y - 195 * scale, '⭐ 0 von 5', 24 * scale);

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
    this.hintButton = createComicButton(
      this,
      x + 300 * scale,
      y - 200 * scale,
      '💡 Hilfe',
      () => this.giveHint(),
      DETECTIVE_MARKER_GREEN,
      160,
    );
    this.hintButton.setDepth(12);
    this.hintButton.setAlpha(0.35);
    this.hintButton.setVisible(false);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      hideSpeech();
      this.hintPulseTween?.stop();
    });

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
      .text(x + 70 * scale, y - 70 * scale, '🔍\nFinde 5 Sachen!', {
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
      await tryEnableGameDisplay();
      await detectiveSounds.unlock();
      detectiveSounds.intro();
      this.tweens.add({
        targets: [overlay, introSamuel, introLine],
        alpha: 0,
        duration: DETECTIVE_TIMING.introFadeOut,
        onComplete: () => {
          overlay.destroy(true);
          introSamuel.destroy(true);
          introLine.destroy();
          this.inputLocked = false;
          void showSpeechIf(
            this,
            'Tippe eine Schublade an! Suche die fünf Detektiv-Sachen mit Lupe, Lampe und Kreide.',
          );
        },
      });
    }, DETECTIVE_MARKER_GREEN);

    overlay.add([veil, panel, introLine, startBtn]);
    overlay.setAlpha(0);
    this.tweens.add({ targets: overlay, alpha: 1, duration: DETECTIVE_TIMING.introFadeIn });
    this.tweens.add({
      targets: introLine,
      alpha: 1,
      scale: 1,
      duration: DETECTIVE_TIMING.introTextIn,
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
        this.showDetectiveReveal(view.model.itemId as DetectiveGearId, () => this.handleDetectiveFind(view));
      } else {
        this.quickDecoyFeedback(view);
      }
    });
  }

  private showDetectiveReveal(itemId: DetectiveGearId, onContinue: () => void): void {
    const { x, y, scale } = getGameCenter(this);
    const item = getItemById(itemId);
    const overlay = this.add.container(0, 0).setDepth(45);

    const dim = this.add.rectangle(x, y, this.scale.width, this.scale.height, 0x000000, 0.55);
    const panel = drawScribbleRect(
      this,
      x,
      y - 10 * scale,
      460 * scale,
      320 * scale,
      COLORS.white,
      DETECTIVE_MARKER_GREEN,
      5,
    );

    const headline = this.add
      .text(x, y - 120 * scale, `${item?.emoji ?? '⭐'} Super!`, {
        fontFamily: 'Fredoka, Comic Sans MS, cursive',
        fontSize: `${36 * scale}px`,
        color: '#1a1a2e',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    const label = this.add
      .text(x, y - 72 * scale, item?.kidLabel ?? '', {
        fontFamily: 'Fredoka, Comic Sans MS, cursive',
        fontSize: `${28 * scale}px`,
        color: '#3d7a54',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    const itemWrap = this.add.container(x, y + 20 * scale);
    itemWrap.add(drawCabinetItem(this, itemId, 1.55 * scale));
    itemWrap.setScale(0.25);

    const star = drawStar(this, x + 120 * scale, y - 115 * scale, 22 * scale, true);
    star.setDepth(46);

    const weiterBtn = createComicButton(
      this,
      x,
      y + 115 * scale,
      '👍 Weiter',
      () => {
        overlay.destroy(true);
        star.destroy();
        onContinue();
      },
      DETECTIVE_MARKER_GREEN,
      220,
    );

    overlay.add([dim, panel, headline, label, itemWrap, weiterBtn]);
    this.tweens.add({
      targets: itemWrap,
      scale: 1,
      duration: DETECTIVE_TIMING.itemRevealPop,
      ease: 'Back.easeOut',
    });
  }

  private quickDecoyFeedback(view: DrawerView): void {
    const item = getItemById(view.model.itemId);
    this.decoyCount += 1;
    if (this.decoyCount >= 2 && !this.hintShown && this.hintButton) {
      this.hintButton.setVisible(true);
      this.hintButton.setAlpha(1);
      void showSpeechIf(
        this,
        'Das war keine Detektiv-Sache. Tippe auf Hilfe, wenn du nicht weiterkommst!',
      );
    }
    const pos = this.slotToWorld(view.model.slot);
    floatFeedback(
      this,
      pos.x,
      pos.y - 40 * this.layoutScale,
      `${item?.emoji ?? '🙂'} Nicht das!`,
      '#666688',
      22 * this.layoutScale,
    );
    this.time.delayedCall(320, () => {
      this.handleDecoy(view);
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
      duration: DETECTIVE_TIMING.findPulse,
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
      this.showSamuelSpeech(`${item.emoji} Nur ${item.kidLabel}!`);
    }

    this.animateDrawerClose(view, () => {
      this.playShuffleAnimation(() => {
        this.inputLocked = false;
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
      duration: DETECTIVE_TIMING.drawerOpenFront,
      ease: 'Cubic.easeOut',
    });

    this.tweens.add({
      targets: view.itemHolder,
      alpha: 1,
      scale: 1,
      duration: DETECTIVE_TIMING.drawerOpenItem,
      delay: DETECTIVE_TIMING.drawerOpenItemDelay,
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
      duration: DETECTIVE_TIMING.drawerCloseItem,
      ease: 'Quad.easeIn',
    });

    this.tweens.add({
      targets: view.front,
      y: 0,
      duration: DETECTIVE_TIMING.drawerCloseFront,
      delay: DETECTIVE_TIMING.drawerCloseFrontDelay,
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
      duration: DETECTIVE_TIMING.shuffleSwirlFade,
      onComplete: () => swirl.destroy(),
    });

    let wiggleDone = movableViews.length;
    movableViews.forEach((view) => {
      this.tweens.add({
        targets: view.root,
        angle: Phaser.Math.Between(-6, 6),
        scaleX: 0.94,
        scaleY: 1.04,
        duration: DETECTIVE_TIMING.shuffleWiggleMs,
        yoyo: true,
        repeat: DETECTIVE_TIMING.shuffleWiggleRepeats,
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
    const visualSlot = new Map<number, number>();
    const targetSlot = new Map<number, number>();
    const shuffledSlots = shuffleArray(movable.map((d) => d.slot));

    movable.forEach((drawer, index) => {
      visualSlot.set(drawer.uid, drawer.slot);
      targetSlot.set(drawer.uid, shuffledSlots[index]);
    });

    const inFlight = new Set<number>();

    const getOccupant = (slot: number, excludeUid: number): DrawerModel | undefined =>
      movable.find(
        (d) =>
          d.uid !== excludeUid &&
          !inFlight.has(d.uid) &&
          visualSlot.get(d.uid) === slot,
      );

    const viewFor = (uid: number): DrawerView =>
      this.drawerViews.find((v) => v.model.uid === uid)!;

    const tweenDrawerToSlot = (
      uid: number,
      slot: number,
      duration: number,
      onComplete: () => void,
    ): void => {
      const view = viewFor(uid);
      const pos = this.slotToWorld(slot);
      inFlight.add(uid);
      this.tweens.add({
        targets: view.root,
        x: pos.x,
        y: pos.y,
        scale: 1,
        duration,
        ease: 'Sine.easeInOut',
        onComplete: () => {
          view.root.setAngle(0);
          inFlight.delete(uid);
          visualSlot.set(uid, slot);
          onComplete();
        },
      });
    };

    const flyDuration = DETECTIVE_TIMING.shuffleMoveEachMs;
    const vacateLead = DETECTIVE_TIMING.shuffleVacateLeadMs;
    const chainStepMs = flyDuration - vacateLead;
    const flightsStarted = new Set<number>();

    const startFlight = (uid: number, slot: number, duration: number): void => {
      if (flightsStarted.has(uid)) return;
      flightsStarted.add(uid);
      tweenDrawerToSlot(uid, slot, duration, () => {
        /* visualSlot wird im Tween gesetzt */
      });
    };

    const launchChainedFlight = (uid: number): void => {
      const destination = targetSlot.get(uid)!;
      const current = visualSlot.get(uid);
      if (current === destination && !inFlight.has(uid)) {
        flightsStarted.add(uid);
        return;
      }

      const occupant = getOccupant(destination, uid);
      startFlight(uid, destination, flyDuration);

      if (!occupant) return;

      const occUid = occupant.uid;
      const occDestination = targetSlot.get(occUid)!;
      this.time.delayedCall(Math.max(0, flyDuration - vacateLead), () => {
        visualSlot.delete(occUid);
        startFlight(occUid, occDestination, vacateLead);
      });
    };

    const flightOrder = [...movable].sort((a, b) => a.uid - b.uid);
    flightOrder.forEach((drawer, index) => {
      this.time.delayedCall(index * chainStepMs, () => {
        launchChainedFlight(drawer.uid);
      });
    });

    const totalMs = (flightOrder.length - 1) * chainStepMs + flyDuration;
    this.time.delayedCall(totalMs, () => {
      movable.forEach((drawer) => {
        drawer.slot = targetSlot.get(drawer.uid)!;
      });
      onDone();
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
    this.time.delayedCall(DETECTIVE_TIMING.speechVisibleMs, () => {
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
    const panel = drawScribbleRect(this, px, py, 180 * scale, 290 * scale, DETECTIVE_PAPER, DETECTIVE_MARKER_GREEN, 4);
    panel.setDepth(2);

    addComicText(this, px, py - 118 * scale, '🎒', 28 * scale).setDepth(3);

    const slotSize = 48 * scale;
    const startY = py - 72 * scale;
    DETECTIVE_GEAR.forEach((_gear, index) => {
      const slot = this.add.container(px, startY + index * (slotSize + 8 * scale));
      slot.setDepth(3);
      const bg = this.add.rectangle(0, 0, slotSize + 8 * scale, slotSize, COLORS.white, 0.65);
      bg.setStrokeStyle(2, DETECTIVE_MARKER_GREEN, 0.5);
      const iconHolder = this.add.container(0, 0);
      slot.add([bg, iconHolder]);
      this.backpackSlots.push(iconHolder);
    });

    this.refreshBackpack();
  }

  private refreshBackpack(): void {
    DETECTIVE_GEAR.forEach((gear, index) => {
      const holder = this.backpackSlots[index];
      holder.removeAll(true);
      if (this.collected.has(gear.id)) {
        const icon = drawCabinetItem(this, gear.id, 0.42 * this.layoutScale);
        holder.add(icon);
        this.tweens.add({
          targets: icon,
          scale: 1.15,
          duration: DETECTIVE_TIMING.backpackPop,
          yoyo: true,
          ease: 'Back.easeOut',
        });
      } else {
        const ghost = this.add
          .text(0, 0, gear.emoji, {
            fontFamily: 'Fredoka, Comic Sans MS, cursive',
            fontSize: `${24 * this.layoutScale}px`,
            color: '#bbbbcc',
          })
          .setOrigin(0.5)
          .setAlpha(0.45);
        holder.add(ghost);
      }
    });
    this.progressText?.setText(`⭐ ${this.collected.size} von ${DETECTIVE_GEAR.length}`);
  }

  private giveHint(): void {
    if (this.inputLocked || this.hintShown) return;
    const candidates = this.drawers.filter((d) => d.isDetective && !d.lockedOpen);
    if (candidates.length === 0) return;

    this.hintShown = true;
    const pick = candidates[Phaser.Math.Between(0, candidates.length - 1)];
    const view = this.drawerViews.find((v) => v.model.uid === pick.uid);
    if (!view) return;

    this.hintPulseTween?.stop();
    this.hintPulseTween = this.tweens.add({
      targets: view.front,
      scaleX: 1.08,
      scaleY: 1.08,
      duration: 280,
      yoyo: true,
      repeat: 5,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        view.front.setScale(1);
      },
    });

    const gear = getItemById(pick.itemId);
    void showSpeechIf(this, `Hier glitzert etwas! ${gear?.emoji ?? '🔍'} Vielleicht ist deine ${gear?.kidLabel ?? 'Sache'} hier.`);
  }

  private createFooterButtons(x: number, y: number, scale: number): void {
    createComicButton(this, x - 130 * scale, y, 'Noch einmal', () => this.scene.restart(), 0xff6b35);
    createComicButton(this, x + 130 * scale, y, 'Zum Menü', () => this.scene.start('HubScene'), 0x5b6ee1);
  }

  private showWin(): void {
    this.inputLocked = true;
    detectiveSounds.win();
    this.reactSamuel('happy');
    void showSpeechIf(this, 'Alle fünf Sachen gefunden! Samuel ist bereit für den Fall!');
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
