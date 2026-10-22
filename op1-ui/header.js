(() => {
  const root = document.documentElement;
  const toggle = document.querySelector('[data-theme-toggle]');
  const updateThemeButton = () => {
    if (!toggle) return;
    const light = root.dataset.theme === 'light';
    const label = light ? 'Switch To Dark Mode' : 'Switch To Light Mode';
    toggle.setAttribute('aria-label', label);
    toggle.title = label;
  };
  if (toggle) {
    toggle.hidden = false;
    updateThemeButton();
    toggle.addEventListener('click', () => {
      root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
      try { localStorage.setItem('op1-kit-theme', root.dataset.theme); } catch {}
      updateThemeButton();
    });
  }

  const link = document.querySelector('[data-github-stars]');
  const count = link?.querySelector('[data-star-count]');
  if (!count) return;
  const cacheKey = 'op1-kit-github-stars';
  const maxAge = 60 * 60 * 1000;
  const validCount = value => Number.isSafeInteger(value) && value >= 0;
  const display = value => {
    count.textContent = value.toLocaleString('en-GB');
    link.setAttribute('aria-label', `${value.toLocaleString('en-GB')} GitHub ${value === 1 ? 'Star' : 'Stars'}. View Stargazers`);
  };
  try {
    const cached = JSON.parse(sessionStorage.getItem(cacheKey));
    if (validCount(cached?.count) && Number.isFinite(cached?.time)) {
      display(cached.count);
      const age = Date.now() - cached.time;
      if (age >= 0 && age < maxAge) return;
    }
  } catch {}

  // One public request per tab per hour. No credentials or tracking service.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);
  fetch('https://api.github.com/repos/squarewave-studio/op1-design-kit', {
    credentials: 'omit', referrerPolicy: 'no-referrer', signal: controller.signal,
    headers: { Accept: 'application/vnd.github+json' }
  }).then(response => {
    if (!response.ok) throw new Error('GitHub is unavailable');
    return response.json();
  }).then(data => {
    if (!validCount(data.stargazers_count)) return;
    display(data.stargazers_count);
    try {
      sessionStorage.setItem(cacheKey, JSON.stringify({ count: data.stargazers_count, time: Date.now() }));
    } catch {}
  }).catch(() => { /* Keep the working Star link or the last known count. */ })
    .finally(() => clearTimeout(timeout));
})();
