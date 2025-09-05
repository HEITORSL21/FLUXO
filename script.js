// script.js — versão endurecida e com logs para debug

// Helpers
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
const safeLog = (...args) => { if (window.location.search.includes('debug')) console.log('[fluxo]', ...args); };

// ===== Loader =====
window.addEventListener('load', () => {
  const loader = $('#site-loader');
  if (loader) {
    loader.style.opacity = '0';
    setTimeout(() => {
      try { loader.remove(); } catch(e){ safeLog('loader remove error', e); }
    }, 600);
  } else safeLog('loader not found');
});

// ===== Particles.js (inicialização segura) =====
try {
  if (window.particlesJS || window.pJSDom) {
    // use particlesJS safely
    (window.particlesJS || window.pJSDom) && particlesJS('particles-js', {
      particles: {
        number: { value: 60 },
        color: { value: ['#00D9FF','#8A2BE2'] },
        shape: { type: 'circle' },
        opacity: { value: 0.5, random: true },
        size: { value: 3, random: true },
        line_linked: { enable: true, distance: 160, color: '#00D9FF', opacity: 0.08, width: 1 },
        move: { enable: true, speed: 1.6 }
      }
    });
    safeLog('particlesJS inicializado');
  } else {
    safeLog('particlesJS não carregado — pular inicialização');
  }
} catch (err) { console.error('[fluxo] particles init error', err); }

// ===== Mobile menu toggle (defensivo) =====
try {
  const menuToggle = $('#menu-toggle');
  const mobileMenu = $('#mobile-menu');
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!expanded));
      mobileMenu.classList.toggle('hidden');
      mobileMenu.setAttribute('aria-hidden', String(expanded));
    });
  } else safeLog('menuToggle ou mobileMenu não encontrados');
} catch (err) { console.error('[fluxo] mobile menu error', err); }

// THEME TOGGLE aprimorado — substitua a versão anterior por esta
(() => {
  const btn = document.getElementById('theme-toggle');
  const metaTheme = document.querySelector('meta[name="theme-color"]') || (() => {
    const m = document.createElement('meta');
    m.name = 'theme-color';
    document.head.appendChild(m);
    return m;
  })();

  const applyTheme = (theme) => {
    // adiciona classe para permitir transição suave
    document.documentElement.classList.add('theme-transition');
    document.body.classList.add('theme-transition');
    // set theme
    document.documentElement.setAttribute('data-theme', theme);
    // update meta theme-color for mobile UI
    const color = theme === 'light' ? getComputedStyle(document.documentElement).getPropertyValue('--meta-theme').trim() : getComputedStyle(document.documentElement).getPropertyValue('--meta-theme').trim();
    metaTheme.content = color || (theme === 'light' ? '#F6F7FB' : '#0A0A0A');
    // persist
    localStorage.setItem('site-theme', theme);
    // toggle ARIA & icon
    if (btn) {
      btn.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
      btn.innerHTML = theme === 'light' ? '☀️' : '🌙';
    }
    // remove transition class shortly to avoid global transition side-effects
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transition');
      document.body.classList.remove('theme-transition');
    }, 340);
  };

  // load initial
  const saved = localStorage.getItem('site-theme');
  if (saved) applyTheme(saved);
  else {
    const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    applyTheme(prefersLight ? 'light' : 'dark');
  }

  if (btn) btn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(current);
  });
})();

// ===== VanillaTilt init (checagem) =====
try {
  if (window.VanillaTilt && $$("[data-tilt]").length) {
    VanillaTilt.init(document.querySelectorAll("[data-tilt]"), { max: 12, speed: 450, glare: true, "max-glare": 0.18 });
    safeLog('VanillaTilt init');
  } else safeLog('VanillaTilt ou elementos data-tilt ausentes');
} catch (err) { console.error('[fluxo] vanillatilt init error', err); }

// ===== Scroll reveal (IntersectionObserver) =====
try {
  const revealEls = Array.from(document.querySelectorAll('.service-card, .portfolio-item, .stat-card, .carousel, .glass-card'));
  if (revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = 1;
          entry.target.style.transform = 'translateY(0) scale(1)';
          entry.target.classList.add('revealed');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealEls.forEach((el, idx) => {
      el.style.opacity = 0;
      el.style.transform = 'translateY(20px) scale(.995)';
      el.style.transition = `opacity .7s ease ${idx * 80}ms, transform .7s ease ${idx * 80}ms`;
      io.observe(el);
    });
    safeLog('Scroll reveal observado', revealEls.length);
  } else safeLog('nenhum elemento para reveal');
} catch (err) { console.error('[fluxo] scroll reveal error', err); }

// ===== Skillbars (animate on view) =====
try {
  const skillbars = Array.from(document.querySelectorAll('.skillbar'));
  if (skillbars.length) {
    const sbObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const value = e.target.dataset.value || 70;
          const fill = e.target.querySelector('.skillbar-fill');
          if (fill) fill.style.width = value + '%';
          sbObserver.unobserve(e.target);
        }
      });
    }, { threshold: 0.25 });
    skillbars.forEach(s => sbObserver.observe(s));
    safeLog('skillbars observadas', skillbars.length);
  }
} catch (err) { console.error('[fluxo] skillbars error', err); }

// ===== Counters (safe) =====
try {
  const counters = Array.from(document.querySelectorAll('.stat-value'));
  if (counters.length) {
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = +el.dataset.target || 100;
          let current = 0;
          const step = Math.max(1, Math.floor(target / 120));
          const inc = () => {
            current += step;
            if (current >= target) el.textContent = target;
            else { el.textContent = current; requestAnimationFrame(inc); }
          };
          inc();
          countObserver.unobserve(el);
        }
      });
    }, { threshold: 0.3 });
    counters.forEach(c => countObserver.observe(c));
    safeLog('counters observados', counters.length);
  }
} catch (err) { console.error('[fluxo] counters error', err); }

// ===== Carousel (defensivo) =====
try {
  const carousel = document.querySelector('.carousel');
  const track = carousel ? carousel.querySelector('.carousel-track') : null;
  const prevBtn = carousel ? carousel.querySelector('.prev') : null;
  const nextBtn = carousel ? carousel.querySelector('.next') : null;
  const slides = track ? Array.from(track.children) : [];

  let slideIndex = 0;
  const showSlide = (i) => {
    if (!track || slides.length === 0) return;
    slideIndex = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${slideIndex * 100}%)`;
  };

  if (prevBtn) prevBtn.addEventListener('click', () => showSlide(slideIndex - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => showSlide(slideIndex + 1));

  if (slides.length > 1) {
    const autoplay = setInterval(() => showSlide(slideIndex + 1), 6000);
    // clear on unload
    window.addEventListener('beforeunload', () => clearInterval(autoplay));
    safeLog('carousel OK, slides=', slides.length);
  } else safeLog('carousel sem slides suficientes');
} catch (err) { console.error('[fluxo] carousel error', err); }

// ===== Portfolio Lightbox (seguro) =====
try {
  const lb = $('#lightbox');
  const lbImg = $('#lightbox-img');
  const lbClose = $('#lightbox-close');
  const items = Array.from(document.querySelectorAll('.portfolio-item'));

  if (items.length && lb && lbImg) {
    items.forEach(item => {
      item.addEventListener('click', () => {
        const url = item.dataset.media || item.querySelector('img')?.src;
        if (url) {
          lbImg.src = url;
          lb.classList.remove('hidden');
          lb.setAttribute('aria-hidden', 'false');
        } else safeLog('portfolio-item sem data-media ou img');
      });
    });

    lbClose && lbClose.addEventListener('click', () => {
      lb.classList.add('hidden');
      lb.setAttribute('aria-hidden', 'true');
      lbImg.src = '';
    });

    lb.addEventListener('click', (e) => {
      if (e.target === lb) {
        lb.classList.add('hidden');
        lb.setAttribute('aria-hidden', 'true');
        lbImg.src = '';
      }
    });

    safeLog('lightbox init items=', items.length);
  } else safeLog('lightbox ou items ausentes');
} catch (err) { console.error('[fluxo] lightbox error', err); }

// ===== Back to top =====
try {
  const backBtn = $('#back-to-top');
  if (backBtn) {
    const onScroll = () => {
      if (window.scrollY > 400) backBtn.classList.remove('hidden'); else backBtn.classList.add('hidden');
    };
    window.addEventListener('scroll', onScroll);
    backBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    safeLog('back-to-top init');
  } else safeLog('back-to-top not found');
} catch (err) { console.error('[fluxo] back-to-top error', err); }

// ===== Lottie hero control (safely) =====
try {
  const heroPlayer = $('#heroLottie');
  if (heroPlayer) {
    const lio = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          heroPlayer.play && heroPlayer.play();
        } else {
          heroPlayer.pause && heroPlayer.pause();
        }
      });
    }, { threshold: 0.25 });
    lio.observe(heroPlayer);
    safeLog('hero lottie observer set');
  } else safeLog('heroLottie not found');
} catch (err) { console.error('[fluxo] hero lottie error', err); }

// Final
safeLog('script.js carregado');
