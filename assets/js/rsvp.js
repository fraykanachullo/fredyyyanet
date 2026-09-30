/**
 * ============================================================
 * CONTROLADOR RSVP: GOOGLE SHEETS + WHATSAPP
 * Boda Fredy & Yanet
 * ============================================================
 */

(function () {
  'use strict';

  const GOOGLE_SHEET_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbypBi8uxVfPoipWdJR4_4SWaiCzon0zZo7asrK3DeCNSCpdUp7-bngs2HU4HOP-GEWpSA/exec';

  const WHATSAPP_PHONE = '51986372784';

  function initRSVP() {
    const form = document.getElementById('rsvp-form') || document.getElementById('f');
    if (!form) return;

    const nameEl = document.getElementById('rsvp-name') || document.getElementById('n');
    const phoneEl = document.getElementById('rsvp-phone') || document.getElementById('p');
    const phoneWrap = document.getElementById('rsvp-phone-container');
    const phoneRequiredMark = document.getElementById('rsvp-phone-required');
    const guestCountWrap = document.getElementById('rsvp-guest-count-container');
    const dietWrap = document.getElementById('rsvp-diet-container');
    const dietEl = document.getElementById('rsvp-diet') || document.getElementById('r');
    const attendanceRadios = form.querySelectorAll('input[name="attendance"], input[name="a"]');
    const guestSelect = document.getElementById('rsvp-guests') || document.getElementById('g');
    const companionWrap = document.getElementById('companion-names-container') || document.getElementById('companion-names-wrap');
    const companionInput = document.getElementById('rsvp-companion-names') || document.getElementById('cn');
    const statusEl = document.getElementById('rsvp-status');
    const submitBtn = form.querySelector('button[type="submit"]');

    function isAttending() {
      const selectedAttendance = form.querySelector('input[name="attendance"]:checked, input[name="a"]:checked');
      return Boolean(selectedAttendance && selectedAttendance.value === 'si');
    }

    function updateAttendanceFields() {
      const attending = isAttending();
      if (phoneEl) phoneEl.required = attending;
      if (phoneWrap) phoneWrap.classList.toggle('hidden', !attending);
      if (phoneRequiredMark) phoneRequiredMark.classList.toggle('hidden', !attending);
      if (guestCountWrap) guestCountWrap.classList.toggle('hidden', !attending);
      if (dietWrap) dietWrap.classList.toggle('hidden', !attending);

      if (!attending) {
        if (phoneEl) phoneEl.value = '';
        if (guestSelect) guestSelect.value = '0';
        if (dietEl) dietEl.value = '';
        if (companionInput) {
          companionInput.value = '';
          companionInput.required = false;
        }
      }

      updateCompanionVisibility();
    }

    function updateCompanionVisibility() {
      const hasCompanions = guestSelect && parseInt(guestSelect.value, 10) > 0;
      const visible = isAttending() && hasCompanions;
      if (companionWrap) companionWrap.classList.toggle('hidden', !visible);
      if (companionWrap) companionWrap.style.display = '';
      if (companionInput) {
        companionInput.required = Boolean(visible);
        if (!visible) companionInput.value = '';
      }
    }

    attendanceRadios.forEach(function (radio) {
      radio.addEventListener('change', updateAttendanceFields);
    });
    updateAttendanceFields();

    if (guestSelect && companionWrap) {
      guestSelect.addEventListener('change', updateCompanionVisibility);
    }

    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      if (submitBtn && submitBtn.disabled) return;

      const msgEl = document.getElementById('rsvp-message') || document.getElementById('t');
      const attendanceRadio = form.querySelector('input[name="attendance"]:checked') || form.querySelector('input[name="a"]:checked');

      const nombre = nameEl ? nameEl.value.trim() : '';
      const telefono = phoneEl ? phoneEl.value.trim() : '';
      const asistencia = attendanceRadio ? attendanceRadio.value : '';
      const acompanantes = guestSelect ? guestSelect.value : '0';
      const nombresAcompanantes = companionInput ? companionInput.value.trim() : '';
      const dieta = dietEl ? dietEl.value.trim() : '';
      const mensaje = msgEl ? msgEl.value.trim() : '';

      if (!nombre) {
        showStatus('Por favor, ingresa tu nombre completo.', true);
        if (nameEl) nameEl.focus();
        return;
      }

      if (!asistencia) {
        showStatus('Por favor, confirma si asistirás.', true);
        return;
      }

      if (asistencia === 'si' && !telefono) {
        showStatus('Por favor, ingresa tu teléfono o WhatsApp.', true);
        if (phoneEl) phoneEl.focus();
        return;
      }

      const asistenciaTexto = asistencia === 'si' ? 'Sí, asistiré con gusto' : 'No podré asistir';
      const payload = new URLSearchParams({
        nombre: nombre,
        telefono: telefono,
        asistencia: asistenciaTexto,
        acompanantes: acompanantes,
        nombresAcompanantes: nombresAcompanantes,
        dieta: dieta || 'Ninguna',
        mensaje: mensaje || 'Sin mensaje'
      });

      const personasTotal = parseInt(acompanantes, 10) + 1;
      let waText = 'Hola Fredy y Yanet, soy *' + nombre + '*. ';
      if (asistencia === 'si') {
        waText += 'Confirmo con mucha alegría mi asistencia a su boda (' + personasTotal + ' persona' + (personasTotal > 1 ? 's' : '') + ').';
        if (nombresAcompanantes) {
          waText += ' Acompañante(s): ' + nombresAcompanantes + '.';
        }
      } else {
        waText += 'Lamentablemente no podré asistir a su boda. Les deseo lo mejor en esta nueva etapa.';
      }
      if (dieta) waText += ' Restricciones alimentarias: ' + dieta + '.';
      if (mensaje) waText += ' Mensaje: "' + mensaje + '"';

      const whatsappText = encodeURIComponent(waText);
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      const waUrl = isMobile
        ? 'https://wa.me/' + WHATSAPP_PHONE + '?text=' + whatsappText
        : 'https://web.whatsapp.com/send?phone=' + WHATSAPP_PHONE + '&text=' + whatsappText;
      let whatsappTab = null;
      try {
        whatsappTab = window.open('about:blank', '_blank');
      } catch (error) {
        whatsappTab = null;
      }


      setLoading(true, submitBtn);
      hideStatus();

      try {
        const response = await fetch(GOOGLE_SHEET_WEBAPP_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
          },
          body: payload.toString(),
          redirect: 'follow'
        });

        if (response.type !== 'opaque') {
          const text = await response.text();
          let result = {};

          try {
            result = JSON.parse(text);
          } catch (error) {
            result = {};
          }

          if (!response.ok || result.result === 'error') {
            throw new Error(result.message || 'No se pudo guardar la confirmación.');
          }
        }

        if (whatsappTab) {
          whatsappTab.location.href = waUrl;
        }

        setLoading(false, submitBtn);
        showStatus('¡Gracias por confirmar tu asistencia! 💍❤️', false);
        form.reset();

        if (guestSelect) {
          guestSelect.value = '0';
        }
        updateAttendanceFields();

        if (statusEl) {
          statusEl.classList.remove('hidden', 'bg-red-50', 'text-error');
          statusEl.classList.add('bg-primary/5', 'text-primary');
        }

        // Ventana de confirmación con el nombre del invitado y el enlace a WhatsApp
        const modalOpened = typeof window.openRSVPModal === 'function'
          && window.openRSVPModal({ name: nombre, waUrl: waUrl });

        if (!modalOpened && !whatsappTab) {
          window.location.href = waUrl;
        }

      } catch (error) {
        console.error('Error al registrar asistencia:', error);
        if (whatsappTab) whatsappTab.close();
        setLoading(false, submitBtn);
        showStatus('No pudimos registrar tu confirmación. Por favor, inténtalo nuevamente.', true);
      }
    });
  }

  function setLoading(isLoading, btn) {
    if (!btn) return;

    if (isLoading) {
      btn.disabled = true;
      btn.dataset.prevHtml = btn.innerHTML;
      btn.innerHTML = '<span>Enviando...</span>';
      btn.style.opacity = '0.85';
      btn.style.cursor = 'wait';
    } else {
      btn.disabled = false;
      if (btn.dataset.prevHtml) {
        btn.innerHTML = btn.dataset.prevHtml;
      }
      btn.style.opacity = '1';
      btn.style.cursor = 'pointer';
    }
  }

  function showStatus(message, isError) {
    const statusEl = document.getElementById('rsvp-status');
    if (!statusEl) return;

    statusEl.textContent = message;
    statusEl.classList.remove('hidden');
    statusEl.style.display = 'block';

    if (isError) {
      statusEl.classList.remove('text-primary');
      statusEl.classList.add('text-error', 'bg-red-50');
    } else {
      statusEl.classList.remove('text-error', 'bg-red-50');
      statusEl.classList.add('text-primary');
    }
  }

  function hideStatus() {
    const statusEl = document.getElementById('rsvp-status');
    if (!statusEl) return;
    statusEl.classList.add('hidden');
    statusEl.style.display = 'none';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRSVP);
  } else {
    initRSVP();
  }
})();
