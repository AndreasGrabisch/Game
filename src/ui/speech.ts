import type Phaser from 'phaser';

export type SpeechResult = 'ok' | 'cancelled';

interface PendingSpeech {
  handler: () => void;
  resolve: (result: SpeechResult) => void;
}

let pending: PendingSpeech | null = null;

function closeOverlay(): void {
  const overlay = document.getElementById('ui-overlay');
  overlay?.classList.add('hidden');
  overlay?.classList.remove('active');
}

function cancelPending(): void {
  if (!pending) return;
  const { handler, resolve } = pending;
  pending = null;
  document.getElementById('speech-btn')?.removeEventListener('click', handler);
  resolve('cancelled');
}

export function showSpeech(text: string): Promise<SpeechResult> {
  return new Promise((resolve) => {
    const overlay = document.getElementById('ui-overlay');
    const speechText = document.getElementById('speech-text');
    const speechBtn = document.getElementById('speech-btn');

    if (!overlay || !speechText || !speechBtn) {
      resolve('ok');
      return;
    }

    cancelPending();

    speechText.textContent = text;
    overlay.classList.remove('hidden');
    overlay.classList.add('active');

    const handler = () => {
      closeOverlay();
      if (pending?.handler === handler) pending = null;
      speechBtn.removeEventListener('click', handler);
      resolve('ok');
    };

    pending = { handler, resolve };
    speechBtn.addEventListener('click', handler);
  });
}

export function hideSpeech(): void {
  closeOverlay();
  cancelPending();
}

export async function showSpeechIf(scene: Phaser.Scene, text: string): Promise<boolean> {
  const result = await showSpeech(text);
  return result === 'ok' && scene.sys.isActive();
}
