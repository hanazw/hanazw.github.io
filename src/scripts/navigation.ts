const toggle = document.querySelector<HTMLButtonElement>('#theme-toggle');

function apply_theme(theme: 'light' | 'dark'): void {
  document.documentElement.dataset.theme = theme;
  if (toggle) {
    const label = theme === 'dark' ? toggle.dataset.lightLabel! : toggle.dataset.darkLabel!;
    toggle.setAttribute('aria-label', label);
    toggle.title = label;
  }
  try { localStorage.setItem('theme', theme); } catch { /* Storage is optional. */ }
}

if (toggle) {
  apply_theme(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
  toggle.addEventListener('click', () => apply_theme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));
}

const language_button = document.querySelector<HTMLButtonElement>('#language-toggle');
const language_menu = document.querySelector<HTMLElement>('#language-menu');
if (language_button && language_menu) {
  const place_menu = () => {
    if (!language_menu.matches(':popover-open')) return;
    const anchor = language_button.getBoundingClientRect();
    language_menu.style.top = `${anchor.bottom + 8}px`;
    language_menu.style.left = `${Math.max(12, Math.min(anchor.right - language_menu.offsetWidth, innerWidth - language_menu.offsetWidth - 12))}px`;
  };
  language_menu.addEventListener('toggle', () => {
    language_button.setAttribute('aria-expanded', String(language_menu.matches(':popover-open')));
    place_menu();
  });
  window.addEventListener('resize', place_menu);
  window.addEventListener('scroll', () => {
    if (language_menu.matches(':popover-open')) language_menu.hidePopover();
  }, { passive: true });
}
