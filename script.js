/*
 * script.js — progressive enhancement for the receipt.
 * The page is complete without it: nothing below is needed to read,
 * select or navigate anything.
 */
(function () {
  'use strict';

  function run(name, fn) {
    try {
      fn();
    } catch (err) {
      if (window.console && console.warn) {
        console.warn('[fx] ' + name + ' failed', err);
      }
    }
  }

  function initCursor() {
    var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || calm) return;

    var dot = document.createElement('div');
    dot.className = 'cursor';
    dot.setAttribute('aria-hidden', 'true');
    document.body.appendChild(dot);

    // Only now is it safe to hide the native pointer.
    document.documentElement.classList.add('has-cursor');

    var x = window.innerWidth / 2;
    var y = window.innerHeight / 2;
    var queued = false;

    function paint() {
      queued = false;
      dot.style.setProperty('--cx', x + 'px');
      dot.style.setProperty('--cy', y + 'px');
    }

    document.addEventListener('pointermove', function (e) {
      x = e.clientX;
      y = e.clientY;
      dot.classList.add('is-live');
      if (!queued) {
        queued = true;
        requestAnimationFrame(paint);
      }
    }, { passive: true });

    document.addEventListener('pointerover', function (e) {
      var t = e.target;
      var hit = t && t.closest ? t.closest('a, summary, .btn') : null;
      dot.classList.toggle('is-hot', !!hit);
    }, { passive: true });

    document.addEventListener('pointerdown', function () {
      dot.classList.add('is-down');
    }, { passive: true });

    document.addEventListener('pointerup', function () {
      dot.classList.remove('is-down');
    }, { passive: true });

    document.addEventListener('pointerleave', function () {
      dot.classList.remove('is-live');
    });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) dot.classList.remove('is-live');
    });
  }

  function init() {
    run('cursor', initCursor);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
