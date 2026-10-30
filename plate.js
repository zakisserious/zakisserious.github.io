/*
 * plate.js — the riso plate.
 *
 * Optional enhancement. If WebGL, the vendored module or this file fails,
 * the portrait <img> underneath is already the finished state: nothing here
 * is needed to read, navigate or select anything.
 *
 * three.js is vendored and imported lazily, after the portrait approaches
 * the viewport, so first paint stays as light as it was before.
 */

(function () {
  'use strict';

  var frame = document.querySelector('.portrait-frame');
  var canvas = frame && frame.querySelector('.plate-canvas');
  var img = frame && frame.querySelector('img');
  if (!frame || !canvas || !img) return;

  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var booted = false;

  var wake = new IntersectionObserver(function (entries) {
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].isIntersecting) {
        wake.disconnect();
        boot();
        return;
      }
    }
  }, { rootMargin: '400px' });

  try {
    wake.observe(frame);
  } catch (err) {
    console.warn('[fx] plate failed', err);
  }

  function boot() {
    if (booted) return;
    booted = true;
    import('three')
      .then(function (THREE) {
        try {
          start(THREE);
        } catch (err) {
          console.warn('[fx] plate failed', err);
        }
      })
      .catch(function (err) {
        console.warn('[fx] plate failed', err);
      });
  }

  var VERT = [
    'uniform float uTime;',
    'varying vec2 vUv;',
    'void main() {',
    '  vUv = uv;',
    '  vec3 p = position;',
    '  float curl = p.x * p.x * 0.9 + p.y * p.y * 0.35;',
    '  p.z -= curl * 0.05;',
    '  p.z += sin(p.y * 3.0 + uTime * 0.7) * 0.012;',
    '  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);',
    '}'
  ].join('\n');

  var FRAG = [
    'precision highp float;',
    'uniform sampler2D uMap;',
    'uniform vec2 uUvScale;',
    'uniform vec2 uUvOffset;',
    'uniform vec2 uReg;',
    'uniform float uCell;',
    'uniform float uProgress;',
    'uniform vec3 uPaper;',
    'uniform vec3 uRed;',
    'uniform vec3 uBlue;',
    'uniform vec2 uLight;',
    'varying vec2 vUv;',
    '',
    'float hash(vec2 p) {',
    '  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);',
    '}',
    'float luma(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }',
    '',
    'void main() {',
    '  vec2 uv = (vUv - 0.5) * uUvScale + 0.5 + uUvOffset;',
    '',
    '  /* print-in: the sheet is laid down top to bottom with a fibrous edge */',
    '  float edge = mix(1.18, -0.25, uProgress);',
    '  float rag = (hash(vec2(floor(uv.x * 90.0), 7.0)) - 0.5) * 0.08;',
    '  float printed = smoothstep(edge - 0.02, edge + 0.02, vUv.y + rag);',
    '',
    '  /* the three plates are printed a few thousandths apart: the channels',
    '     drift, which is the whole riso tell */',
    '  vec3 sr = texture2D(uMap, uv + uReg).rgb;',
    '  vec3 sg = texture2D(uMap, uv).rgb;',
    '  vec3 sb = texture2D(uMap, uv - uReg).rgb;',
    '  vec3 src = vec3(sr.r, sg.g, sb.b);',
    '  float l = luma(src);',
    '',
    '  /* a duotone ramp keeps every bit of the photo detail: paper in the',
    '     highlights, vermilion in the shadows, the midtones carry the face */',
    '  float ink = smoothstep(0.0, 0.88, 1.0 - l);',
    '  vec3 duotone = mix(uPaper, uRed, ink);',
    '  duotone = mix(duotone, uBlue, smoothstep(0.16, 0.0, l) * 0.30);',
    '  vec3 col = mix(src, duotone, 0.9);',
    '',
    '  /* a 45 degree dot screen modulates the ink, it does not threshold it */',
    '  vec2 rp = vec2(gl_FragCoord.x - gl_FragCoord.y,',
    '                 gl_FragCoord.x + gl_FragCoord.y) * 0.7071068;',
    '  vec2 cell = floor(rp / uCell);',
    '  vec2 cen = (cell + 0.5) * uCell;',
    '  float d = length(rp - cen) / uCell;',
    '  float screen = mix(1.0, 1.0 - smoothstep(0.14, 0.46, d), 0.13);',
    '  col = mix(uPaper, col, screen);',
    '',
    '  float sheen = smoothstep(0.55, 0.0, abs(vUv.y - uLight.y)) * 0.030',
    '              + smoothstep(0.55, 0.0, abs(vUv.x - uLight.x)) * 0.018;',
    '  col += sheen;',
    '  col *= 0.985 + 0.03 * hash(gl_FragCoord.xy);',
    '  col = mix(uPaper, col, printed);',
    '',
    '  gl_FragColor = vec4(col, 1.0);',
    '}'
  ].join('\n');

  function start(THREE) {
    var w = frame.clientWidth;
    var h = frame.clientHeight;
    if (!w || !h) return;

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance'
      });
    } catch (err) {
      return; // no WebGL: the photo stays
    }
    if (!renderer.getContext()) return;

    var paper = new THREE.Color('#f4efe1');
    renderer.setClearColor(new THREE.Color('#d93a1c'), 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(30, w / h, 0.1, 50);
    camera.position.z = 4;

    var uniforms = {
      uMap: { value: null },
      uUvScale: { value: new THREE.Vector2(1, 1) },
      uUvOffset: { value: new THREE.Vector2(0, 0) },
      uReg: { value: new THREE.Vector2(0.02, -0.012) },
      uCell: { value: 6 },
      uProgress: { value: 0 },
      uPaper: { value: paper },
      uRed: { value: new THREE.Color('#d93a1c') },
      uBlue: { value: new THREE.Color('#1b3fd8') },
      uLight: { value: new THREE.Vector2(0.5, 0.5) }
    };

    var material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: VERT,
      fragmentShader: FRAG
    });

    var plate = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 40, 48), material);
    plate.renderOrder = 2;
    scene.add(plate);

    var shadowUniforms = { uOpacity: { value: 0.34 } };
    var shadowMaterial = new THREE.ShaderMaterial({
      uniforms: shadowUniforms,
      transparent: true,
      depthWrite: false,
      vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: [
        'precision mediump float;',
        'uniform float uOpacity;',
        'varying vec2 vUv;',
        'void main() {',
        '  vec2 p = (vUv - 0.5) * 2.0;',
        '  float d = length(p * vec2(0.92, 1.0));',
        '  float a = (1.0 - smoothstep(0.34, 1.0, d)) * uOpacity;',
        '  gl_FragColor = vec4(0.13, 0.09, 0.07, a);',
        '}'
      ].join('\n')
    });
    var shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), shadowMaterial);
    shadow.position.set(0.02, -0.03, -0.35);
    shadow.renderOrder = 0;
    scene.add(shadow);

    var loaded = false;
    var visible = true;
    var scrolling = false;
    var scrollTimer = 0;
    var raf = 0;
    var last = 0;
    var printed = 0;
    var rx = 0, ry = 0, tx = 0, ty = 0;
    var dragging = false;

    function layout() {
      var cw = frame.clientWidth;
      var ch = frame.clientHeight;
      if (!cw || !ch) return;

      var dpr = Math.min(window.devicePixelRatio || 1, 2, 900 / Math.max(cw, ch));
      renderer.setPixelRatio(dpr);
      renderer.setSize(cw, ch, false);

      camera.aspect = cw / ch;
      camera.updateProjectionMatrix();

      var visH = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
      var visW = visH * camera.aspect;
      plate.scale.set(visW * 0.94, visH * 0.94, 1);
      shadow.scale.set(visW * 1.06, visH * 1.06, 1);

      // Cover-crop. A wide frame would swallow the photo, so on phones we
      // push in on the face instead of showing a letterbox of the room.
      var frameAspect = cw / ch;
      var texAspect = (img.naturalWidth || 595) / (img.naturalHeight || 751);
      var ratio = frameAspect / texAspect;
      var wide = ratio > 1.25;
      var zoom = wide ? 1.7 : 1.3;
      uniforms.uUvScale.value.set(1 / zoom, 1 / (ratio * zoom));
      uniforms.uUvOffset.value.set(-0.03, 0.14);
      uniforms.uCell.value = 3.0 * dpr;
    }

    function draw(now) {
      var dt = Math.min(now - last, 64) || 16;
      last = now;
      var t = now / 1000;

      if (printed < 1) printed = Math.min(1, printed + dt / 900);

      rx += (tx - rx) * 0.08;
      ry += (ty - ry) * 0.08;

      plate.rotation.x = rx + Math.sin(t * 0.6) * 0.012;
      plate.rotation.y = ry + Math.sin(t * 0.5 + 1.3) * 0.016;
      plate.position.y = Math.sin(t * 0.7) * 0.010;

      shadow.position.x = 0.02 - ry * 0.5;
      shadow.position.y = -0.03 - rx * 0.5;
      shadowUniforms.uOpacity.value = 0.26 + Math.abs(ry) * 0.5 + Math.abs(rx) * 0.4;

      var fx = window.__fx || { reg: 0 };
      var drift = 0.02 * (1 - printed);
      uniforms.uReg.value.set(
        0.0030 + drift + fx.reg * 0.0009,
        0.0018 - drift * 0.6 + fx.reg * 0.0004
      );
      uniforms.uProgress.value = printed;
      uniforms.uLight.value.set(0.5 + ry * 1.4, 0.5 + rx * 1.4);

      renderer.render(scene, camera);
    }

    var lastDraw = 0;

    function loop(now) {
      raf = 0;
      if (!visible || document.hidden || !loaded || scrolling) return;

      // idle: the float is slow, so 12fps is plenty and the phone stays cold
      var fx = window.__fx || { reg: 0 };
      var idle = printed >= 1 &&
        Math.abs(tx - rx) < 0.001 && Math.abs(ty - ry) < 0.001 &&
        Math.abs(fx.reg) < 0.05;
      if (idle && now - lastDraw < 80) {
        raf = requestAnimationFrame(loop);
        return;
      }
      lastDraw = now;
      draw(now);
      raf = requestAnimationFrame(loop);
    }

    function play() {
      if (raf || calm || !loaded) return;
      raf = requestAnimationFrame(loop);
    }

    function stop() {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }

    var tex = new THREE.TextureLoader().load(img.currentSrc || img.src, function (t) {
      t.colorSpace = THREE.SRGBColorSpace;
      t.minFilter = THREE.LinearFilter;
      t.generateMipmaps = false;
      loaded = true;
      layout();
      if (calm) {
        printed = 1;
        rx = tx = 0.05;
        ry = ty = -0.05;
        draw(performance.now());
      } else {
        play();
      }
      frame.classList.add('is-live');
    }, undefined, function (err) {
      console.warn('[fx] plate failed', err);
    });
    uniforms.uMap.value = tex;

    /* pointer / touch: lean the plate toward the hand */
    frame.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse' && !dragging) return;
      var r = frame.getBoundingClientRect();
      if (!r.width || !r.height) return;
      tx = -((e.clientY - r.top) / r.height - 0.5) * 0.22;
      ty = ((e.clientX - r.left) / r.width - 0.5) * 0.26;
      play();
    }, { passive: true });

    frame.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse') return;
      dragging = true;
    }, { passive: true });

    frame.addEventListener('pointerup', function () { dragging = false; }, { passive: true });
    frame.addEventListener('pointercancel', function () { dragging = false; }, { passive: true });

    frame.addEventListener('pointerleave', function (e) {
      if (e.pointerType !== 'mouse') return;
      tx = 0;
      ty = 0;
      play();
    }, { passive: true });

    if (!fine) {
      // touch: the plate settles back once the finger is gone
      frame.addEventListener('pointerup', function () {
        setTimeout(function () { tx = 0; ty = 0; play(); }, 700);
      }, { passive: true });
    }

    try {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible) play(); else stop();
      }, { rootMargin: '120px' }).observe(frame);
    } catch (err) {
      visible = true;
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else play();
    });

    window.addEventListener('scroll', function () {
      scrolling = true;
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(function () {
        scrolling = false;
        play();
      }, 160);
    }, { passive: true });

    if (window.ResizeObserver) {
      new ResizeObserver(function () {
        layout();
        if (calm && loaded) renderer.render(scene, camera);
        else play();
      }).observe(frame);
    } else {
      window.addEventListener('resize', layout, { passive: true });
    }
  }
})();
