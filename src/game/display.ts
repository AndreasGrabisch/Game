export async function tryEnableGameDisplay(): Promise<void> {
  const root = document.documentElement;

  try {
    if (!document.fullscreenElement) {
      if (root.requestFullscreen) {
        await root.requestFullscreen();
      } else {
        const legacy = root as HTMLElement & {
          webkitRequestFullscreen?: () => Promise<void>;
        };
        await legacy.webkitRequestFullscreen?.();
      }
    }
  } catch {
    // Fullscreen wird auf manchen Geräten nur nach Nutzer-Geste erlaubt.
  }

  try {
    const orientation = screen.orientation as ScreenOrientation & {
      lock?: (type: string) => Promise<void>;
    };
    await orientation.lock?.('landscape');
  } catch {
    // Orientierungssperre ist nicht überall verfügbar.
  }
}

export function bindFullscreenOnFirstTap(): void {
  const once = (): void => {
    void tryEnableGameDisplay();
  };
  document.body.addEventListener('pointerdown', once, { once: true });
  document.body.addEventListener('touchstart', once, { once: true, passive: true });
}
