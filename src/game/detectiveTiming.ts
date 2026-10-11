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

  shuffleSwirlFade: 1400,
  shuffleWiggleMs: 240,
  shuffleWiggleRepeats: 4,
  /** Eine Schublade nach der anderen – leichter zu verfolgen. */
  shuffleMoveEachMs: 2200,
} as const;
