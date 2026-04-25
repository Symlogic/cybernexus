    // Dark mode
    (function() {
      const toggle = document.getElementById('darkToggle');
      const saved = localStorage.getItem('cnTheme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (saved === 'dark' || (!saved && prefersDark)) {
        document.documentElement.setAttribute('data-theme', 'dark');
      }
      toggle?.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
        localStorage.setItem('cnTheme', isDark ? 'light' : 'dark');
      });
    })();

    // Footer year
    document.getElementById('year').textContent = new Date().getFullYear();

    // Active TOC link on scroll
    (function() {
      const sections = document.querySelectorAll('.legal-section[id]');
      const links = document.querySelectorAll('.toc-link');
      if (!sections.length || !links.length) return;

      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            links.forEach(l => l.classList.remove('active'));
            const active = [...links].find(l => l.getAttribute('href') === `#${entry.target.id}`);
            active?.classList.add('active');
          }
        });
      }, { rootMargin: '-20% 0px -70% 0px' });

      sections.forEach(s => observer.observe(s));
    })();