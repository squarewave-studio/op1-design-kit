// Apply the saved choice before styles load. New visitors start in dark mode.
(() => {
  let theme = 'dark';
  try {
    if (localStorage.getItem('op1-kit-theme') === 'light') theme = 'light';
  } catch { /* Storage may be unavailable in a private or restricted browser. */ }
  document.documentElement.dataset.theme = theme;
})();
