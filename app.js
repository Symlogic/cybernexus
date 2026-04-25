/* UTILITIES */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* LOADER */
window.addEventListener('load', () => {
  const loader = $('#loader');
  if (!loader) return;
  setTimeout(() => {
    loader.classList.add('hidden');
    loader.addEventListener('transitionend', () => loader.remove(), { once: true });
  }, 1600);
});

/* DARK MODE TOGGLE */
(function initDarkMode() {
  const toggle = $('#darkToggle');
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

/* HEADER — sticky + scroll class */
(function initHeader() {
  const header = $('#header');
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* HAMBURGER MENU */
(function initHamburger() {
  const btn  = $('#hamburger');
  const menu = $('#mobile-menu');
  if (!btn || !menu) return;

  const toggle = (open) => {
    btn.classList.toggle('open', open);
    menu.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  };

  btn.addEventListener('click', () => toggle(!menu.classList.contains('open')));

  // Close on link click
  $$('a', menu).forEach(a => a.addEventListener('click', () => toggle(false)));

  // Close on outside click
  document.addEventListener('click', e => {
    if (menu.classList.contains('open') && !menu.contains(e.target) && !btn.contains(e.target)) {
      toggle(false);
    }
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('open')) toggle(false);
  });
})();

/* SCROLL REVEAL — Intersection Observer */
(function initReveal() {
  const items = $$('.reveal');
  if (!items.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Stagger siblings
          const siblings = $$('.reveal', entry.target.parentElement);
          const idx = siblings.indexOf(entry.target);
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, idx * 80);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  items.forEach(el => observer.observe(el));
})();

/* HERO CANVAS — Animated particle network */
(function initHeroCanvas() {
  const canvas = $('#heroCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles, animId;
  const PARTICLE_COUNT = 60;
  const MAX_DIST = 140;

  const isDark = () => document.documentElement.getAttribute('data-theme') === 'dark';

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function randomParticle() {
    return {
      x:   Math.random() * W,
      y:   Math.random() * H,
      vx:  (Math.random() - 0.5) * 0.35,
      vy:  (Math.random() - 0.5) * 0.35,
      r:   Math.random() * 2 + 1,
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: PARTICLE_COUNT }, randomParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const dark = isDark();
    const dotColor  = dark ? 'rgba(50,140,193,0.6)' : 'rgba(11,60,93,0.35)';
    const lineBase  = dark ? '50,140,193' : '11,60,93';

    particles.forEach((p, i) => {
      // Move
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;

      // Draw dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = dotColor;
      ctx.fill();

      // Draw connections
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          const alpha = (1 - dist / MAX_DIST) * 0.3;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(${lineBase},${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    });

    animId = requestAnimationFrame(draw);
  }

  init();
  draw();

  const ro = new ResizeObserver(() => { resize(); });
  ro.observe(canvas.parentElement);

  // Restart on theme change to adjust colors
  const mo = new MutationObserver(() => {});
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
})();

/* ANIMATED COUNTERS — Hero stats */
(function initCounters() {
  const statNums = $$('[data-target]');
  if (!statNums.length) return;

  const easeOut = t => 1 - Math.pow(1 - t, 3);

  function animateCounter(el) {
    const target = parseFloat(el.dataset.target);
    const duration = 1800;
    const start = performance.now();

    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const val = target * easeOut(progress);

      // Format: if target has decimal (like 99.9), keep 1 decimal
      el.textContent = target % 1 !== 0 ? val.toFixed(1) : Math.round(val);

      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animateCounter(e.target);
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });

  statNums.forEach(el => observer.observe(el));
})();

/* SERVICE EXPAND */
(function initServiceExpand() {
  $$('.service-expand').forEach(btn => {
    btn.addEventListener('click', () => {
      const card   = btn.closest('.service-card');
      const detail = card?.querySelector('.service-detail');
      if (!detail) return;

      const open = detail.classList.contains('open');
      detail.classList.toggle('open', !open);
      detail.setAttribute('aria-hidden', String(open));
      btn.setAttribute('aria-expanded', String(!open));
      btn.querySelector('svg').style.transform = open ? 'rotate(0deg)' : 'rotate(90deg)';
    });
  });
})();

/* STICKY MOBILE CTA — show after hero scroll*/
(function initStickyCta() {
  const cta  = $('#stickyCta');
  const hero = $('#hero');
  if (!cta || !hero) return;

  const observer = new IntersectionObserver(entries => {
    cta.classList.toggle('visible', !entries[0].isIntersecting);
    cta.setAttribute('aria-hidden', String(entries[0].isIntersecting));
  }, { threshold: 0 });

  observer.observe(hero);
})();

/* SMOOTH ANCHOR SCROLLING (offset for sticky header)*/
(function initSmoothScroll() {
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const id  = anchor.getAttribute('href').slice(1);
      const el  = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 72;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* ACTIVE NAV LINK — highlight on scroll */
(function initActiveNav() {
  const sections = $$('section[id]');
  const links    = $$('.nav-links a[href^="#"]');
  if (!sections.length || !links.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const active = links.find(l => l.getAttribute('href') === `#${entry.target.id}`);
        active?.classList.add('active');
      }
    });
  }, { rootMargin: '-30% 0px -60% 0px' });

  sections.forEach(s => observer.observe(s));
})();

/* FOOTER YEAR */
const yearEl = $('#year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* MICRO-INTERACTIONS — service card tilt on hover (desktop only) */
(function initCardTilt() {
  if (window.matchMedia('(hover: none)').matches) return;

  $$('.service-card, .why-card, .testimonial-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `translateY(-4px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

/* FAQ ACCORDION */
(function initFaq() {
  $$('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const answer  = btn.nextElementSibling;
      const isOpen  = btn.getAttribute('aria-expanded') === 'true';

      // Close all others
      $$('.faq-question').forEach(other => {
        other.setAttribute('aria-expanded', 'false');
        const a = other.nextElementSibling;
        a.classList.remove('open');
        a.hidden = true;
      });

      // Toggle current
      if (!isOpen) {
        btn.setAttribute('aria-expanded', 'true');
        answer.hidden = false;
        // Force reflow so transition fires
        answer.getBoundingClientRect();
        answer.classList.add('open');
      }
    });
  });
})();