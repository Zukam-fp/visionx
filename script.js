(function () {
  /* ============ 1. SCROLL-SCRUBBED VIDEO ============ */

  const video = document.querySelector('video');
  let current = 0,
    duration = 0;

  video.addEventListener('loadedmetadata', () => {
    duration = video.duration;
  });

  // iOS Safari largely ignores preload="auto" for <video> until playback is
  // actually requested — without this, readyState never advances past 0 and
  // the scroll-scrub below has no frames to show (blank background on iPhone).
  const kickstartVideo = () => video.play().catch(() => {});
  kickstartVideo();
  document.addEventListener('touchstart', kickstartVideo, { once: true, passive: true });

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
      tags: [],
      images: ['images/service-uiux-1.png', 'images/service-uiux-2.png'],
    },
  ];

  const svcImg1 = document.getElementById('svcImg1');
  const svcImg2 = document.getElementById('svcImg2');
  const svcImgs = document.getElementById('svcImgs');
  const svcDesc = document.getElementById('svcDesc');
  const svcTags = document.getElementById('svcTags');
  const svcRows = document.querySelectorAll('.svc-row');

  function setActiveService(index) {
    const svc = services[index];
    svcImg1.src = svc.images[0];
    svcImg2.src = svc.images[1];
    if (svcImgs) svcImgs.dataset.active = String(index);
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

  /* ============ 7. PROJECT CARDS — HOVER PREVIEW + VIDEO MODAL ============ */

  const pfModal = document.getElementById('pfModal');
  const pfModalVideo = document.getElementById('pfModalVideo');
  const pfModalClose = document.getElementById('pfModalClose');
  const pfModalTitle = document.getElementById('pfModalTitle');

  function openProjectModal(src, poster, title) {
    if (!src || !pfModal) return;
    pfModalVideo.src = src;
    pfModalVideo.poster = poster || '';
    pfModalTitle.textContent = title || '';
    pfModal.classList.add('is-open');
    pfModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    pfModalVideo.currentTime = 0;
    pfModalVideo.play().catch(() => {});
  }

  function closeProjectModal() {
    if (!pfModal) return;
    pfModal.classList.remove('is-open');
    pfModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    pfModalVideo.pause();
    pfModalVideo.removeAttribute('src');
    pfModalVideo.load();
  }

  if (pfModal) {
    pfModalClose.addEventListener('click', closeProjectModal);
    pfModal.addEventListener('click', (e) => {
      if (e.target === pfModal) closeProjectModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && pfModal.classList.contains('is-open')) closeProjectModal();
    });
  }

  document.querySelectorAll('.pf-media[data-video]').forEach((media) => {
    const preview = media.querySelector('.pf-video');
    const videoSrc = media.getAttribute('data-video');
    const poster = media.getAttribute('data-poster');
    const title = media.closest('.pf-card')?.querySelector('.pf-title')?.textContent || '';

    preview?.addEventListener('playing', () => media.classList.add('is-playing'));

    media.addEventListener('mouseenter', () => {
      if (preview && !preview.src && preview.dataset.src) preview.src = preview.dataset.src;
      preview?.play().catch(() => {});
    });
    media.addEventListener('mouseleave', () => {
      media.classList.remove('is-playing');
      if (!preview) return;
      preview.pause();
      preview.currentTime = 0;
    });

    media.addEventListener('click', (e) => {
      e.preventDefault();
      openProjectModal(videoSrc, poster, title);
    });
  });

  /* ============ 7b. MOBILE MENU ============ */

  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenuClose = document.getElementById('mobileMenuClose');
  const mobileMenu = document.getElementById('mobileMenu');

  function openMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.add('is-open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    mobileMenuBtn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('mobile-menu-open');
  }

  function closeMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    mobileMenuBtn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('mobile-menu-open');
  }

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      if (mobileMenu.classList.contains('is-open')) closeMobileMenu();
      else openMobileMenu();
    });
    mobileMenuClose.addEventListener('click', closeMobileMenu);
    mobileMenu.querySelectorAll('.mobile-menu-link').forEach((link) => {
      link.addEventListener('click', closeMobileMenu);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) closeMobileMenu();
    });
  }

  /* ============ 8b. NAVBAR — HIDE ON SCROLL DOWN, SHOW ON SCROLL UP ============ */

  const topnav = document.getElementById('topnav');
  if (topnav) {
    let lastScrollY = window.scrollY;
    let ticking = false;

    function updateNavVisibility() {
      const currentScrollY = window.scrollY;
      const scrolledDown = currentScrollY > lastScrollY;
      const pastThreshold = currentScrollY > topnav.offsetHeight;

      if (scrolledDown && pastThreshold && !document.body.classList.contains('mobile-menu-open')) {
        topnav.classList.add('nav-hidden');
      } else {
        topnav.classList.remove('nav-hidden');
      }
      lastScrollY = currentScrollY;
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(updateNavVisibility);
        ticking = true;
      }
    });
  }

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
