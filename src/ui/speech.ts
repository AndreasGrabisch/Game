export function showSpeech(text: string): Promise<void> {
  return new Promise((resolve) => {
    const overlay = document.getElementById('ui-overlay');
    const speechText = document.getElementById('speech-text');
    const speechBtn = document.getElementById('speech-btn');

    if (!overlay || !speechText || !speechBtn) {
      resolve();
      return;
    }

    speechText.textContent = text;
    overlay.classList.remove('hidden');
    overlay.classList.add('active');

    const handler = () => {
      speechBtn.removeEventListener('click', handler);
      overlay.classList.add('hidden');
      overlay.classList.remove('active');
      resolve();
    };

    speechBtn.addEventListener('click', handler);
  });
}

export function hideSpeech(): void {
  const overlay = document.getElementById('ui-overlay');
  if (overlay) {
    overlay.classList.add('hidden');
    overlay.classList.remove('active');
  }
}
