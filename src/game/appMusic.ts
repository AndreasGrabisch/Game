import { getAudioContext, getMusicGain, musicVolume, unlockAudio } from './audioEngine';
import { getVolumeMultiplier } from './audioSettings';

export type MusicTheme = 'home' | 'workshop' | 'ride' | 'colors' | 'detective';

let activeTheme: MusicTheme | null = null;
let stepTimer: ReturnType<typeof setInterval> | null = null;
let stepIndex = 0;
let duckRestoreTimer: ReturnType<typeof setTimeout> | null = null;

const PATTERNS: Record<MusicTheme, number[]> = {
  home: [523, 659, 784, 659],
  workshop: [392, 494, 392, 330],
  ride: [440, 554, 659, 554],
  colors: [494, 587, 698, 587],
  detective: [349, 440, 523, 440],
};

export function getActiveMusicTheme(): MusicTheme | null {
  return activeTheme;
}

export function stopAppMusic(): void {
  if (stepTimer) {
    clearInterval(stepTimer);
    stepTimer = null;
  }
  activeTheme = null;
  stepIndex = 0;
}

function playMusicBlip(freq: number, duration: number): void {
  const ctx = getAudioContext();
  const bus = getMusicGain();
  if (!ctx || !bus) return;
  const vol = musicVolume(0.08);
  if (vol <= 0) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.value = freq;
  const t = ctx.currentTime;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(gain);
  gain.connect(bus);
  osc.start(t);
  osc.stop(t + duration + 0.05);
}

export async function startAppMusic(theme: MusicTheme): Promise<void> {
  await unlockAudio();
  stopAppMusic();
  if (getVolumeMultiplier() <= 0) {
    activeTheme = theme;
    return;
  }

  activeTheme = theme;
  const pattern = PATTERNS[theme];
  const intervalMs = theme === 'ride' ? 520 : theme === 'detective' ? 780 : 640;

  stepIndex = 0;
  playMusicBlip(pattern[0], 0.22);
  stepTimer = setInterval(() => {
    if (getVolumeMultiplier() <= 0) return;
    stepIndex = (stepIndex + 1) % pattern.length;
    playMusicBlip(pattern[stepIndex], theme === 'workshop' ? 0.14 : 0.2);
  }, intervalMs);
}

/** Temporarily lower music bus during hub transitions. */
export function duckAppMusic(level = 0.25, holdMs = 1000): void {
  const bus = getMusicGain();
  const ctx = getAudioContext();
  if (!bus || !ctx) return;
  const t = ctx.currentTime;
  bus.gain.cancelScheduledValues(t);
  bus.gain.setValueAtTime(bus.gain.value, t);
  bus.gain.linearRampToValueAtTime(level, t + 0.08);
  if (duckRestoreTimer) clearTimeout(duckRestoreTimer);
  duckRestoreTimer = setTimeout(() => restoreAppMusicDuck(), holdMs);
}

export function restoreAppMusicDuck(): void {
  const bus = getMusicGain();
  const ctx = getAudioContext();
  if (!bus || !ctx) return;
  const t = ctx.currentTime;
  bus.gain.cancelScheduledValues(t);
  bus.gain.setValueAtTime(bus.gain.value, t);
  bus.gain.linearRampToValueAtTime(1, t + 0.25);
  duckRestoreTimer = null;
}

export function refreshAppMusicAfterMuteChange(): void {
  const theme = activeTheme;
  stopAppMusic();
  if (theme && getVolumeMultiplier() > 0) {
    void startAppMusic(theme);
  } else if (theme) {
    activeTheme = theme;
  }
}