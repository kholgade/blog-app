// Theme Toggle Functionality - Icon Only
document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;

  // Load saved theme preference
  const savedTheme = localStorage.getItem('theme') || 'light';
  body.setAttribute('data-theme', savedTheme);

  // Set initial icon
  if (themeToggle) {
    themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
  }

  // Theme toggle handler
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = body.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

      body.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);

      themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    });
  }
});
