(function () {
  /* ============ 1. SCROLL-SCRUBBED VIDEO ============ */

  const video = document.querySelector('video');
  let current = 0,
    duration = 0;

  video.addEventListener('loadedmetadata', () => {
    duration = video.duration;
  });

  function loop() {
    requestAnimationFrame(loop);
    const dur = duration || video.duration;
    if (!dur) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    const target = progress * dur;
    current += (target - current) * 0.06; // lerp smoothing — very smooth
    if (Math.abs(target - current) < 0.01) current = target;
    if (video.readyState >= 2 && Math.abs(video.currentTime - current) > 0.001) video.currentTime = current;

    updateAboutReveal();
  }
  requestAnimationFrame(loop);

  /* ============ PRELOADER ============ */

  const preloader = document.getElementById('preloader');
  const preloaderText = document.getElementById('preloader-text');
  let hidden = false;

  function hidePreloader() {
    if (hidden) return;
    hidden = true;
    clearTimeout(fallbackTimer);
    preloader.classList.add('is-hidden');
    document.body.classList.add('is-loaded');
  }

  video.addEventListener('progress', () => {
    if (video.buffered.length && video.duration && isFinite(video.duration)) {
      const bufferedEnd = video.buffered.end(video.buffered.length - 1);
      const pct = Math.min(100, Math.round((bufferedEnd / video.duration) * 100));
      preloaderText.textContent = pct + '%';
    }
  });

  video.addEventListener('canplaythrough', hidePreloader);
  const fallbackTimer = setTimeout(hidePreloader, 6000);

  /* ============ 2. SCROLL-REVEAL SYSTEM ============ */

  const revealTargets = document.querySelectorAll('.reveal, .reveal-card');
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0, rootMargin: '0px 0px -8% 0px' }
  );
  revealTargets.forEach((el) => revealObserver.observe(el));

  /* ============ 5. ABOUT — SCROLL WORD REVEAL ============ */

  const aboutLines = [
    'Le meilleur code ne se voit pas.',
    'Il se ressent — dans la fluidité, /',
    'la clarté de chaque interaction,',
    'et ce qui reste après le clic.',
  ];

  const aboutText = document.getElementById('aboutText');
  aboutLines.forEach((line, i) => {
    const lineEl = aboutText.querySelector('[data-line="' + (i + 1) + '"]');
    line.split(' ').forEach((word, wi, arr) => {
      const span = document.createElement('span');
      span.className = 'w';
      span.textContent = word;
      lineEl.appendChild(span);
      if (wi < arr.length - 1) lineEl.appendChild(document.createTextNode(' '));
    });
  });

  const aboutWords = aboutText.querySelectorAll('.w');

  function updateAboutReveal() {
    const rect = aboutText.getBoundingClientRect();
    const vh = window.innerHeight;
    const start = vh * 0.85;
    const end = vh * 0.15;
    let progress = (start - rect.top) / (start - end);
    progress = Math.min(1, Math.max(0, progress));
    const revealCount = Math.round(progress * aboutWords.length);
    aboutWords.forEach((w, i) => {
      w.style.color = i < revealCount ? '#ffffff' : 'rgba(255, 255, 255, 0.35)';
    });
  }
  updateAboutReveal();

  /* ============ 6. SERVICES — HOVER/CLICK PANEL SWITCH ============ */

  const services = [
    {
      desc: 'On construit des applications web complètes — base de données, logique métier et interface — pensées pour tenir en production, pas juste pour la démo.',
      tags: ['Next.js', 'Node.js', 'Prisma'],
      images: ['images/service-fullstack-1.png', 'images/service-fullstack-2.png'],
    },
    {
      desc: "Des interfaces claires et sans friction — structure lisible, hiérarchie visuelle nette, et des interactions qui guident sans jamais distraire.",
      tags: ['Figma', 'Design System', 'Prototypage'],
      images: ['images/service-uiux-1.png', 'images/service-uiux-2.png'],
    },
  ];

  const svcImg1 = document.getElementById('svcImg1');
  const svcImg2 = document.getElementById('svcImg2');
  const svcDesc = document.getElementById('svcDesc');
  const svcTags = document.getElementById('svcTags');
  const svcRows = document.querySelectorAll('.svc-row');

  function setActiveService(index) {
    const svc = services[index];
    svcImg1.src = svc.images[0];
    svcImg2.src = svc.images[1];
    svcDesc.textContent = svc.desc;
    svcTags.innerHTML = '';
    svc.tags.forEach((tag) => {
      const pill = document.createElement('span');
      pill.className = 'tag-pill';
      pill.textContent = tag;
      svcTags.appendChild(pill);
    });
  }

  svcRows.forEach((row) => {
    const index = Number(row.getAttribute('data-index'));
    row.addEventListener('mouseenter', () => setActiveService(index));
    row.addEventListener('click', () => setActiveService(index));
  });

  setActiveService(0);

  /* ============ 9. NAV BUTTONS — ORBITING LIGHT PATH ============ */

  const orbitButtons = document.querySelectorAll('.talk-btn, .nav-btn');
  const setOrbitPath = (btn) => {
    const w = btn.offsetWidth;
    const h = btn.offsetHeight;
    btn.style.setProperty('--path', `path('M 0 0 H ${w} V ${h} H 0 V 0')`);
  };
  const setAllOrbitPaths = () => orbitButtons.forEach(setOrbitPath);
  setAllOrbitPaths();
  window.addEventListener('resize', setAllOrbitPaths);
})();

/* ============ 10. PROJETS — APERÇU VIDÉO (SURVOL) + LIGHTBOX (CLIC) ============ */
(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const thumbs = document.querySelectorAll('.pf-thumb--video');
  const modal = document.getElementById('pvModal');
  if (!thumbs.length || !modal) return;

  const player = document.getElementById('pvModalPlayer');
  const titleEl = document.getElementById('pvModalTitle');
  const closeBtn = modal.querySelector('.pv-modal__close');
  let lastFocus = null;

  thumbs.forEach((thumb) => {
    const vid = thumb.querySelector('.pf-thumb__video');
    let loaded = false;

    const ensureLoaded = () => {
      if (!loaded) {
        vid.load();
        loaded = true;
      }
    };
    const playPreview = () => {
      if (reduceMotion || !modal.hidden) return;
      ensureLoaded();
      thumb.classList.add('is-playing');
      const pr = vid.play();
      if (pr && pr.catch) pr.catch(() => thumb.classList.remove('is-playing'));
    };
    const stopPreview = () => {
      thumb.classList.remove('is-playing');
      vid.pause();
      try {
        vid.currentTime = 0;
      } catch (e) {
        /* noop */
      }
    };
    const open = () => {
      stopPreview();
      openModal(thumb);
    };

    thumb.addEventListener('mouseenter', playPreview);
    thumb.addEventListener('mouseleave', stopPreview);
    thumb.addEventListener('focus', playPreview);
    thumb.addEventListener('blur', stopPreview);
    thumb.addEventListener('click', open);
    thumb.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        open();
      }
    });
  });

  function openModal(thumb) {
    const slug = thumb.getAttribute('data-video');
    lastFocus = document.activeElement;

    player.innerHTML =
      '<source src="media/' + slug + '.webm" type="video/webm">' +
      '<source src="media/' + slug + '.mp4" type="video/mp4">';
    player.setAttribute('poster', 'media/' + slug + '.jpg');
    titleEl.textContent = thumb.getAttribute('data-title') || '';

    modal.hidden = false;
    document.body.classList.add('pv-lock');
    void modal.offsetWidth;
    modal.classList.add('is-open');

    player.load();
    const pr = player.play();
    if (pr && pr.catch) pr.catch(() => {});

    closeBtn.focus();
    document.addEventListener('keydown', onKey);
  }

  function closeModal() {
    modal.classList.remove('is-open');
    document.removeEventListener('keydown', onKey);
    player.pause();
    document.body.classList.remove('pv-lock');

    const finish = () => {
      if (modal.hidden) return;
      modal.hidden = true;
      player.removeAttribute('src');
      player.removeAttribute('poster');
      player.innerHTML = '';
      player.load();
    };
    modal.addEventListener('transitionend', finish, { once: true });
    setTimeout(finish, 400);

    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function onKey(e) {
    if (e.key === 'Escape') {
      closeModal();
      return;
    }
    if (e.key !== 'Tab') return;
    const stops = [closeBtn, player];
    const i = stops.indexOf(document.activeElement);
    if (e.shiftKey && i <= 0) {
      e.preventDefault();
      stops[stops.length - 1].focus();
    } else if (!e.shiftKey && i === stops.length - 1) {
      e.preventDefault();
      stops[0].focus();
    }
  }

  modal.querySelectorAll('[data-pv-close]').forEach((el) => {
    el.addEventListener('click', closeModal);
  });
})();
