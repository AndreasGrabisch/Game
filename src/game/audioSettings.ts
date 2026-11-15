const STORAGE_KEY = 'samuel-audio-settings';

export interface AudioSettings {
  muted: boolean;
  /** Kindgerecht: Standard leiser (0.55), Maximum 0.75 */
  volume: number;
}

const DEFAULT: AudioSettings = {
  muted: false,
  volume: 0.55,
};

export function loadAudioSettings(): AudioSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT };
    const parsed = JSON.parse(raw) as AudioSettings;
    const volume = Math.min(0.75, Math.max(0.35, parsed.volume ?? DEFAULT.volume));
    return { muted: parsed.muted ?? false, volume };
  } catch {
    return { ...DEFAULT };
  }
}

export function saveAudioSettings(settings: AudioSettings): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      muted: settings.muted,
      volume: Math.min(0.75, Math.max(0.35, settings.volume)),
    }),
  );
}

export function isAudioMuted(): boolean {
  return loadAudioSettings().muted;
}

export function toggleAudioMuted(): AudioSettings {
  const next = loadAudioSettings();
  next.muted = !next.muted;
  saveAudioSettings(next);
  return next;
}

export function getVolumeMultiplier(): number {
  const s = loadAudioSettings();
  if (s.muted) return 0;
  return s.volume;
}