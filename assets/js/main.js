/**
 * ============================================================
 * INTERACCIONES PRINCIPALES Y SCROLL
 * Boda Fredy & Yanet
 * ============================================================
 */

(function () {
  'use strict';

  function init() {
    // Desplazamiento suave para anclas internas
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href && href.length > 1) {
          const target = document.querySelector(href);
          if (target) {
            e.preventDefault();
            target.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        }
      });
    });

    // Cerrar modal al hacer clic en el fondo oscuro o con Escape
    const modal = document.getElementById('rsvp-success-modal');
    if (modal) {
      modal.addEventListener('click', function (e) {
        if (e.target === modal) {
          window.closeRSVPModal();
        }
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') window.closeRSVPModal();
      });
    }

    initScrollReveals();
    initLivingText();
    initShimmerControls();
    initGoldDust();
  }

  function initLivingText() {
    document.querySelectorAll('#screen-landing main section h2, #screen-landing main section h3')
      .forEach((heading, index) => {
        heading.classList.add('living-text', 'gold-shimmer-text');
        heading.style.setProperty('--text-delay', `${(index % 3) * 140}ms`);
      });
  }

  function openRSVPModal(options) {
    const modal = document.getElementById('rsvp-success-modal');
    if (!modal) return false;

    const guestName = document.getElementById('modal-guest-name');
    if (guestName) {
      guestName.textContent = (options && options.name) || 'Invitado';
    }

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    return true;
  }

  function closeRSVPModal() {
    const modal = document.getElementById('rsvp-success-modal');
    if (!modal || !modal.classList.contains('active')) return;

    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
  }

  window.openRSVPModal = openRSVPModal;
  window.closeRSVPModal = closeRSVPModal;

  function initScrollReveals() {
    const sections = Array.from(document.querySelectorAll('#screen-landing main section'));
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    sections.forEach((section, index) => {
      section.classList.add('reveal-on-scroll');
      section.style.setProperty('--reveal-delay', `${Math.min(index * 55, 220)}ms`);
    });

    if (reducedMotion || !('IntersectionObserver' in window)) {
      sections.forEach(section => section.classList.add('is-visible'));
      return;
    }

    const landing = document.getElementById('screen-landing');
    const pending = new Set(sections);

    const observer = new IntersectionObserver((entries, activeObserver) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && pending.has(entry.target)) {
          revealSection(entry.target, activeObserver);
        }
      });
    }, { threshold: [0, 0.12], rootMargin: '0px 0px -6% 0px' });

    function revealSection(section, activeObserver) {
      if (!pending.has(section)) return;
      pending.delete(section);
      section.classList.add('is-visible');
      activeObserver.unobserve(section);
      if (!pending.size) stopFallback();
    }

    // Red de seguridad: revela secciones que ya cruzaron el viewport
    // (salto por anclas, scroll rápido o IntersectionObserver no confiable)
    function revealPassedSections() {
      if (!landing || !landing.classList.contains('landing-visible')) return;

      const limit = window.innerHeight * 0.94;
      Array.from(pending).forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.bottom <= 0 || rect.top < limit) {
          revealSection(section, observer);
        }
      });
    }

    function stopFallback() {
      window.removeEventListener('scroll', revealPassedSections);
      window.removeEventListener('resize', revealPassedSections);
      if (landingObserver) landingObserver.disconnect();
      fallbackTimer = clearInterval(fallbackTimer);
    }

    window.addEventListener('scroll', revealPassedSections, { passive: true });
    window.addEventListener('resize', revealPassedSections, { passive: true });

    // Reintentar mientras la landing permanezca oculta y al mostrarse
    let fallbackTimer = setInterval(revealPassedSections, 400);
    const landingObserver = new MutationObserver(revealPassedSections);
    if (landing) {
      landingObserver.observe(landing, { attributes: true, attributeFilter: ['class', 'style'] });
    }
    revealPassedSections();

    sections.forEach(section => observer.observe(section));
  }

  function initShimmerControls() {
    document.querySelectorAll('#open-envelope-btn, #screen-landing button, #screen-landing a[href]')
      .forEach(control => control.classList.add('gold-shimmer-control'));
  }

  function initGoldDust() {
    const canvas = document.getElementById('gold-dust');
    const landing = document.getElementById('screen-landing');
    const context = canvas && canvas.getContext('2d');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!canvas || !context || !landing || reducedMotion) return;

    const particles = [];
    const pointer = { x: -1000, y: -1000 };
    let width = 0;
    let height = 0;
    let frameId = 0;
    let running = false;

    function resize() {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      const particleCount = width < 640 ? 22 : 40;
      while (particles.length < particleCount) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: 0.45 + Math.random() * 1.1,
          speed: 0.08 + Math.random() * 0.24,
          drift: (Math.random() - 0.5) * 0.18,
          opacity: 0.18 + Math.random() * 0.42,
          phase: Math.random() * Math.PI * 2
        });
      }
      particles.length = particleCount;
    }

    function draw() {
      if (!running || document.hidden) return;
      context.clearRect(0, 0, width, height);

      particles.forEach(particle => {
        const deltaX = particle.x - pointer.x;
        const deltaY = particle.y - pointer.y;
        const distance = Math.hypot(deltaX, deltaY);

        particle.x += particle.drift;
        particle.y -= particle.speed;
        if (distance < 115 && distance > 0) {
          const influence = (1 - distance / 115) * 0.45;
          particle.x += (deltaX / distance) * influence;
          particle.y += (deltaY / distance) * influence;
        }
        if (particle.y < -4) {
          particle.y = height + 4;
          particle.x = Math.random() * width;
        }
        if (particle.x < -4) particle.x = width + 4;
        if (particle.x > width + 4) particle.x = -4;

        particle.phase += 0.012;
        const opacity = particle.opacity * (0.62 + Math.sin(particle.phase) * 0.38);
        context.beginPath();
        context.fillStyle = `rgba(243, 226, 179, ${opacity})`;
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fill();
      });

      frameId = window.requestAnimationFrame(draw);
    }

    function start() {
      if (running || document.hidden || !landing.classList.contains('landing-visible')) return;
      running = true;
      resize();
      frameId = window.requestAnimationFrame(draw);
    }

    function stop() {
      running = false;
      window.cancelAnimationFrame(frameId);
    }

    const landingObserver = new MutationObserver(start);
    landingObserver.observe(landing, { attributes: true, attributeFilter: ['class'] });
    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('pointermove', event => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
    }, { passive: true });
    window.addEventListener('pointerleave', () => {
      pointer.x = -1000;
      pointer.y = -1000;
    }, { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
      else start();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
