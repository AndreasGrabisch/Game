/** Public-Dateien (z. B. unter `public/`) mit Vite-Base-Pfad für GitHub Pages. */
export function publicAssetUrl(path: string): string {
  const base = import.meta.env.BASE_URL ?? '/';
  const normalized = path.replace(/^\//, '');
  return `${base}${normalized}`;
}
