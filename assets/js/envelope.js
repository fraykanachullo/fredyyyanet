/**
 * ============================================================
 * CONTROLADOR DE APERTURA DE CARTA NUPCIAL
 * Transición entre Pantalla 1 (Sobre) y Pantalla 2 (Landing)
 * Boda Fredy & Yanet
 * ============================================================
 */

(function () {
  'use strict';

  function initEnvelope() {
    const openBtn = document.getElementById('open-envelope-btn');
    const sealAssembly = document.getElementById('seal-assembly');
    const flap = document.getElementById('flap-triangle');
    const invitationCard = document.getElementById('invitation-card');
    const screenEnvelope = document.getElementById('screen-envelope');
    const screenLanding = document.getElementById('screen-landing');

    let isOpen = false;
    let transitionTimer = null;

    function requestFullscreen() {
      const root = document.documentElement;
      const request = root.requestFullscreen || root.webkitRequestFullscreen || root.msRequestFullscreen;

      if (request) {
        Promise.resolve(request.call(root)).catch(() => {
          // Algunos navegadores móviles no permiten pantalla completa.
        });
      }
    }

    // Campanilla ceremonial al quebrar el sello
    function playChime() {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // Re 5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.6); // La 5

        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 1.3);
      } catch (e) {
        // Fallback silencioso si el navegador lo restringe
      }
    }

    // 1. Abrir el sobre
    function openEnvelope() {
      if (isOpen) return;
      isOpen = true;

      requestFullscreen();

      // Reproducir sonido ceremonial
      playChime();

      // Iniciar automáticamente la música de fondo
      if (typeof window.startWeddingMusic === 'function') {
        window.startWeddingMusic();
      }

      // Abrir la solapa superior del sobre hacia arriba
      if (flap) {
        flap.style.transform = 'rotateX(180deg) translateY(-20px)';
        flap.style.opacity = '0.35';
      }

      // Ocultar suavemente el sello de cera
      if (sealAssembly) {
        sealAssembly.style.opacity = '0';
        sealAssembly.style.pointerEvents = 'none';
        sealAssembly.style.transform = 'scale(0.85)';
      }

      // Elevar la tarjeta interior desde el bolsillo del sobre
      setTimeout(() => {
        if (invitationCard) {
          invitationCard.style.opacity = '1';
          invitationCard.style.pointerEvents = 'auto';
          invitationCard.style.transform = 'translateY(-16px) scale(1.02)';
        }
      }, 400);

      // Transición automática suave a la Landing Page tras 3 segundos
      transitionTimer = setTimeout(() => {
        transitionToLanding();
      }, 3000);
    }

    // 2. Transición hacia la Landing Page (Pantalla 2)
    function transitionToLanding() {
      if (transitionTimer) clearTimeout(transitionTimer);

      if (!screenLanding || !screenEnvelope) return;

      // Activar pantalla 2 en el DOM
      screenLanding.style.display = 'block';

      // Permitir reflujo para animación
      requestAnimationFrame(() => {
        screenLanding.classList.add('landing-visible');
        screenEnvelope.classList.add('envelope-hidden');
      });

      // Retirar el sobre de la vista una vez terminada la animación
      setTimeout(() => {
        screenEnvelope.style.display = 'none';
        window.scrollTo({ top: 0, behavior: 'instant' });
      }, 850);
    }

    if (openBtn) {
      openBtn.addEventListener('click', openEnvelope);
    }
    if (sealAssembly) {
      sealAssembly.addEventListener('click', openEnvelope);
    }

    // Si el usuario toca la tarjeta abierta o el sobre para entrar de inmediato
    if (invitationCard) {
      invitationCard.addEventListener('click', function () {
        if (isOpen) {
          transitionToLanding();
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEnvelope);
  } else {
    initEnvelope();
  }
})();
