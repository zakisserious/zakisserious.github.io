/*
 * props.js — real 3D assets, drawn as riso spot illustrations.
 *
 * One small canvas per slot, positioned inside the slot. Because the canvas
 * scrolls with the page there is nothing to redraw while scrolling: the
 * compositor just moves a layer. Each slot only renders while it is on
 * screen, and only ~30fps.
 *
 * Optional: if WebGL or a model fails, the slot stays hidden and the
 * document is exactly as it was.
 */

(function () {
  'use strict';

  var slots = document.querySelectorAll('[data-prop]');
  if (!slots.length) return;

  var MODELS = {
    holo: { url: './assets/models/holo.glb', size: 2.8, tilt: 0.06, turn: 0.16 },
    server: { url: './assets/models/server.glb', size: 2.6, tilt: 0.05, turn: -0.45 },
    laptop: { url: './assets/models/laptop.glb', size: 2.8, tilt: 0.2, turn: -0.5 },
    drone: { url: './assets/models/drone.glb', size: 2.6, tilt: 0.16, turn: -0.3 },
    brain: { url: './assets/models/brain.glb', size: 2.6, tilt: 0.1, turn: -0.35 },
    computer: { url: './assets/models/computer.glb', size: 2.9, tilt: 0.14, turn: -0.52 },
    robot: { url: './assets/models/robot.glb', size: 2.6, tilt: 0.04, turn: -0.32 }
  };

  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var booted = false;
  var items = [];
  var raf = 0;

  if (window.requestIdleCallback) {
    window.requestIdleCallback(boot, { timeout: 1200 });
  } else {
    window.setTimeout(boot, 500);
  }

  function boot() {
    if (booted) return;
    booted = true;

    Promise.all([
      import('three'),
      import('three/addons/loaders/GLTFLoader.js')
    ]).then(function (mods) {
      try {
        start(mods[0], mods[1].GLTFLoader);
      } catch (err) {
        console.warn('[fx] props failed', err);
      }
    }).catch(function (err) {
      console.warn('[fx] props failed', err);
    });
  }

  function start(THREE, GLTFLoader) {
    var loader = new GLTFLoader();
    var cache = {};
    // small canvases, so full rate is cheap; only trim resolution on phones
    // that report little memory or few cores
    var lowEnd = (navigator.deviceMemory || 8) <= 4 || (navigator.hardwareConcurrency || 8) <= 4;
    var dpr = Math.min(window.devicePixelRatio || 1, lowEnd ? 2 : 3);

    function loadModel(url) {
      if (!cache[url]) {
        cache[url] = new Promise(function (resolve) {
          loader.load(url, function (gltf) {
            resolve(gltf.scene);
          }, undefined, function (err) {
            console.warn('[fx] props failed', err);
            resolve(null);
          });
        });
      }
      return cache[url];
    }

    for (var i = 0; i < slots.length; i++) {
      var el = slots[i];
      var cfg = MODELS[el.getAttribute('data-prop')] || MODELS.laptop;

      var canvas = document.createElement('canvas');
      canvas.className = 'prop-canvas';
      canvas.setAttribute('aria-hidden', 'true');
      el.appendChild(canvas);

      var renderer;
      try {
        renderer = new THREE.WebGLRenderer({
          canvas: canvas,
          antialias: true,
          alpha: true,
          powerPreference: 'low-power'
        });
      } catch (err) {
        canvas.remove();
        continue;
      }
      if (!renderer.getContext()) {
        canvas.remove();
        continue;
      }

      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      var scene = new THREE.Scene();
      scene.add(new THREE.AmbientLight(0xfff6e6, 2.1));
      var key = new THREE.DirectionalLight(0xfff3d8, 2.6);
      key.position.set(3, 4, 5);
      scene.add(key);
      var rim = new THREE.DirectionalLight(0x1b3fd8, 1.2);
      rim.position.set(-4, -2, -3);
      scene.add(rim);

      var camera = new THREE.PerspectiveCamera(34, 1.4, 0.1, 60);
      camera.lookAt(0, 0, 0);

      var pivot = new THREE.Group();
      scene.add(pivot);

      var shadow = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1),
        new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          uniforms: { uOpacity: { value: 0.16 } },
          vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
          fragmentShader: [
            'precision mediump float;',
            'uniform float uOpacity;',
            'varying vec2 vUv;',
            'void main(){',
            '  vec2 p = (vUv - 0.5) * 2.0;',
            '  float d = length(p);',
            '  float a = (1.0 - smoothstep(0.1, 1.0, d)) * uOpacity;',
            '  gl_FragColor = vec4(0.09, 0.06, 0.04, a);',
            '}'
          ].join('\n')
        })
      );
      shadow.rotation.x = -Math.PI / 2;
      scene.add(shadow);

      var item = {
        el: el,
        canvas: canvas,
        renderer: renderer,
        scene: scene,
        camera: camera,
        pivot: pivot,
        shadow: shadow,
        url: cfg.url,
        size: cfg.size,
        tilt: cfg.tilt || 0,
        turn: cfg.turn || 0,
        ready: false,
        visible: false,
        appear: 0,
        born: 0,
        spin: 0,
        drag: 0,
        w: 0,
        h: 0
      };
      items.push(item);
    }

    if (!items.length) return;

    document.documentElement.classList.add('has-props');

    /* --------------------------------------------------------- sizing */
    function measure(item) {
      var w = item.el.clientWidth;
      var h = item.el.clientHeight;
      if (!w || !h || (w === item.w && h === item.h)) return;

      item.w = w;
      item.h = h;
      item.camera.aspect = w / h;
      item.camera.updateProjectionMatrix();
      item.renderer.setPixelRatio(dpr);
      item.renderer.setSize(w, h, false);

      // frame the model against the slot: fill the short axis, 10% margin
      var fov = (34 * Math.PI) / 180;
      var radius = item.size * 0.56;
      var dist = radius / Math.tan(fov / 2);
      if (item.camera.aspect < 1) dist /= item.camera.aspect;
      item.camera.position.set(0, dist * 0.12, dist * 1.02);
      item.camera.lookAt(0, 0, 0);
      item.camera.updateProjectionMatrix();
    }

    for (var m = 0; m < items.length; m++) measure(items[m]);

    if (window.ResizeObserver) {
      var ro = new ResizeObserver(function () {
        for (var k = 0; k < items.length; k++) {
          measure(items[k]);
          if (items[k].visible) play();
        }
      });
      for (var r = 0; r < items.length; r++) ro.observe(items[r].el);
    }

    /* ---------------------------------------------------------- models */
    var urls = {};
    for (var u = 0; u < items.length; u++) urls[items[u].url] = true;

    Object.keys(urls).forEach(function (url) {
      loadModel(url).then(function (scene) {
        if (!scene) return;
        for (var k = 0; k < items.length; k++) {
          var p = items[k];
          if (p.url !== url || p.ready) continue;

          var model = scene.clone(true);
          var box = new THREE.Box3().setFromObject(model);
          var center = box.getCenter(new THREE.Vector3());
          var dims = box.getSize(new THREE.Vector3());
          var max = Math.max(dims.x, dims.y, dims.z) || 1;
          var s = p.size / max;

          model.scale.setScalar(s);
          model.position.set(-center.x * s, -center.y * s, -center.z * s);

          model.traverse(function (o) {
            if (!o.isMesh || !o.material) return;
            var mats = Array.isArray(o.material) ? o.material : [o.material];
            for (var mi = 0; mi < mats.length; mi++) {
              if ('roughness' in mats[mi]) mats[mi].roughness = 0.95;
              if ('metalness' in mats[mi]) mats[mi].metalness = 0.05;
            }
          });

          var holder = new THREE.Group();
          holder.rotation.set(p.tilt, p.turn, 0);
          holder.add(model);

          p.pivot.add(holder);
          p.shadow.scale.set(p.size * 1.15, p.size * 0.42, 1);
          p.shadow.position.y = -p.size * 0.5;
          p.ready = true;
        }
        play();
      });
    });

    /* ------------------------------------------------------------ drag */
    var active = null;
    var startX = 0;
    var startY = 0;

    for (var d = 0; d < items.length; d++) {
      (function (p) {
        p.el.addEventListener('pointerdown', function (e) {
          if (e.pointerType === 'mouse' && e.button !== 0) return;
          active = p;
          startX = e.clientX;
          startY = e.clientY;
          p.el.classList.add('is-dragging');
          try { p.el.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
          play();
        });

        p.el.addEventListener('pointermove', function (e) {
          if (active !== p) return;
          p.spin += (e.clientX - startX) * 0.012;
          p.drag = Math.max(-0.5, Math.min(0.5, p.drag + (e.clientY - startY) * 0.006));
          startX = e.clientX;
          startY = e.clientY;
          play();
        });

        function release() {
          if (active !== p) return;
          active = null;
          p.el.classList.remove('is-dragging');
        }
        p.el.addEventListener('pointerup', release);
        p.el.addEventListener('pointercancel', release);
        p.el.addEventListener('lostpointercapture', release);
      })(items[d]);
    }

    /* --------------------------------------------------------- visibility */
    var io = new IntersectionObserver(function (entries) {
      for (var k = 0; k < entries.length; k++) {
        var el = entries[k].target;
        for (var n = 0; n < items.length; n++) {
          if (items[n].el !== el) continue;
          items[n].visible = entries[k].isIntersecting;
          if (entries[k].isIntersecting) {
            if (!items[n].born) items[n].born = performance.now();
            play();
          }
        }
      }
    }, { rootMargin: '120px' });

    for (var v = 0; v < items.length; v++) io.observe(items[v].el);

    /* ------------------------------------------------------------- draw */
    function draw(now) {
      var t = now / 1000;
      var any = false;

      for (var n = 0; n < items.length; n++) {
        var p = items[n];
        if (!p.visible || !p.ready) continue;

        if (p.born && p.appear < 1) {
          p.appear = Math.min(1, (now - p.born) / 620);
          var e2 = 1 - Math.pow(1 - p.appear, 3);
          p.pivot.scale.setScalar(e2 + Math.sin(p.appear * Math.PI) * 0.07);
        }

        var sway = calm ? 0.2 : Math.sin(t * 0.34 + n) * 0.42;
        p.pivot.rotation.y = p.spin + sway;
        p.pivot.rotation.x = p.drag + Math.sin(t * 0.5 + n) * 0.05;
        p.pivot.position.y = Math.sin(t * 0.8 + n * 1.7) * 0.05;

        p.renderer.render(p.scene, p.camera);
        any = true;
      }

      return any;
    }

    function loop(now) {
      raf = 0;
      if (document.hidden) return;
      if (draw(now)) raf = requestAnimationFrame(loop);
    }

    function play() {
      if (raf || calm) return;
      raf = requestAnimationFrame(loop);
    }

    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) play();
    });

    if (calm) {
      for (var c = 0; c < items.length; c++) items[c].visible = true;
      draw(performance.now());
      for (var c2 = 0; c2 < items.length; c2++) items[c2].visible = false;
      return;
    }

    play();
  }
})();
