/**
 * NOOR — نور
 * script.js
 *
 * Handles:
 *  - Hover-triggered poem reveal with ink-bleed animation
 *  - Soft music play/pause on hover enter/leave
 *  - Graceful autoplay fallback with minimal pink play button
 */

(function () {
  'use strict';

  /* ── Element refs ────────────────────────────────────────── */
  const triggerZone   = document.getElementById('triggerZone');    // name block
  const photoWrap     = document.getElementById('photoWrap');       // photo wrapper
  const poemContainer = document.getElementById('poemContainer');
  const hoverHint     = document.getElementById('hoverHint');
  const bgMusic       = document.getElementById('bgMusic');
  const playBtn       = document.getElementById('playBtn');

  /* ── State ───────────────────────────────────────────────── */
  let musicUnlocked   = false;   // becomes true after first user interaction
  let autoplayBlocked = false;
  let leaveTimer      = null;    // debounce rapid hover-in/out

  /* ── Poem reveal ─────────────────────────────────────────── */
  function showPoem() {
    clearTimeout(leaveTimer);
    poemContainer.classList.add('visible');
    if (hoverHint) hoverHint.classList.add('hidden');
  }

  function hidePoem() {
    leaveTimer = setTimeout(() => {
      poemContainer.classList.remove('visible');
      if (hoverHint) hoverHint.classList.remove('hidden');
    }, 280); // small delay so crossing between triggers doesn't flicker
  }

  /* ── Music helpers ───────────────────────────────────────── */
  function fadeIn(audio, duration) {
    audio.volume = 0;
    const step   = 0.025;
    const target = 0.45;
    const delay  = (duration / (target / step));

    const ramp = setInterval(() => {
      if (audio.volume + step >= target) {
        audio.volume = target;
        clearInterval(ramp);
      } else {
        audio.volume += step;
      }
    }, delay);
  }

  function fadeOut(audio, duration) {
    const step  = 0.025;
    const delay = (duration / (audio.volume / step));

    const ramp = setInterval(() => {
      if (audio.volume - step <= 0) {
        audio.volume = 0;
        audio.pause();
        clearInterval(ramp);
      } else {
        audio.volume -= step;
      }
    }, delay);
  }

  function playMusic() {
    if (!bgMusic.src && !bgMusic.querySelector('source')) return; // no audio file

    if (bgMusic.paused) {
      const playPromise = bgMusic.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            musicUnlocked   = true;
            autoplayBlocked = false;
            playBtn.classList.remove('visible');
            fadeIn(bgMusic, 1800);
          })
          .catch(() => {
            // Autoplay blocked — show minimal fallback button
            autoplayBlocked = true;
            playBtn.classList.add('visible');
          });
      }
    }
  }

  function pauseMusic() {
    if (!bgMusic.paused) {
      fadeOut(bgMusic, 1400);
    }
  }

  /* ── Trigger zone: Name block ────────────────────────────── */
  triggerZone.addEventListener('mouseenter', () => {
    showPoem();
    playMusic();
  });

  triggerZone.addEventListener('mouseleave', () => {
    hidePoem();
    pauseMusic();
  });

  /* ── Trigger zone: Photo ─────────────────────────────────── */
  photoWrap.addEventListener('mouseenter', () => {
    showPoem();
    playMusic();
  });

  photoWrap.addEventListener('mouseleave', () => {
    hidePoem();
    pauseMusic();
  });

  /* ── Fallback play button ────────────────────────────────── */
  playBtn.addEventListener('click', () => {
    if (bgMusic.paused) {
      bgMusic.play().then(() => {
        musicUnlocked   = true;
        autoplayBlocked = false;
        fadeIn(bgMusic, 1800);
        playBtn.classList.remove('visible');
        // show poem on tap since user interacted
        showPoem();
      }).catch(() => {
        // still blocked — do nothing
      });
    } else {
      pauseMusic();
      playBtn.querySelector('.play-icon').textContent = '♪';
    }
  });

  /* ── Touch devices: auto-reveal poem on load ─────────────── */
  // CSS handles this via @media (hover: none), but we also
  // show the play button on first touch for music.
  window.addEventListener('touchstart', function unlockOnTouch() {
    if (!musicUnlocked && autoplayBlocked) {
      playBtn.classList.add('visible');
    }
    window.removeEventListener('touchstart', unlockOnTouch);
  }, { once: true });

  /* ── Elegant entrance: stagger petals ───────────────────────
     Petals are CSS-animated but start with opacity:0 in CSS,
     then we add a class to trigger them after load.         */
  window.addEventListener('load', () => {
    document.querySelectorAll('.petal').forEach((p, i) => {
      setTimeout(() => {
        p.style.animationPlayState = 'running';
      }, i * 800);
    });
  });

})();
