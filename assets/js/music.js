/**
 * ============================================================
 * REPRODUCTOR DE MÚSICA AMBIENTAL NUPCIAL
 * Boda Fredy & Yanet
 * ============================================================
 * Reproduce automáticamente la música de fondo al abrir la carta.
 * Permite cambiar la canción fácilmente reemplazando: "assets/audio/musica.mp3"
 */

(function () {
  'use strict';

  // Ruta del archivo MP3 de referencia (Canon in D / Vals Nupcial)
  // Para cambiar la canción, solo reemplaza el archivo en esta ruta:
  const AUDIO_SRC = 'assets/audio/musica.mp3';

  let audioElem = null;
  let audioCtx = null;
  let isPlaying = false;
  let intervalId = null;

  function initMusicPlayer() {
    if (AUDIO_SRC) {
      audioElem = new Audio(AUDIO_SRC);
      audioElem.loop = true;
      audioElem.volume = 0.65;
      audioElem.preload = 'auto';
    }

    // Vincular todos los botones de audio en la página
    const buttons = document.querySelectorAll('aside button, #mu, #sound-btn, .music-toggle-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', toggleMusic);
    });

    // Función global para iniciar la música al abrir la carta
    window.startWeddingMusic = function () {
      if (!isPlaying) {
        toggleMusic();
      }
    };
  }

  function toggleMusic() {
    if (AUDIO_SRC && audioElem) {
      if (!isPlaying) {
        audioElem.play().then(() => {
          isPlaying = true;
          updateButtons(true);
        }).catch(err => {
          console.warn('Audio MP3 no pudo reproducirse, activando sintetizador:', err);
          playWebAudioSynth();
        });
      } else {
        audioElem.pause();
        isPlaying = false;
        updateButtons(false);
      }
    } else {
      playWebAudioSynth();
    }
  }

  function playWebAudioSynth() {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    isPlaying = !isPlaying;
    updateButtons(isPlaying);

    const notes = [293.66, 369.99, 440.0, 554.37, 587.33, 440.0, 369.99];
    let noteIdx = 0;

    function playNote() {
      if (!isPlaying || !audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const now = audioCtx.currentTime;

      osc.type = 'triangle';
      osc.frequency.value = notes[noteIdx++ % notes.length];

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.04, now + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(now + 1.9);
    }

    if (isPlaying) {
      playNote();
      intervalId = setInterval(playNote, 1200);
    } else {
      if (intervalId) clearInterval(intervalId);
    }
  }

  function updateButtons(playing) {
    const circleBtn = document.getElementById('sound-btn');
    if (circleBtn) {
      if (playing) {
        circleBtn.classList.add('is-playing');
        circleBtn.classList.remove('is-paused');
        circleBtn.setAttribute('aria-label', 'Pausar música');
        circleBtn.setAttribute('title', 'Pausar música');
      } else {
        circleBtn.classList.remove('is-playing');
        circleBtn.classList.add('is-paused');
        circleBtn.setAttribute('aria-label', 'Reproducir música');
        circleBtn.setAttribute('title', 'Reproducir música');
      }
    }

    const buttons = document.querySelectorAll('.music-toggle-btn, #mu');
    buttons.forEach(btn => {
      const iconSpan = btn.querySelector('.material-symbols-outlined');
      if (iconSpan) {
        iconSpan.textContent = playing ? 'pause' : 'play_arrow';
      }
      btn.setAttribute('aria-label', playing ? 'Pausar música' : 'Reproducir música');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMusicPlayer);
  } else {
    initMusicPlayer();
  }
})();
