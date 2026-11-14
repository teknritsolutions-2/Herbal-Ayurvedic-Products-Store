(function () {
  const root = document.documentElement;
  const params = new URLSearchParams(window.location.search);
  const urlTheme = params.get('theme');
  const urlDir = params.get('dir');
  const savedTheme = localStorage.getItem('vanaveda-theme');
  const savedDir = localStorage.getItem('vanaveda-dir');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  root.dataset.theme = urlTheme || savedTheme || (prefersDark ? 'dark' : 'light');
  root.dir = urlDir || (savedDir === 'rtl' ? 'rtl' : 'ltr');
  root.classList.add('js');
})();
