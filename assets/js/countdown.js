/**
 * ============================================================
 * CONTADOR REGRESIVO BOTÁNICO - BODA FREDY & YANET
 * ============================================================
 */

(function () {
  'use strict';

  // Fecha del evento: 23 de Diciembre de 2026 a las 07:00 AM (Hora Perú / UTC-5)
  const EVENT_DATE = new Date('2026-12-23T07:00:00-05:00').getTime();

  function initCountdown() {
    const listD = document.querySelectorAll('#d, #countdown-days');
    const listH = document.querySelectorAll('#h, #countdown-hours');
    const listM = document.querySelectorAll('#m, #countdown-minutes');
    const listS = document.querySelectorAll('#s, #countdown-seconds');

    if (!listD.length && !listH.length && !listM.length && !listS.length) return;

    function update() {
      const now = Date.now();
      const diff = Math.max(0, EVENT_DATE - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const strD = String(days).padStart(2, '0');
      const strH = String(hours).padStart(2, '0');
      const strM = String(minutes).padStart(2, '0');
      const strS = String(seconds).padStart(2, '0');

      updateValues(listD, strD);
      updateValues(listH, strH);
      updateValues(listM, strM);
      updateValues(listS, strS);
    }

    function updateValues(elements, value) {
      elements.forEach(element => {
        if (element.textContent === value) return;
        element.textContent = value;

        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && typeof element.animate === 'function') {
          element.animate([
            { opacity: 0.35, transform: 'translateY(7px)', filter: 'blur(2px)' },
            { opacity: 1, transform: 'translateY(0)', filter: 'blur(0)' }
          ], { duration: 420, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
        }
      });
    }

    update();
    setInterval(update, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCountdown);
  } else {
    initCountdown();
  }
})();
