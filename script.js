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

  /* Scrolling slips the press: --reg is the misregistration offset shared by
     the display type and the WebGL plate. It decays back to register at rest,
     so nothing is ever out of register while you are reading. */
  function initRegister() {
    var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Repainting large display type every scroll frame is far too expensive on
    // a phone, so the misregistration is a pointer-and-keyboard flourish only.
    var rich = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 900px)').matches;
    var root = document.documentElement;
    var fx = window.__fx || (window.__fx = { reg: 0 });
    if (calm || !rich) return;

    var reg = 0;
    var lastY = window.scrollY;
    var queued = false;

    function frame() {
      queued = false;
      var y = window.scrollY;
      var v = Math.abs(y - lastY);
      lastY = y;

      var target = Math.min(v * 0.09, 2.2);
      reg += (target - reg) * 0.28;
      if (Math.abs(reg) < 0.02) reg = 0;

      root.style.setProperty('--reg', reg.toFixed(2) + 'px');
      fx.reg = reg;

      if (reg) {
        queued = true;
        requestAnimationFrame(frame);
      }
    }

    function queue() {
      if (queued) return;
      queued = true;
      requestAnimationFrame(frame);
    }

    window.addEventListener('scroll', queue, { passive: true });
  }

  /* Sections and project rows rise once as they enter. The hidden state only
     exists after this runs, so with JS off nothing is ever invisible. */
  function initReveal() {
    var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (calm || !window.IntersectionObserver) return;

    var els = document.querySelectorAll('.block, .proj');
    if (!els.length) return;

    var io = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (!entries[i].isIntersecting) continue;
        entries[i].target.classList.add('is-in');
        io.unobserve(entries[i].target);
      }
    }, { rootMargin: '0px 0px -8% 0px' });

    for (var i = 0; i < els.length; i++) {
      els[i].setAttribute('data-reveal', '');
      io.observe(els[i]);
    }
    document.documentElement.classList.add('has-motion');
  }

  function initPrint() {
    var btn = document.querySelector('[data-print]');
    if (!btn) return;
    // Revealed only once the handler exists; without JS the PDF link stands in.
    btn.hidden = false;
    btn.addEventListener('click', function () {
      window.print();
    });
  }

  function init() {
    run('cursor', initCursor);
    run('reveal', initReveal);
    run('register', initRegister);
    run('print', initPrint);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
