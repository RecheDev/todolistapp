// Script to prevent FOUC (Flash of Unstyled Content)
export function ThemeScript() {
  const script = `
    (function() {
      try {
        var theme = localStorage.getItem('todoapp-theme');
        var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        var actualTheme = theme === 'system' || !theme ? systemTheme : theme;
        
        document.documentElement.setAttribute('data-theme', actualTheme);
        document.documentElement.classList.remove('light', 'dark');
        
        if (actualTheme === 'dark') {
          document.documentElement.classList.add('dark');
        }
      } catch (e) {
        // Fallback to light theme if anything fails
        document.documentElement.setAttribute('data-theme', 'light');
      }
    })();
  `;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}