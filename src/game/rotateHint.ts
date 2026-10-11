export function setupRotateHint(): void {
  const hint = document.getElementById('rotate-hint');
  if (!hint) return;

  const update = (): void => {
    const portrait = window.matchMedia('(orientation: portrait)').matches;
    const narrow = window.innerWidth < 900;
    hint.classList.toggle('visible', portrait && narrow);
  };

  update();
  window.addEventListener('resize', update);
  window.addEventListener('orientationchange', update);
}
