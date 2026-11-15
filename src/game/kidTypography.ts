/** Slightly larger type and buttons for ~6-year-olds (portrait/tablet). */
export const KID_TEXT_SCALE = 1.14;
export const KID_BUTTON_HEIGHT = 62;
export const KID_BUTTON_FONT_PX = 26;
export const KID_BUTTON_MIN_WIDTH = 124;

export function kidFontSize(baseSize: number): number {
  return Math.round(baseSize * KID_TEXT_SCALE);
}

export function kidButtonWidth(baseWidth: number): number {
  return Math.round(baseWidth * 1.06);
}