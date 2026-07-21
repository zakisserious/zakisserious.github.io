/* ========================================
   SCRIPT — Portfolio Core Logic
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.remove('loading');

  // Pre-fill hero name with scrambled text immediately
  const glitchEl = document.querySelector('.hero-name-glitch');
  if (glitchEl) {
    const chars = '!@#$%^&*0123456789ABCDEF';
    const text = glitchEl.textContent;
    const scrambled = text.split('').map((c) => c === ' ' ? ' ' : chars[Math.floor(Math.random() * chars.length)]).join('');
    glitchEl.textContent = scrambled;
    glitchEl.setAttribute('data-text', scrambled);
  }

  animateLoader();
  initUptime();

  setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader) loader.classList.add('dismissed');
  }, 4000);

  setTimeout(initPage, 4500);

  function animateLoader() {
    const lines = document.querySelectorAll('.loader-line');
    const progress = document.getElementById('loader-progress');
    const progressBar = document.getElementById('loader-progress-bar');
    lines.forEach((line, i) => {
      const delay = 300 + i * 550;
      line.style.setProperty('--fallback-delay', delay + 'ms');
      setTimeout(() => {
        line.classList.add('visible');
      }, delay);
    });
    if (progress) {
      setTimeout(() => progress.classList.add('visible'), 500);
    }
    if (progressBar) {
      setTimeout(() => { progressBar.style.width = '100%'; }, 600);
    }
  }

  function initPage() {
    initCursor();

    try {
      if (typeof gsap !== 'undefined') {
        if (typeof ScrollTrigger !== 'undefined') {
          gsap.registerPlugin(ScrollTrigger);
        }
        initSmoothScroll();
        initNavScroll();
        initHamburger();
        initTyped();
        initHeroNameScramble();
        initScrollAnimations();
        initHorizontalScroll();
        initMagnetic();
        initToolboxTags();
        initProjectHovers();
        initSectionScanLines();
        initTypingLabels();
        initHeroParallax();
        initGlitchFlicker();
        initHeadingGlitch();
        initTextScramble();
        initSectionFlash();
        initNavFlicker();
        initCardTilt();
        initStatusSimulation();
        initTerminalOutput();
        initCursorSpotlight();
        initScrollProgress();
        initHoverScramble();
      } else {
        initNavScroll();
        initHamburger();
        initHeroNameScramble();
        document.querySelectorAll('.reveal, .section-heading').forEach(el => {
          el.style.opacity = '1';
          el.style.transform = 'none';
        });
      }
    } catch (e) {
      console.warn('Init error:', e);
      document.querySelectorAll('.reveal, .section-heading').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    }
  }

  // --- Uptime Counter ---
  function initUptime() {
    const el = document.getElementById('uptime');
    if (!el) return;
    const start = Date.now();
    function update() {
      const diff = Math.floor((Date.now() - start) / 1000);
      const h = String(Math.floor(diff / 3600)).padStart(2, '0');
      const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
      const s = String(diff % 60).padStart(2, '0');
      el.textContent = 'UPTIME: ' + h + ':' + m + ':' + s;
      requestAnimationFrame(update);
    }
    update();
  }

  // --- Smooth Scroll (Lenis) ---
  function initSmoothScroll() {
    if (typeof Lenis === 'undefined') return;
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          lenis.scrollTo(target, { offset: -60 });
          const mobileMenu = document.getElementById('mobile-menu');
          const hamburger = document.getElementById('hamburger');
          if (mobileMenu && mobileMenu.classList.contains('open')) {
            mobileMenu.classList.remove('open');
            hamburger.classList.remove('open');
            hamburger.setAttribute('aria-expanded', 'false');
          }
        }
      });
    });
  }

  // --- Nav Scroll ---
  function initNavScroll() {
    const nav = document.getElementById('nav');
    if (!nav) return;
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
  }

  // --- Hamburger ---
  function initHamburger() {
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    if (!hamburger || !mobileMenu) return;
    hamburger.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', open);

      // Staggered link animation
      if (open && typeof gsap !== 'undefined') {
        const links = mobileMenu.querySelectorAll('.mobile-link');
        gsap.fromTo(links,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
            stagger: 0.08,
            ease: 'power2.out',
            delay: 0.15,
          }
        );
      }
    });
  }

  // --- Typed.js ---
  function initTyped() {
    if (typeof Typed === 'undefined') return;
    new Typed('.auto_type', {
      strings: ['Full-Stack Developer.', 'AI Enthusiast.', 'Blockchain Builder.', 'Problem Solver.'],
      typeSpeed: 55,
      backSpeed: 30,
      backDelay: 1800,
      loop: true,
      showCursor: true,
      cursorChar: '|',
    });
  }

  // --- Hero Name Scramble Effect ---
  function initHeroNameScramble() {
    const glitchEl = document.querySelector('.hero-name-glitch');
    const nameEl = document.getElementById('hero-name');
    if (!glitchEl || !nameEl) return;

    const chars = '!@#$%^&*0123456789ABCDEF';
    const originalText = glitchEl.getAttribute('data-text');

    nameEl.style.opacity = '1';
    let iteration = 0;

    const interval = setInterval(() => {
      const newText = originalText
        .split('')
        .map((char, index) => {
          if (index < iteration) return originalText[index];
          if (char === ' ') return ' ';
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join('');

      glitchEl.textContent = newText;
      glitchEl.setAttribute('data-text', newText);

      iteration += 1;
      if (iteration >= originalText.length) {
        clearInterval(interval);
        glitchEl.textContent = originalText;
        glitchEl.setAttribute('data-text', originalText);
      }
    }, 25);
  }

  // --- Scroll Reveal Animations ---
  function initScrollAnimations() {
    if (typeof gsap === 'undefined') return;
    document.querySelectorAll('.reveal').forEach((el) => {
      gsap.fromTo(el,
        { opacity: 0, y: 25 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
            once: true,
          },
        }
      );
    });

    document.querySelectorAll('.section-heading').forEach((heading) => {
      gsap.fromTo(heading,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: heading,
            start: 'top 85%',
            once: true,
          },
        }
      );
    });

    document.querySelectorAll('.stat-number').forEach((num) => {
      const target = parseInt(num.getAttribute('data-target'), 10);
      if (isNaN(target)) return;
      gsap.fromTo(num,
        { textContent: 0 },
        {
          textContent: target,
          duration: 1.5,
          ease: 'power1.out',
          snap: { textContent: 1 },
          scrollTrigger: {
            trigger: num,
            start: 'top 88%',
            once: true,
          },
        }
      );
    });
  }

  // --- Custom Cursor with Multi-Dot Trail ---
  function initCursor() {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) {
      const dot = document.getElementById('cursor-dot');
      const trail = document.getElementById('cursor-trail');
      if (dot) dot.style.display = 'none';
      if (trail) trail.style.display = 'none';
      for (let i = 1; i <= 5; i++) {
        const el = document.getElementById('trail-' + i);
        if (el) el.style.display = 'none';
      }
      return;
    }

    const dot = document.getElementById('cursor-dot');
    const trail = document.getElementById('cursor-trail');
    const cursorImage = document.getElementById('cursor-image');
    const cursorImgEl = document.getElementById('cursor-img-el');
    if (!dot || !trail) return;

    const trailDots = [];
    for (let i = 1; i <= 5; i++) {
      const el = document.getElementById('trail-' + i);
      if (el) trailDots.push({ el, x: window.innerWidth / 2, y: window.innerHeight / 2 });
    }

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let trailX = mouseX;
    let trailY = mouseY;

    dot.style.left = mouseX + 'px';
    dot.style.top = mouseY + 'px';
    trail.style.left = mouseX + 'px';
    trail.style.top = mouseY + 'px';
    trailDots.forEach(td => { td.x = mouseX; td.y = mouseY; td.el.style.left = mouseX + 'px'; td.el.style.top = mouseY + 'px'; });

    if (cursorImage) {
      cursorImage.style.left = mouseX + 'px';
      cursorImage.style.top = mouseY + 'px';
    }

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = mouseX + 'px';
      dot.style.top = mouseY + 'px';
      if (cursorImage) {
        cursorImage.style.left = mouseX + 'px';
        cursorImage.style.top = mouseY + 'px';
      }
    });

    const lerpFactors = [0.18, 0.12, 0.08, 0.05, 0.03];

    function animateTrail() {
      trailX += (mouseX - trailX) * 0.15;
      trailY += (mouseY - trailY) * 0.15;
      trail.style.left = trailX + 'px';
      trail.style.top = trailY + 'px';

      trailDots.forEach((td, i) => {
        td.x += (mouseX - td.x) * lerpFactors[i];
        td.y += (mouseY - td.y) * lerpFactors[i];
        td.el.style.left = td.x + 'px';
        td.el.style.top = td.y + 'px';
      });

      requestAnimationFrame(animateTrail);
    }
    animateTrail();

    document.querySelectorAll('a, button, .magnetic, .toolbox-tag, .btn').forEach((el) => {
      el.addEventListener('mouseenter', () => dot.classList.add('hover'));
      el.addEventListener('mouseleave', () => dot.classList.remove('hover'));
    });

    document.querySelectorAll('[data-cursor="read"]').forEach((el) => {
      el.addEventListener('mouseenter', () => dot.classList.add('read'));
      el.addEventListener('mouseleave', () => dot.classList.remove('read'));
    });

    // Project hover — track mousemove to hide image when over buttons
    document.querySelectorAll('.project-slide, .project-text-card').forEach((card) => {
      let isOverCard = false;

      card.addEventListener('mouseenter', (e) => {
        if (e.target.closest('.project-links') || e.target.closest('a') || e.target.closest('button')) return;
        isOverCard = true;
        const img = card.getAttribute('data-image');
        if (img && cursorImage && cursorImgEl) {
          cursorImgEl.src = img;
          cursorImage.classList.add('visible');
          dot.classList.add('hide');
        }
      });

      card.addEventListener('mousemove', (e) => {
        const overLinks = e.target.closest('.project-links') || e.target.closest('a') || e.target.closest('button');
        if (overLinks) {
          if (cursorImage) cursorImage.classList.remove('visible');
          dot.classList.remove('hide');
          isOverCard = false;
        } else if (!isOverCard) {
          isOverCard = true;
          const img = card.getAttribute('data-image');
          if (img && cursorImage && cursorImgEl) {
            cursorImgEl.src = img;
            cursorImage.classList.add('visible');
            dot.classList.add('hide');
          }
        }
      });

      card.addEventListener('mouseleave', () => {
        isOverCard = false;
        if (cursorImage) cursorImage.classList.remove('visible');
        if (cursorImgEl) cursorImgEl.src = '';
        dot.classList.remove('hide');
      });
    });
  }

  // --- Horizontal Scroll (touch-friendly) ---
  function initHorizontalScroll() {
    if (typeof gsap === 'undefined') return;
    const track = document.getElementById('projects-track');
    const wrapper = document.getElementById('projects-wrapper');
    if (!track || !wrapper) return;

    const isMobile = window.innerWidth < 768;

    if (isMobile) {
      // On mobile: make track horizontally scrollable with native touch
      wrapper.style.overflowX = 'auto';
      wrapper.style.webkitOverflowScrolling = 'touch';
      wrapper.style.scrollSnapType = 'x mandatory';
      track.style.display = 'flex';
      track.style.width = 'max-content';

      // Add snap to slides
      track.querySelectorAll('.project-slide, .project-text-card').forEach(card => {
        card.style.scrollSnapAlign = 'start';
      });
      return;
    }

    // Desktop: GSAP pin + scrub
    const totalWidth = track.scrollWidth;
    const viewWidth = wrapper.offsetWidth;

    gsap.to(track, {
      x: () => -(totalWidth - viewWidth),
      ease: 'none',
      scrollTrigger: {
        trigger: wrapper,
        start: 'top 100px',
        end: () => `+=${totalWidth - viewWidth + 300}`,
        scrub: 1,
        pin: true,
        invalidateOnRefresh: true,
      },
    });
  }

  // --- Magnetic Buttons ---
  function initMagnetic() {
    if (typeof gsap === 'undefined') return;
    if ('ontouchstart' in window) return;
    document.querySelectorAll('.magnetic').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(el, { x: x * 0.3, y: y * 0.3, duration: 0.4, ease: 'power2.out' });
      });
      el.addEventListener('mouseleave', () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
      });
    });
  }

  // --- Toolbox Tags Animation ---
  function initToolboxTags() {
    if (typeof gsap === 'undefined') return;
    document.querySelectorAll('.toolbox-row').forEach((row) => {
      const tags = row.querySelectorAll('.toolbox-tag');
      gsap.fromTo(tags,
        { opacity: 0, y: 15, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.4,
          stagger: 0.05,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: row,
            start: 'top 88%',
            once: true,
          },
        }
      );
    });
  }

  // --- Project Hover Effects ---
  function initProjectHovers() {
    if (typeof gsap === 'undefined') return;
    document.querySelectorAll('.project-slide').forEach((slide) => {
      const img = slide.querySelector('.project-image img');
      const badge = slide.querySelector('.project-image-badge');
      slide.addEventListener('mouseenter', () => {
        if (img) gsap.to(img, { scale: 1.05, duration: 0.5, ease: 'power2.out' });
        if (badge) gsap.to(badge, { opacity: 1, y: 0, duration: 0.3 });
      });
      slide.addEventListener('mouseleave', () => {
        if (img) gsap.to(img, { scale: 1, duration: 0.5, ease: 'power2.out' });
        if (badge) gsap.to(badge, { opacity: 0, y: 10, duration: 0.3 });
      });
    });
  }

  // --- Section Scan Lines ---
  function initSectionScanLines() {
    if (typeof gsap === 'undefined') return;
    document.querySelectorAll('.section-scan-line').forEach((line) => {
      gsap.to(line, {
        scrollTrigger: {
          trigger: line.parentElement,
          start: 'top 70%',
          once: true,
          onEnter: () => line.classList.add('active'),
        },
      });
    });
  }

  // --- Typing Labels (character-by-character) ---
  function initTypingLabels() {
    if (typeof gsap === 'undefined') return;
    document.querySelectorAll('.section-label').forEach((label) => {
      const originalText = label.textContent;
      label.textContent = '';
      label.style.visibility = 'visible';

      const textSpan = document.createElement('span');
      label.appendChild(textSpan);

      ScrollTrigger.create({
        trigger: label,
        start: 'top 90%',
        once: true,
        onEnter: () => {
          let i = 0;
          function typeChar() {
            if (i < originalText.length) {
              textSpan.textContent += originalText.charAt(i);
              i++;
              setTimeout(typeChar, 40 + Math.random() * 30);
            }
          }
          typeChar();
        },
      });
    });
  }

  // --- Hero Parallax on Mouse Move ---
  function initHeroParallax() {
    if ('ontouchstart' in window) return;
    const hero = document.getElementById('hero');
    const photoWrap = hero ? hero.querySelector('.hero-photo-wrap') : null;
    const floatingCodes = hero ? hero.querySelectorAll('.hero-floating-code') : [];
    const binaryFloats = hero ? hero.querySelectorAll('.binary-float') : [];
    if (!hero) return;

    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      if (photoWrap && typeof gsap !== 'undefined') {
        gsap.to(photoWrap, {
          x: x * 15,
          y: y * 15,
          duration: 0.6,
          ease: 'power2.out',
        });
      }

      floatingCodes.forEach((code, i) => {
        if (typeof gsap !== 'undefined') {
          gsap.to(code, {
            x: x * (10 + i * 5),
            y: y * (8 + i * 3),
            duration: 0.8,
            ease: 'power2.out',
          });
        }
      });

      binaryFloats.forEach((code, i) => {
        if (typeof gsap !== 'undefined') {
          gsap.to(code, {
            x: x * (6 + i * 3),
            y: y * (5 + i * 2),
            duration: 1,
            ease: 'power2.out',
          });
        }
      });
    });
  }

  // --- Random Glitch Flicker on Hero Name ---
  function initGlitchFlicker() {
    const glitchEl = document.querySelector('.hero-name-glitch');
    if (!glitchEl) return;

    function doGlitch() {
      glitchEl.style.animation = 'glitchFlicker 0.15s ease-in-out';
      setTimeout(() => {
        glitchEl.style.animation = '';
      }, 150);
      setTimeout(doGlitch, 3000 + Math.random() * 5000);
    }
    setTimeout(doGlitch, 5000);
  }

  // --- Section Heading Glitch on Scroll Enter ---
  function initHeadingGlitch() {
    if (typeof gsap === 'undefined') return;
    document.querySelectorAll('.section-heading').forEach((heading) => {
      ScrollTrigger.create({
        trigger: heading,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          heading.style.animation = 'glitchText 0.3s ease-in-out';
          setTimeout(() => {
            heading.style.animation = '';
          }, 300);
        },
      });
    });
  }

  // --- Text Scramble Effect on Section Headings ---
  function initTextScramble() {
    if (typeof gsap === 'undefined') return;
    const chars = '!@#$%^&*0123456789ABCDEF';

    document.querySelectorAll('.section-heading').forEach((heading) => {
      const originalText = heading.textContent;
      let scrambled = false;

      ScrollTrigger.create({
        trigger: heading,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          if (scrambled) return;
          scrambled = true;

          let iteration = 0;
          const maxIterations = 12;

          const interval = setInterval(() => {
            heading.textContent = originalText
              .split('')
              .map((char, index) => {
                if (index < iteration) return originalText[index];
                if (char === ' ') return ' ';
                return chars[Math.floor(Math.random() * chars.length)];
              })
              .join('');

            iteration += 1 / 2;
            if (iteration >= originalText.length) {
              clearInterval(interval);
              heading.textContent = originalText;
            }
          }, 40);
        },
      });
    });
  }

  // --- Section Flash on Scroll Enter ---
  function initSectionFlash() {
    if (typeof gsap === 'undefined') return;
    document.querySelectorAll('.section-flash').forEach((flash) => {
      ScrollTrigger.create({
        trigger: flash.parentElement,
        start: 'top 75%',
        once: true,
        onEnter: () => {
          flash.classList.add('active');
          setTimeout(() => {
            flash.classList.remove('active');
          }, 1200);
        },
      });
    });
  }

  // --- Nav Logo Random Flicker ---
  function initNavFlicker() {
    const logo = document.querySelector('.nav-logo');
    if (!logo) return;

    function doFlicker() {
      logo.classList.add('flickering');
      setTimeout(() => {
        logo.classList.remove('flickering');
      }, 300);
      setTimeout(doFlicker, 8000 + Math.random() * 7000);
    }
    setTimeout(doFlicker, 6000);
  }

  // --- 3D Card Tilt on Project Cards ---
  function initCardTilt() {
    if ('ontouchstart' in window) return;
    if (typeof gsap === 'undefined') return;

    document.querySelectorAll('.project-slide, .project-text-card').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / centerY * -4;
        const rotateY = (x - centerX) / centerX * 4;

        gsap.to(card, {
          rotateX: rotateX,
          rotateY: rotateY,
          duration: 0.4,
          ease: 'power2.out',
          transformPerspective: 800,
        });
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.6,
          ease: 'elastic.out(1, 0.5)',
          transformPerspective: 800,
        });
      });
    });
  }

  // --- Status Bar Simulation ---
  function initStatusSimulation() {
    const loadEl = document.querySelector('.status-bar-left .status-item:nth-child(2) span:last-child');
    const uptimeEl = document.getElementById('uptime');

    // Simulate fluctuating load
    if (loadEl) {
      setInterval(() => {
        const load = 30 + Math.floor(Math.random() * 35);
        loadEl.textContent = 'LOAD: ' + load + '%';
      }, 2000);
    }

    // Add packets counter if status-bar-right exists
    const rightSection = document.querySelector('.status-bar-right');
    if (rightSection && !rightSection.querySelector('.status-packets')) {
      const packetsItem = document.createElement('div');
      packetsItem.className = 'status-item status-packets';
      packetsItem.innerHTML = '<span id="packets">PACKETS: 0</span>';
      rightSection.appendChild(packetsItem);

      let packets = 0;
      const packetsEl = document.getElementById('packets');
      if (packetsEl) {
        setInterval(() => {
          packets += Math.floor(Math.random() * 50) + 10;
          packetsEl.textContent = 'PACKETS: ' + packets;
        }, 1500);
      }
    }
  }

  // --- Terminal Output Simulation ---
  function initTerminalOutput() {
    const body = document.getElementById('terminal-body');
    if (!body) return;

    const session = [
      { type: 'prompt-cmd', prompt: '$', cmd: 'ssh zakaria@portfolio.dev' },
      { type: 'output', text: 'Last login: Tue Jul 21 14:23:07 2026 from 10.0.0.42' },
      { type: 'blank' },
      { type: 'prompt-cmd', prompt: '$', cmd: 'neofetch' },
      { type: 'output', text: '        .-/+oossssoo+/-.               zakaria@portfolio' },
      { type: 'output', text: '    `:+ssssssssssssssssss+:`           -----------------' },
      { type: 'output', text: '  -+ssssssssssssssssssyyssss+-         OS: Debian 12 bookworm' },
      { type: 'output', text: '  OS: Debian 12 | Shell: zsh 5.9 | CPU: Ryzen 7 5800X' },
      { type: 'output', text: '  Memory: 4218MiB / 16384MiB | Uptime: 30 days' },
      { type: 'blank' },
      { type: 'prompt-cmd', prompt: '$', cmd: 'docker ps --format "table {{.Names}}\\t{{.Status}}" ' },
      { type: 'output', text: 'NAMES            STATUS' },
      { type: 'success', text: 'nginx-proxy      Up 30 days' },
      { type: 'success', text: 'portfolio-app    Up 30 days' },
      { type: 'success', text: 'postgres-db      Up 30 days' },
      { type: 'success', text: 'redis-cache      Up 30 days' },
      { type: 'blank' },
      { type: 'prompt-cmd', prompt: '$', cmd: 'git log --oneline -5' },
      { type: 'output', text: 'a3f7c21 feat: add terminal output background' },
      { type: 'output', text: 'e1b4d89 fix: mobile responsive layout' },
      { type: 'output', text: 'c9a2f03 style: update color palette' },
      { type: 'output', text: '8d3e1b7 feat: add scroll progress bar' },
      { type: 'output', text: 'f2a6c45 refactor: optimize animation loop' },
      { type: 'blank' },
      { type: 'prompt-cmd', prompt: '$', cmd: 'npm run build' },
      { type: 'output', text: '> portfolio@2.0.26 build' },
      { type: 'output', text: '✓ 47 modules transformed.' },
      { type: 'success', text: 'dist/index.html    0.45 kB │ gzip: 0.29 kB' },
      { type: 'success', text: 'dist/style.css    14.82 kB │ gzip: 4.91 kB' },
      { type: 'success', text: 'dist/script.js    11.34 kB │ gzip: 3.78 kB' },
      { type: 'success', text: '✓ built in 1.84s' },
      { type: 'blank' },
      { type: 'prompt-cmd', prompt: '$', cmd: 'ss -tlnp' },
      { type: 'output', text: 'State   Recv-Q  Send-Q  Local Address:Port' },
      { type: 'output', text: 'LISTEN  0       128     0.0.0.0:80' },
      { type: 'output', text: 'LISTEN  0       128     0.0.0.0:443' },
      { type: 'output', text: 'LISTEN  0       128     0.0.0.0:3000' },
      { type: 'output', text: 'LISTEN  0       128     0.0.0.0:5432' },
      { type: 'blank' },
      { type: 'prompt-cmd', prompt: '$', cmd: 'df -h' },
      { type: 'output', text: 'Filesystem   Size  Used Avail Use%  Mounted on' },
      { type: 'output', text: '/dev/sda1    256G   42G  214G  17%  /' },
      { type: 'output', text: '/dev/sda2    512G  128G  384G  25%  /data' },
      { type: 'blank' },
      { type: 'prompt-cmd', prompt: '$', cmd: 'ping -c 3 google.com' },
      { type: 'output', text: '64 bytes from 142.250.80.46: icmp_seq=0 ttl=116 time=12.3ms' },
      { type: 'output', text: '64 bytes from 142.250.80.46: icmp_seq=1 ttl=116 time=11.8ms' },
      { type: 'output', text: '64 bytes from 142.250.80.46: icmp_seq=2 ttl=116 time=13.1ms' },
      { type: 'blank' },
      { type: 'prompt-cmd', prompt: '$', cmd: 'echo "All systems operational ✓"' },
      { type: 'output', text: 'All systems operational ✓' },
      { type: 'blank' },
      { type: 'prompt-cmd', prompt: '$', cmd: 'logout' },
      { type: 'output', text: 'Connection to portfolio.dev closed.' },
      { type: 'blank' },
    ];

    const MAX_VISIBLE = 28;
    let lineIndex = 0;

    function addLine(lineData) {
      const div = document.createElement('div');
      div.className = 'terminal-line';

      if (lineData.type === 'blank') {
        div.innerHTML = '&nbsp;';
      } else if (lineData.type === 'prompt-cmd') {
        div.innerHTML = '<span class="t-prompt">' + lineData.prompt + ' </span><span class="t-cmd">' + lineData.cmd + '</span>';
      } else if (lineData.type === 'output') {
        div.innerHTML = '<span class="t-output">' + lineData.text + '</span>';
      } else if (lineData.type === 'success') {
        div.innerHTML = '<span class="t-success">' + lineData.text + '</span>';
      } else if (lineData.type === 'error') {
        div.innerHTML = '<span class="t-error">' + lineData.text + '</span>';
      }

      body.appendChild(div);

      while (body.children.length > MAX_VISIBLE) {
        body.removeChild(body.firstChild);
      }

      body.scrollTop = body.scrollHeight;
    }

    function typeSession() {
      if (lineIndex >= session.length) {
        setTimeout(() => {
          body.innerHTML = '';
          lineIndex = 0;
          typeSession();
        }, 4000);
        return;
      }

      const line = session[lineIndex];
      lineIndex++;
      addLine(line);

      let delay;
      if (line.type === 'blank') {
        delay = 300 + Math.random() * 200;
      } else if (line.type === 'prompt-cmd') {
        delay = 800 + Math.random() * 700;
      } else {
        delay = 60 + Math.random() * 100;
      }

      setTimeout(typeSession, delay);
    }

    setTimeout(typeSession, 2000);
  }

  // --- Cursor Spotlight Glow ---
  function initCursorSpotlight() {
    if ('ontouchstart' in window) return;
    const spotlight = document.createElement('div');
    spotlight.className = 'cursor-spotlight';
    spotlight.setAttribute('aria-hidden', 'true');
    document.body.appendChild(spotlight);

    let sx = window.innerWidth / 2, sy = window.innerHeight / 2;
    document.addEventListener('mousemove', (e) => {
      sx = e.clientX;
      sy = e.clientY;
    });
    function animSpot() {
      spotlight.style.left = sx + 'px';
      spotlight.style.top = sy + 'px';
      requestAnimationFrame(animSpot);
    }
    animSpot();
  }

  // --- Scroll Progress Bar ---
  function initScrollProgress() {
    const bar = document.createElement('div');
    bar.className = 'scroll-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);

    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = pct + '%';
    }, { passive: true });
  }

  // --- Hover Text Scramble ---
  function initHoverScramble() {
    const chars = '!@#$%^&*0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    document.querySelectorAll('.nav-links a, .btn, .nav-logo').forEach((el) => {
      const original = el.textContent;
      let hovering = false;
      el.addEventListener('mouseenter', () => {
        if (hovering) return;
        hovering = true;
        let iteration = 0;
        const interval = setInterval(() => {
          el.textContent = original
            .split('')
            .map((char, i) => {
              if (i < iteration) return original[i];
              if (char === ' ') return ' ';
              return chars[Math.floor(Math.random() * chars.length)];
            })
            .join('');
          iteration += 1 / 2;
          if (iteration >= original.length) {
            clearInterval(interval);
            el.textContent = original;
            hovering = false;
          }
        }, 30);
      });
    });
  }
});
