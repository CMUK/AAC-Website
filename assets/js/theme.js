(() => {
  const themeToggle = document.querySelector('[data-theme-toggle]');
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  const themeKey = 'aac-theme';
  const defaultTheme = 'dark';

  let currentTheme = localStorage.getItem(themeKey) || defaultTheme;

  function setTheme(theme) {
    currentTheme = theme === 'light' ? 'light' : 'dark';
    document.documentElement.dataset.theme = currentTheme;
    localStorage.setItem(themeKey, currentTheme);

    // Update accessibility attributes on the button if it exists on the page
    if (themeToggle) {
      themeToggle.setAttribute('aria-label', currentTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      themeToggle.setAttribute('title', currentTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      themeToggle.setAttribute('aria-pressed', String(currentTheme === 'light'));
    }

    // Update the browser status bar color
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', currentTheme === 'dark' ? '#0a1222' : '#f7f9fc');
    }

    // Custom hook: If the home page carousel needs to update images, trigger it
    if (typeof window.updateCarouselImages === 'function') {
      window.updateCarouselImages(currentTheme);
    }
  }

  // Set up the click listener if a toggle button is on the current page
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });
  }

  // Initialize immediately on load
  setTheme(currentTheme);
})();