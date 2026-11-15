import { getVolumeMultiplier } from './audioSettings';

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let musicGain: GainNode | null = null;

export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctx =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) {
    audioCtx = new Ctx();
    masterGain = audioCtx.createGain();
    musicGain = audioCtx.createGain();
    masterGain.connect(audioCtx.destination);
    musicGain.connect(masterGain);
    syncMasterGain();
  }
  return audioCtx;
}

export function getMasterGain(): GainNode | null {
  getAudioContext();
  return masterGain;
}

export function getMusicGain(): GainNode | null {
  getAudioContext();
  return musicGain;
}

export function syncMasterGain(): void {
  if (!masterGain) return;
  masterGain.gain.value = getVolumeMultiplier();
}

export async function unlockAudio(): Promise<void> {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch {
      // Warten auf Geste
    }
  }
  syncMasterGain();
}

export function sfxVolume(base: number): number {
  return base * getVolumeMultiplier();
}

export function musicVolume(base: number): number {
  const mul = getVolumeMultiplier();
  if (mul <= 0) return 0;
  return base * mul * 0.45;
}