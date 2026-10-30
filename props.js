/*
 * props.js — real 3D assets, drawn as riso spot illustrations.
 *
 * One fixed canvas, one WebGL context, one viewport per [data-prop] slot.
 * Each slot loads a low-poly glTF model (Poly Pizza, CC BY 3.0) once and
 * clones it; drag any of them to spin it.
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
    drone: { url: './assets/models/drone.glb', size: 2.6, tilt: 0.16, turn: -0.3 }
  };

  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var booted = false;
  var renderer = null;
  var props = [];
  var raf = 0;
  var last = 0;

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
    var canvas = document.createElement('canvas');
    canvas.className = 'props-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);

    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'low-power'
      });
    } catch (err) {
      canvas.remove();
      return;
    }
    if (!renderer.getContext()) {
      canvas.remove();
      return;
    }

    renderer.setClearColor(0x000000, 0);
    renderer.autoClear = false;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    var loader = new GLTFLoader();
    var cache = {};

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

      // a soft stain under the object so it sits on the paper, not in the air
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

      props.push({
        el: el,
        scene: scene,
        camera: camera,
        pivot: pivot,
        shadow: shadow,
        url: cfg.url,
        size: cfg.size,
        tilt: cfg.tilt || 0,
        turn: cfg.turn || 0,
        appear: 0,
        born: 0,
        spin: 0,
        drag: 0,
        ready: false
      });
    }

    // load every distinct model once
    var urls = {};
    for (var u = 0; u < props.length; u++) urls[props[u].url] = true;

    var jobs = [];
    Object.keys(urls).forEach(function (url) {
      jobs.push(loadModel(url).then(function (scene) {
        if (!scene) return;
        for (var k = 0; k < props.length; k++) {
          var p = props[k];
          if (p.url !== url || p.ready) continue;

          var model = scene.clone(true);
          var box = new THREE.Box3().setFromObject(model);
          var center = box.getCenter(new THREE.Vector3());
          var dims = box.getSize(new THREE.Vector3());
          var max = Math.max(dims.x, dims.y, dims.z) || 1;
          var s = p.size / max;

          model.scale.setScalar(s);
          model.position.set(-center.x * s, -center.y * s, -center.z * s);
          // spin a holder around the centred model, not the model's own origin
          var holder = new THREE.Group();
          holder.rotation.set(p.tilt, p.turn, 0);
          holder.add(model);

          // keep the model's own materials; only tame the specular so it
          // reads as printed stock rather than glossy plastic
          model.traverse(function (o) {
            if (!o.isMesh || !o.material) return;
            var mats = Array.isArray(o.material) ? o.material : [o.material];
            for (var mi = 0; mi < mats.length; mi++) {
              var m = mats[mi];
              if ('roughness' in m) m.roughness = 0.95;
              if ('metalness' in m) m.metalness = 0.05;
            }
          });

          p.pivot.add(holder);
          p.shadow.scale.set(p.size * 1.15, p.size * 0.42, 1);
          p.shadow.position.y = -p.size * 0.5;
          p.ready = true;
        }
      }));
    });

    document.documentElement.classList.add('has-props');

    function resize() {
      var w = window.innerWidth;
      var h = window.innerHeight;
      var dpr = Math.min(window.devicePixelRatio || 1, 1.75, 1800 / Math.max(w, h));
      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h, false);
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    /* ------------------------------------------------------------ drag */
    var active = null;
    var startX = 0;
    var startY = 0;

    for (var d = 0; d < props.length; d++) {
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
          var dx = e.clientX - startX;
          var dy = e.clientY - startY;
          startX = e.clientX;
          startY = e.clientY;
          p.spin += dx * 0.012;
          p.drag = Math.max(-0.5, Math.min(0.5, p.drag + dy * 0.006));
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
      })(props[d]);
    }

    var seen = new IntersectionObserver(function (entries) {
      for (var k = 0; k < entries.length; k++) {
        if (!entries[k].isIntersecting) continue;
        var p = entries[k].target.__prop;
        if (p && !p.born) p.born = performance.now();
        seen.unobserve(entries[k].target);
      }
    }, { rootMargin: '0px 0px -10% 0px' });

    for (var j = 0; j < props.length; j++) {
      props[j].el.__prop = props[j];
      seen.observe(props[j].el);
    }

    function draw(now) {
      var vh = window.innerHeight;
      var any = false;

      renderer.setScissorTest(false);
      renderer.clear();
      renderer.setScissorTest(true);

      for (var n = 0; n < props.length; n++) {
        var p = props[n];
        var r = p.el.getBoundingClientRect();
        if (r.bottom < -40 || r.top > vh + 40 || r.width < 8) continue;
        if (!p.ready) continue;

        if (p.born && p.appear < 1) {
          p.appear = Math.min(1, (now - p.born) / 620);
          var e2 = 1 - Math.pow(1 - p.appear, 3);
          p.pivot.scale.setScalar(e2 + Math.sin(p.appear * Math.PI) * 0.07);
        }
        if (!p.born) p.appear = 0;

        var t = now / 1000;
        // a slow sway, not a full spin: the object keeps showing its front
        p.pivot.rotation.y = p.spin + (calm ? 0.2 : Math.sin(t * 0.34 + n) * 0.42);
        p.pivot.rotation.x = p.drag + Math.sin(t * 0.5 + n) * 0.05;
        p.pivot.position.y = Math.sin(t * 0.8 + n * 1.7) * 0.05;

        var x = Math.round(r.left);
        var y = Math.round(vh - r.bottom);
        var w = Math.round(r.width);
        var h = Math.round(r.height);

        p.camera.aspect = w / h;

        // frame the model against the slot: fill the short axis, 15% margin
        var fov = (34 * Math.PI) / 180;
        var radius = p.size * 0.56;
        var dist = radius / Math.tan(fov / 2);
        if (p.camera.aspect < 1) dist /= p.camera.aspect;
        p.camera.position.set(0, dist * 0.12, dist * 1.02);
        p.camera.lookAt(0, 0, 0);
        p.camera.updateProjectionMatrix();

        renderer.setViewport(x, y, w, h);
        renderer.setScissor(x, y, w, h);
        renderer.render(p.scene, p.camera);
        any = true;
      }

      return any;
    }

    function loop(now) {
      raf = 0;
      if (document.hidden) return;
      if (now - last < 32) {
        raf = requestAnimationFrame(loop);
        return;
      }
      last = now;
      var any = draw(now);
      if (any && !calm) raf = requestAnimationFrame(loop);
    }

    function play() {
      if (raf || calm) return;
      raf = requestAnimationFrame(loop);
    }

    setTimeout(function () { canvas.classList.add('is-ready'); }, 80);

    if (calm) {
      draw(performance.now());
      return;
    }

    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) play();
    });
    window.addEventListener('scroll', play, { passive: true });

    // redraw as each model lands
    Promise.all(jobs).then(function () {
      if (!calm) play();
      else draw(performance.now());
    });

    raf = requestAnimationFrame(loop);
  }
})();
