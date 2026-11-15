import { getAudioContext, getMasterGain, sfxVolume, unlockAudio } from './audioEngine';

type Wave = OscillatorType;

export async function unlockFeedbackAudio(): Promise<void> {
  await unlockAudio();
}

function playTone(
  frequency: number,
  duration: number,
  type: Wave = 'sine',
  volume = 0.06,
  when = 0,
): void {
  const ctx = getAudioContext();
  const master = getMasterGain();
  const vol = sfxVolume(volume);
  if (!ctx || !master || vol <= 0) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const start = ctx.currentTime + when;
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(vol, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain);
  gain.connect(master);
  osc.start(start);
  osc.stop(start + duration + 0.05);
}

function playNoise(duration: number, volume = 0.04): void {
  const ctx = getAudioContext();
  const master = getMasterGain();
  const vol = sfxVolume(volume);
  if (!ctx || !master || vol <= 0) return;

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
  gain.gain.value = vol;
  source.connect(filter);
  filter.connect(gain);
  gain.connect(master);
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

  tap(): void {
    playTone(740, 0.05, 'triangle', 0.045);
    playNoise(0.04, 0.02);
  },

  hubWelcome(): void {
    playTone(587, 0.12, 'triangle', 0.05);
    playTone(784, 0.16, 'triangle', 0.05, 0.1);
  },

  workshopCheer(): void {
    playTone(440, 0.08, 'square', 0.04);
    playTone(554, 0.08, 'square', 0.04, 0.09);
    playTone(659, 0.14, 'triangle', 0.045, 0.18);
  },

  rideGo(): void {
    playTone(330, 0.06, 'sawtooth', 0.03);
    playTone(440, 0.1, 'sawtooth', 0.035, 0.07);
  },

  colorPop(): void {
    playTone(698, 0.07, 'triangle', 0.05);
    playTone(880, 0.09, 'triangle', 0.045, 0.08);
  },
};