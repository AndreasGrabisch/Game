/** Langsame, gut nachvollziehbare Animationen im Detektivspiel. */
export const DETECTIVE_TIMING = {
  introFadeIn: 650,
  introTextIn: 900,
  introFadeOut: 650,

  drawerOpenFront: 850,
  drawerOpenItem: 950,
  drawerOpenItemDelay: 280,

  drawerCloseItem: 600,
  drawerCloseFront: 800,
  drawerCloseFrontDelay: 180,

  itemRevealPop: 950,
  findPulse: 420,
  backpackPop: 320,
  speechVisibleMs: 2400,

  shuffleSwirlFade: 380,
  shuffleWiggleMs: 110,
  shuffleWiggleRepeats: 1,
  /** Schneller gemischt — weniger Wartezeit für Kinder. */
  shuffleMoveEachMs: 380,
  /** Wie kurz vor dem Landen die blockierende Schublade losfliegt. */
  shuffleVacateLeadMs: 120,
  shuffleInstantMs: 1,
} as const;
