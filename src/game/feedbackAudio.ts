type Wave = OscillatorType;

let audioCtx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctx =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) audioCtx = new Ctx();
  return audioCtx;
}

export async function unlockFeedbackAudio(): Promise<void> {
  const ctx = getContext();
  if (!ctx || ctx.state !== 'suspended') return;
  try {
    await ctx.resume();
  } catch {
    // Ton startet erst nach einer Nutzer-Geste.
  }
}

function playTone(
  frequency: number,
  duration: number,
  type: Wave = 'sine',
  volume = 0.06,
  when = 0,
): void {
  const ctx = getContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const start = ctx.currentTime + when;
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.05);
}

function playNoise(duration: number, volume = 0.04): void {
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
  filter.type = 'lowpass';
  filter.frequency.value = 900;
  source.buffer = buffer;
  gain.gain.value = volume;
  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start();
}

export const feedbackSounds = {
  async unlock(): Promise<void> {
    await unlockFeedbackAudio();
  },

  catch(): void {
    playTone(660, 0.08, 'triangle', 0.06);
    playTone(880, 0.12, 'triangle', 0.05, 0.07);
  },

  miss(): void {
    playTone(196, 0.14, 'sine', 0.04);
  },

  place(): void {
    playTone(523, 0.09, 'triangle', 0.05);
  },

  jump(): void {
    playTone(392, 0.07, 'square', 0.03);
    playTone(587, 0.1, 'square', 0.03, 0.06);
  },

  splash(): void {
    playNoise(0.18, 0.05);
    playTone(180, 0.12, 'sine', 0.04);
  },

  success(): void {
    playTone(523, 0.1, 'triangle', 0.06);
    playTone(659, 0.1, 'triangle', 0.06, 0.1);
    playTone(784, 0.18, 'triangle', 0.06, 0.2);
  },
};
