type Wave = OscillatorType;

let audioCtx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) audioCtx = new Ctx();
  return audioCtx;
}

export async function unlockDetectiveAudio(): Promise<void> {
  const ctx = getContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
}

function playTone(
  frequency: number,
  duration: number,
  type: Wave = 'sine',
  volume = 0.08,
  when = 0,
): void {
  const ctx = getContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ctx.currentTime + when);
  gain.gain.setValueAtTime(0.0001, ctx.currentTime + when);
  gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + when + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + when + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime + when);
  osc.stop(ctx.currentTime + when + duration + 0.05);
}

function playNoise(duration: number, volume = 0.05): void {
  const ctx = getContext();
  if (!ctx) return;

  const bufferSize = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }

  const source = ctx.createBufferSource();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 700;

  source.buffer = buffer;
  gain.gain.value = volume;
  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start();
}

export const detectiveSounds = {
  async unlock(): Promise<void> {
    await unlockDetectiveAudio();
  },

  intro(): void {
    playTone(392, 0.12, 'triangle', 0.07);
    playTone(523, 0.16, 'triangle', 0.07, 0.1);
    playTone(659, 0.22, 'triangle', 0.06, 0.22);
  },

  drawerOpen(): void {
    playTone(180, 0.08, 'square', 0.04);
    playTone(240, 0.14, 'sawtooth', 0.035, 0.04);
    playNoise(0.1, 0.03);
  },

  drawerClose(): void {
    playTone(140, 0.1, 'square', 0.045);
    playTone(90, 0.12, 'triangle', 0.04, 0.06);
  },

  shuffle(): void {
    playNoise(0.28, 0.06);
    playTone(320, 0.08, 'sawtooth', 0.03);
    playTone(260, 0.1, 'sawtooth', 0.03, 0.09);
    playTone(200, 0.12, 'sawtooth', 0.025, 0.18);
  },

  found(): void {
    playTone(523, 0.1, 'triangle', 0.07);
    playTone(659, 0.1, 'triangle', 0.07, 0.09);
    playTone(784, 0.18, 'triangle', 0.06, 0.18);
  },

  decoy(): void {
    playTone(220, 0.14, 'sawtooth', 0.05);
    playTone(180, 0.2, 'triangle', 0.04, 0.12);
  },

  win(): void {
    playTone(523, 0.12, 'triangle', 0.07);
    playTone(659, 0.12, 'triangle', 0.07, 0.12);
    playTone(784, 0.12, 'triangle', 0.07, 0.24);
    playTone(988, 0.28, 'triangle', 0.06, 0.36);
  },
};
