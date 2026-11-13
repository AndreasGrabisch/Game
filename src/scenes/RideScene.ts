import Phaser from 'phaser';
import { COLORS } from '../game/constants';
import { addComicText, createComicButton, drawBike, drawSamuel, drawStar, floatFeedback } from '../game/graphics';
import { feedbackSounds } from '../game/feedbackAudio';
import { starsForMistakes } from '../game/scoring';
import { isPartUnlocked } from '../game/Progress';
import { getGameCenter } from './BootScene';
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

  constructor() {
    super({ key: 'RideScene' });
  }

  create(): void {
    if (!isPartUnlocked('wheels') || !isPartUnlocked('pedals') || !isPartUnlocked('handlebar')) {
      this.scene.start('WorkshopScene');
      return;
    }

    this.riding = false;
    this.finished = false;
    this.jumping = false;
    this.distance = 0;
    this.hits = 0;
    this.props = [];
    this.markers = [];

    const { x, y, scale } = getGameCenter(this);
    this.layoutScale = scale;
    this.bikeScreenX = x - 180 * scale;
    this.groundY = y + 70 * scale;
    this.riderBaseY = this.groundY - 28 * scale;
    this.progressWidth = 460 * scale;
    this.goalDistance = 3200 * scale;
    this.speed = 155 * scale;

    this.drawWorld(x, y, scale);
    this.createRider(scale);
    this.createMarkers(scale);
    this.createHud(x, y, scale);

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
      'Mein Fahrrad ist fertig! Tippe auf Spring, wenn eine Pfütze kommt.',
    );
    if (!continued) return;
    void feedbackSounds.unlock();
    this.riding = true;
  }

  private drawWorld(x: number, y: number, scale: number): void {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, COLORS.sky);
    this.add.circle(x + 340 * scale, y - 180 * scale, 36 * scale, 0xffe08a).setStrokeStyle(3, COLORS.outline);

    for (let i = 0; i < 4; i++) {
      const cloud = this.add.ellipse(160 + i * 280, 70 + (i % 2) * 36, 100, 40, COLORS.white, 0.9);
      cloud.setStrokeStyle(2, COLORS.outline, 0.15);
      this.props.push({ obj: cloud, factor: 0.28, span: 1200 });
    }

    this.add.rectangle(width / 2, height * 0.78, width, height * 0.48, COLORS.grass);
    const road = this.add.rectangle(width / 2, this.groundY + 18 * scale, width, 74 * scale, 0x5c6770);
    road.setStrokeStyle(3, COLORS.outline);

    for (let i = 0; i < 8; i++) {
      const dash = this.add.rectangle(80 + i * 140, this.groundY + 18 * scale, 64, 8, COLORS.white);
      this.props.push({ obj: dash, factor: 1, span: 1120 });
    }

    for (let i = 0; i < 5; i++) {
      const tree = this.makeTree(120 + i * 240, this.groundY - 70 * scale, scale);
      this.props.push({ obj: tree, factor: 0.72, span: 1280 });
    }
  }

  private makeTree(x: number, y: number, scale: number): Phaser.GameObjects.Container {
    const tree = this.add.container(x, y);
    const trunk = this.add.rectangle(0, 18 * scale, 12 * scale, 28 * scale, 0x8b5a2b);
    trunk.setStrokeStyle(2, COLORS.outline);
    const crown = this.add.circle(0, -8 * scale, 26 * scale, 0x3cba5a);
    crown.setStrokeStyle(3, COLORS.outline);
    tree.add([trunk, crown]);
    return tree;
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
    const puddles = [720, 1280, 1880, 2520];
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
    const puddle = this.add.container(1100, this.groundY);
    puddle.setDepth(4);
    const water = this.add.ellipse(0, 0, 78 * scale, 28 * scale, 0x4aa3df);
    water.setStrokeStyle(3, COLORS.outline);
    const shine = this.add.ellipse(-12 * scale, -4 * scale, 22 * scale, 8 * scale, COLORS.white, 0.7);
    puddle.add([water, shine]);
    return puddle;
  }

  private makeFinish(scale: number): Phaser.GameObjects.Container {
    const banner = this.add.container(1200, this.groundY - 40 * scale);
    banner.setDepth(4);
    const pole = this.add.rectangle(0, 20 * scale, 8 * scale, 80 * scale, 0xdddddd);
    pole.setStrokeStyle(2, COLORS.outline);
    const flag = this.add.container(28 * scale, -16 * scale);
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const dark = (row + col) % 2 === 0;
        const cell = this.add.rectangle((col - 1.5) * 12 * scale, (row - 1.5) * 12 * scale, 12 * scale, 12 * scale, dark ? 0x1a1a2e : COLORS.white);
        flag.add(cell);
      }
    }
    banner.add([pole, flag]);
    return banner;
  }

  private createHud(x: number, y: number, scale: number): void {
    const barX = x + 20 * scale;
    const barY = y - 230 * scale;
    const track = this.add.rectangle(barX, barY, this.progressWidth, 16 * scale, COLORS.white);
    track.setOrigin(0, 0.5);
    track.setStrokeStyle(3, COLORS.outline);
    this.progressFill = this.add.rectangle(barX, barY, 1, 16 * scale, COLORS.bikeFrame);
    this.progressFill.setOrigin(0, 0.5);
    this.progressFill.setStrokeStyle(0, COLORS.outline);

    addComicText(this, x + 40 * scale, y - 196 * scale, 'Spring über die Pfützen!', 20 * scale);

    createComicButton(
      this,
      x - 360 * scale,
      y - 230 * scale,
      'Zurück',
      () => {
        hideSpeech();
        this.scene.start('WorkshopScene');
      },
      0x5b6ee1,
      150,
    ).setDepth(10);

    createComicButton(this, x + 300 * scale, y + 200 * scale, 'Spring!', () => this.jump(), COLORS.success, 180).setDepth(10);
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
    feedbackSounds.success();

    const { x, y, scale } = getGameCenter(this);
    const earned = starsForMistakes(this.hits);

    for (let i = 0; i < 14; i++) {
      const star = drawStar(
        this,
        x + Phaser.Math.Between(-260, 260) * scale,
        y - 80 * scale,
        (10 + (i % 3) * 4) * scale,
      );
      star.setDepth(30);
      this.tweens.add({
        targets: star,
        y: star.y + Phaser.Math.Between(50, 140) * scale,
        alpha: 0,
        angle: 160,
        duration: 900,
        delay: i * 35,
        onComplete: () => star.destroy(),
      });
    }

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
      this.scene.start('WorkshopScene');
    }).setDepth(32);
  }
}
