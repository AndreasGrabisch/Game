import { syncMasterGain } from './audioEngine';
import { isAudioMuted, toggleAudioMuted } from './audioSettings';
import { refreshAppMusicAfterMuteChange } from './appMusic';
import { feedbackSounds } from './feedbackAudio';

export function getMuteButtonLabel(): string {
  return isAudioMuted() ? 'Ton an' : 'Ton aus';
}

export function toggleGameAudio(): boolean {
  const next = toggleAudioMuted();
  syncMasterGain();
  refreshAppMusicAfterMuteChange();
  if (!next.muted) {
    void feedbackSounds.unlock();
    feedbackSounds.tap();
  }
  return !next.muted;
}