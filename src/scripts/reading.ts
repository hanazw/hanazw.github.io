const article = document.querySelector<HTMLElement>('[data-reading]');
if (article) {
  for (const pre of article.querySelectorAll<HTMLPreElement>('.prose pre')) {
    const code = pre.querySelector('code');
    if (!code) continue;
    const block = document.createElement('div');
    block.className = 'code-block';
    const toolbar = document.createElement('div');
    toolbar.className = 'code-toolbar';
    const language = document.createElement('span');
    language.textContent = pre.dataset.language ?? 'text';
    const copy = document.createElement('button');
    copy.type = 'button';
    copy.className = 'inverse-control';
    copy.textContent = article.dataset.copy!;
    copy.setAttribute('aria-live', 'polite');
    copy.addEventListener('click', async () => {
      copy.disabled = true;
      try {
        await navigator.clipboard.writeText(code.textContent ?? '');
        copy.textContent = article.dataset.copied!;
      } catch { copy.textContent = article.dataset.copyFailed!; }
      copy.disabled = false;
      window.setTimeout(() => { copy.textContent = article.dataset.copy!; }, 1800);
    });
    toolbar.append(language, copy);
    pre.before(block);
    block.append(toolbar, pre);
  }

  for (const heading of article.querySelectorAll<HTMLElement>('.prose :is(h2, h3, h4, h5, h6)[id]')) {
    const link = document.createElement('a');
    link.href = `#${heading.id}`;
    link.className = 'heading-permalink';
    link.textContent = '#';
    link.setAttribute('aria-label', article.dataset.sectionLink!);
    heading.append(link);
  }

  const toc = article.querySelector<HTMLDetailsElement>('[data-toc]');
  if (toc) {
    const desktop = matchMedia('(min-width: 64rem)');
    toc.open = desktop.matches;
    desktop.addEventListener('change', () => { toc.open = desktop.matches; });
    toc.addEventListener('click', event => {
      if (!desktop.matches && event.target instanceof Element && event.target.closest('a')) toc.open = false;
    });
    const headings = [...article.querySelectorAll<HTMLElement>('.prose :is(h2, h3)[id]')];
    const links = [...toc.querySelectorAll<HTMLAnchorElement>('[data-toc-link]')];
    let pending = false;
    let active_id = '';
    const update_toc = () => {
      pending = false;
      const active = headings.findLast(heading => heading.getBoundingClientRect().top <= 130) ?? headings[0];
      if (!active || active.id === active_id) return;
      active_id = active.id;
      const parent = links.find(link => link.dataset.tocLink === active_id)?.dataset.tocParent;
      for (const link of links) {
        if (link.dataset.tocLink === active_id) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      }
      for (const group of toc.querySelectorAll<HTMLElement>('[data-toc-section]')) {
        group.toggleAttribute('data-active', group.dataset.tocSection === parent);
      }
    };
    window.addEventListener('scroll', () => {
      if (!pending) { pending = true; requestAnimationFrame(update_toc); }
    }, { passive: true });
    update_toc();
  }

  const viewer = document.querySelector<HTMLDialogElement>('#image-viewer');
  const stage = viewer?.querySelector<HTMLElement>('.image-stage');
  if (viewer && stage) {
    let opener: HTMLButtonElement | undefined;
    const close = () => viewer.close();
    viewer.querySelector('.image-close')?.addEventListener('click', close);
    viewer.addEventListener('click', event => { if (event.target === viewer) close(); });
    viewer.addEventListener('close', () => {
      document.documentElement.classList.remove('image-viewer-open');
      stage.replaceChildren();
      opener?.focus({ preventScroll: true });
    });
    for (const image of article.querySelectorAll<HTMLImageElement>('.prose img')) {
      if (image.closest('a')) continue;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'image-button';
      const meaningful_alt = image.alt && !/^(?:img|image[-_\d].*)$/i.test(image.alt);
      button.setAttribute('aria-label', `${article.dataset.openImage}${meaningful_alt ? `: ${image.alt}` : ''}`);
      image.before(button);
      button.append(image);
      button.addEventListener('click', () => {
        opener = button;
        const expanded = new Image();
        expanded.src = image.currentSrc || image.src;
        expanded.alt = image.alt;
        stage.replaceChildren(expanded);
        viewer.showModal();
        document.documentElement.classList.add('image-viewer-open');
      });
    }
  }
}
