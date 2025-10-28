export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              const theme = localStorage.getItem('taskflow-theme') || 'light';
              const root = document.documentElement;

              if (theme === 'dark') {
                root.classList.add('dark');
              } else {
                root.classList.remove('dark');
              }
            } catch (e) {
              console.error('Failed to set theme:', e);
            }
          })();
        `,
      }}
    />
  );
}
