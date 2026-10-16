(function () {
  const root = document.documentElement;
  const savedTheme = localStorage.getItem('vanaveda-theme');
  const savedDir = localStorage.getItem('vanaveda-dir');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  root.dataset.theme = savedTheme || (prefersDark ? 'dark' : 'light');
  root.dir = savedDir === 'rtl' ? 'rtl' : 'ltr';
  root.classList.add('js');
})();
