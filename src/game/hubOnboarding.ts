const STORAGE_KEY = 'samuel-hub-onboarding-v2';

export function hasSeenHubOnboardingV2(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function markHubOnboardingV2Seen(): void {
  try {
    localStorage.setItem(STORAGE_KEY, '1');
  } catch {
    // Lokal optional
  }
}

export const HUB_WELCOME_NEW =
  'Hallo! Tippe ein Spiel unten. ⚽ Neu: Ballspiel — fang die Bälle! 🏆 Schatz zeigt deine Sticker.';

export const HUB_WELCOME_RETURN = 'Schön, dass du da bist! Wähle ein Spiel oder schau in die Schatzkiste.';