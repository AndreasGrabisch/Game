import Phaser from 'phaser';
import { COLORS } from '../game/constants';
import { addComicText, createComicButton, drawBike, drawSamuel, drawStar, floatFeedback } from '../game/graphics';
import { feedbackSounds } from '../game/feedbackAudio';
import { starsForMistakes } from '../game/scoring';
import { isPartUnlocked } from '../game/Progress';
import { getGameCenter } from './BootScene';
import { drawRideBackdrop } from '../game/sceneBackgrounds';
import {
  drawIllustratedFinishBanner,
  drawIllustratedPuddle,
  drawIllustratedTree,
} from '../game/objectGraphics';
import { bindSceneMusic } from '../game/sceneMusic';
import { spawnSamuelCompanion, reactCompanionCheer } from '../game/characterCompanion';
import { getDetectiveLayoutMode } from '../game/detectiveLayout';
import { recordRideCompletion } from '../game/appTreasury';
import { playConfettiBurst } from '../game/celebrationConfetti';
import { readSceneEnterStyle, runSceneEnter, transitionToScene } from '../game/sceneTransition';
import { hideSpeech, showSpeechIf } from '../ui/speech';

interface Prop {
  obj: Phaser.GameObjects.Rectangle | Phaser.GameObjects.Ellipse | Phaser.GameObjects.Container;
  factor: number;
  span: number;
}

interface Marker {
  worldX: number;
  obj: Phaser.GameObjects.Container;
  resolved: boolean;
  kind: 'puddle' | 'finish';
}

export class RideScene extends Phaser.Scene {
  private riding = false;
  private finished = false;
  private jumping = false;
  private distance = 0;
  private hits = 0;
  private speed = 155;
  private bikeScreenX = 280;
  private riderBaseY = 0;
  private groundY = 0;
  private layoutScale = 1;
  private rider!: Phaser.GameObjects.Container;
  private props: Prop[] = [];
  private markers: Marker[] = [];
  private progressFill?: Phaser.GameObjects.Rectangle;
  private progressWidth = 420;
  private goalDistance = 3200;
  private spaceKey?: Phaser.Input.Keyboard.Key;
  private samuelCompanion?: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'RideScene' });
  }

  create(): void {
    if (!isPartUnlocked('wheels') || !isPartUnlocked('pedals') || !isPartUnlocked('handlebar')) {
      transitionToScene(this, 'WorkshopScene');
      return;
    }

    this.riding = false;
    this.finished = false;
    this.jumping = false;
    this.distance = 0;
    this.hits = 0;
    this.props = [];
    this.markers = [];

    runSceneEnter(this, readSceneEnterStyle(this));
    bindSceneMusic(this, 'ride');
    const { x, y, scale } = getGameCenter(this);
    const layout = getDetectiveLayoutMode(this);
    this.layoutScale = scale * (layout.portrait ? 0.88 : 1);
    this.bikeScreenX = x - (layout.portrait ? 120 : 180) * this.layoutScale;
    this.groundY = y + (layout.portrait ? 58 : 70) * this.layoutScale;
    this.riderBaseY = this.groundY - 28 * this.layoutScale;
    this.progressWidth = (layout.portrait ? 320 : 460) * this.layoutScale;
    this.goalDistance = 2200 * this.layoutScale;
    this.speed = 158 * this.layoutScale;

    this.drawWorld(x, y, this.layoutScale);
    this.createRider(this.layoutScale);
    this.createMarkers(this.layoutScale);
    this.createHud(x, y, this.layoutScale, layout.portrait);

    this.samuelCompanion = spawnSamuelCompanion(
      this,
      x + (layout.portrait ? 130 : 280) * this.layoutScale,
      y - (layout.portrait ? 200 : 160) * this.layoutScale,
      0.65 * this.layoutScale,
      9,
    );

    this.spaceKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.y < 90 * scale && pointer.x < x - 220 * scale) return;
      this.jump();
    });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.riding = false;
      this.finished = true;
      hideSpeech();
    });

    void this.begin();
  }

  update(_time: number, delta: number): void {
    if (!this.riding || this.finished) return;
    if (this.spaceKey && Phaser.Input.Keyboard.JustDown(this.spaceKey)) this.jump();

    const dt = Math.min(delta / 1000, 0.05);
    this.distance += this.speed * dt;
    this.scrollProps(dt);
    this.updateMarkers();
    const progress = Phaser.Math.Clamp(this.distance / this.goalDistance, 0, 1);
    if (this.progressFill) this.progressFill.width = this.progressWidth * progress;
  }

  private async begin(): Promise<void> {
    const continued = await showSpeechIf(
      this,
      'Fertig! Tippe Spring bei Pfützen — kurze Strecke!',
    );
    if (!continued) return;
    void feedbackSounds.unlock();
    feedbackSounds.rideGo();
    this.riding = true;
  }

  private drawWorld(_x: number, _y: number, scale: number): void {
    drawRideBackdrop(this, this.groundY, scale);

    for (let i = 0; i < 4; i++) {
      const cloud = this.add.ellipse(160 + i * 280, 70 + (i % 2) * 36, 100, 40, COLORS.white, 0.9);
      cloud.setStrokeStyle(2, COLORS.outline, 0.15);
      this.props.push({ obj: cloud, factor: 0.28, span: 1200 });
    }

    for (let i = 0; i < 8; i++) {
      const dash = this.add.rectangle(80 + i * 140, this.groundY + 18 * scale, 64, 8, COLORS.white);
      this.props.push({ obj: dash, factor: 1, span: 1120 });
    }

    for (let i = 0; i < 5; i++) {
      const tree = drawIllustratedTree(this, scale);
      tree.setPosition(120 + i * 240, this.groundY - 70 * scale);
      this.props.push({ obj: tree, factor: 0.72, span: 1280 });
    }
  }

  private createRider(scale: number): void {
    this.rider = this.add.container(this.bikeScreenX, this.riderBaseY);
    this.rider.setDepth(5);
    const bike = drawBike(this, 0, 18 * scale, 0.75 * scale, {
      showFrame: true,
      showWheels: true,
      showPedals: true,
      showHandlebar: true,
    });
    const samuel = drawSamuel(this, -4 * scale, -34 * scale, 0.58 * scale);
    bike.removeFromDisplayList();
    samuel.removeFromDisplayList();
    this.rider.add([bike, samuel]);
    this.tweens.add({
      targets: samuel,
      angle: 4,
      duration: 220,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private createMarkers(scale: number): void {
    const puddles = [560, 1050, 1550];
    for (const worldX of puddles) {
      this.markers.push({
        worldX: worldX * scale,
        obj: this.makePuddle(scale),
        resolved: false,
        kind: 'puddle',
      });
    }
    this.markers.push({
      worldX: this.goalDistance,
      obj: this.makeFinish(scale),
      resolved: false,
      kind: 'finish',
    });
  }

  private makePuddle(scale: number): Phaser.GameObjects.Container {
    const puddle = drawIllustratedPuddle(this, scale);
    puddle.setPosition(1100, this.groundY);
    puddle.setDepth(4);
    return puddle;
  }

  private makeFinish(scale: number): Phaser.GameObjects.Container {
    const banner = drawIllustratedFinishBanner(this, scale);
    banner.setPosition(1200, this.groundY - 40 * scale);
    banner.setDepth(4);
    return banner;
  }

  private createHud(x: number, y: number, scale: number, portrait: boolean): void {
    const barX = x - this.progressWidth / 2;
    const barY = y - (portrait ? 248 : 230) * scale;
    const track = this.add.rectangle(barX, barY, this.progressWidth, 16 * scale, COLORS.white);
    track.setOrigin(0, 0.5);
    track.setStrokeStyle(3, COLORS.outline);
    this.progressFill = this.add.rectangle(barX, barY, 1, 16 * scale, COLORS.bikeFrame);
    this.progressFill.setOrigin(0, 0.5);
    this.progressFill.setStrokeStyle(0, COLORS.outline);

    addComicText(this, x, barY - 28 * scale, '💧 spring! → 🏁', 20 * scale);

    createComicButton(
      this,
      x - (portrait ? 150 : 360) * scale,
      barY - (portrait ? 0 : 4) * scale,
      '←',
      () => {
        hideSpeech();
        transitionToScene(this, 'WorkshopScene');
      },
      0x5b6ee1,
      portrait ? 72 : 100,
    ).setDepth(10);

    const jumpY = y + (portrait ? 228 : 200) * scale;
    createComicButton(
      this,
      x,
      jumpY,
      '⬆ Spring!',
      () => this.jump(),
      COLORS.success,
      portrait ? 200 : 180,
    ).setDepth(10);
  }

  private scrollProps(dt: number): void {
    const dx = this.speed * dt;
    for (const prop of this.props) {
      prop.obj.x -= dx * prop.factor;
      if (prop.obj.x < -140) prop.obj.x += prop.span;
    }
  }

  private updateMarkers(): void {
    for (const marker of this.markers) {
      const screenX = this.bikeScreenX + (marker.worldX - this.distance);
      marker.obj.x = screenX;

      if (marker.kind === 'finish') {
        if (!this.finished && screenX <= this.bikeScreenX + 10) this.finishRide();
        continue;
      }

      if (marker.resolved) continue;
      const near = Math.abs(screenX - this.bikeScreenX) < 76 * this.layoutScale;
      if (near && this.isAirborne()) {
        marker.resolved = true;
        feedbackSounds.place();
        floatFeedback(this, screenX, this.groundY - 90 * this.layoutScale, 'Geschafft!', '#2e9e4f', 20 * this.layoutScale);
      } else if (screenX < this.bikeScreenX - 34 * this.layoutScale) {
        marker.resolved = true;
        this.hits += 1;
        this.splash(screenX);
      }
    }
  }

  private isAirborne(): boolean {
    return this.jumping && this.rider.y < this.riderBaseY - 28 * this.layoutScale;
  }

  private jump(): void {
    if (!this.riding || this.jumping || this.finished) return;
    void feedbackSounds.unlock();
    feedbackSounds.jump();
    this.jumping = true;
    this.tweens.killTweensOf(this.rider);
    this.tweens.add({
      targets: this.rider,
      y: this.riderBaseY - 108 * this.layoutScale,
      duration: 250,
      yoyo: true,
      hold: 50,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        this.jumping = false;
        if (this.rider?.active) this.rider.y = this.riderBaseY;
      },
    });
  }

  private splash(x: number): void {
    feedbackSounds.splash();
    this.cameras.main.shake(90, 0.004);
    const blob = this.add.ellipse(x, this.groundY, 54 * this.layoutScale, 22 * this.layoutScale, 0x4aa3df, 0.9);
    blob.setDepth(6);
    this.tweens.add({
      targets: blob,
      scaleX: 1.7,
      alpha: 0,
      duration: 380,
      onComplete: () => blob.destroy(),
    });
    floatFeedback(this, x, this.groundY - 80 * this.layoutScale, 'Platscher!', '#1a6ea8', 20 * this.layoutScale);
  }

  private finishRide(): void {
    if (this.finished) return;
    this.finished = true;
    this.riding = false;
    recordRideCompletion();
    feedbackSounds.success();
    reactCompanionCheer(this, this.samuelCompanion);

    const { x, y, scale } = getGameCenter(this);
    const earned = starsForMistakes(this.hits);

    playConfettiBurst(this, x, y - 60 * scale, scale, { count: 16, mixStars: true });

    for (let i = 0; i < 3; i++) {
      const star = drawStar(this, x - 50 * scale + i * 50 * scale, y - 150 * scale, 18 * scale, i < earned);
      star.setDepth(31);
      star.setScale(0);
      this.tweens.add({
        targets: star,
        scale: 1,
        delay: 200 + i * 160,
        duration: 280,
        ease: 'Back.easeOut',
      });
    }

    const line = earned === 3 ? 'Trocken angekommen! Samuel jubelt.' : 'Ziel! Samuel ist angekommen.';
    void this.showFinish(line, x, y, scale);
  }

  private async showFinish(line: string, x: number, y: number, scale: number): Promise<void> {
    const continued = await showSpeechIf(this, line);
    if (!continued) return;
    createComicButton(this, x, y + 200 * scale, 'Zur Werkstatt!', () => {
      transitionToScene(this, 'WorkshopScene');
    }).setDepth(32);
  }
}
