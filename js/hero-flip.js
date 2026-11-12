// Hero coin flip: coins sit in the skyline photo (dusk). Using the v8 coin-flip motion, each coin
// turns left onto its token and bounces, then turns left again onto the night photo and bounces. The steps travel across from right to left in waves; the photo between the coins turns to
// night in a right-to-left sweep.
// The canvas fills its container like CSS `object-fit: cover; object-position: bottom`.
(function () {
  var stage = document.getElementById('hero-flip');
  var fadeShade = document.getElementById('hero-shade-fade');       // fade from the band into the photo
  // top tint: START colour while the starting (dusk) photo shows, END once it has turned to night
  var NIGHT_RGB = [0, 48, 79], DUSK_RGB = [0, 12, 38];             // NIGHT_RGB = start tint, DUSK_RGB = end tint
  if (!stage || !window.THREE || !window.KL_COINS) return;

  var W = 1956, H = 1149;   // skyline photo size in pixels (the hero's 1440 x 846 shape); the scene uses pixel units
  var R = +(stage.dataset.coinR || 25.3);   // coin radius (the mobile page uses smaller coins)
  var T = 2 * R * 0.16;     // thickness: 16% of the diameter, the same build as the ring coins
  // v8 motion. Distances are in v8 pixels. The wave starts at the right edge and runs left, taking
  // as long to cross the hero as v8's wave takes to reach the corners of its frame
  var DMAX = Math.hypot(382 * 1.2, 590);
  var V1 = 420, V2 = 290;             // v8 px/s: first turn, second turn
  var S0 = 0.6;                       // when the centre coin starts its first flip
  // the photo behind the coins turns from dusk to night in a right-to-left sweep (as before v8)
  // timed with each coin's swing back to the photo
  var SWEEP0 = S0 + 0.48, SWEEP_SPAN = DMAX / V2, SWEEP_FADE = 1.6;
  // the wave crosses this span of the photo (photo px); the phone only shows the middle of the photo
  var WX0 = +(stage.dataset.waveX0 || 0), WX1 = +(stage.dataset.waveX1 || W);
  var COINS = window[stage.dataset.coins || 'KL_COINS'] || window.KL_COINS;   // the mobile page has its own layout (js/m-coin-positions.js)
  var TOKEN_COUNT = 35;
  var BASE = stage.dataset.assets || 'assets/';

  var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;   // same colour handling as the ring coins (photos are marked sRGB so they look unchanged)
  stage.appendChild(renderer.domElement);

  var scene = new THREE.Scene();
  var DIST = 6000;
  var camera = new THREE.PerspectiveCamera(2 * Math.atan((H / 2) / DIST) * 180 / Math.PI, W / H, 5000, 7000);
  camera.position.set(0, 0, DIST);

  // v8 lighting (its three.js uses physical light units, so intensities are divided by PI here)
  scene.add(new THREE.HemisphereLight(0xffffff, 0x404858, 1.55 / Math.PI));
  var key = new THREE.DirectionalLight(0xffffff, 2.05 / Math.PI);
  key.position.set(-6, 8, 14);
  scene.add(key);
  var rimLight = new THREE.DirectionalLight(0xffffff, 0.35 / Math.PI);
  rimLight.position.set(6, -4, 6);
  scene.add(rimLight);

  var voidPlane = new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshBasicMaterial({ color: 0x03060f }));
  voidPlane.position.z = -R * 1.4;
  scene.add(voidPlane);

  // Cover the container, anchored to the bottom edge of the photo
  function resize() {
    var w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    var aspect = w / h;
    camera.aspect = aspect;
    var visH = Math.min(H, W / aspect);
    camera.fov = 2 * Math.atan((visH / 2) / DIST) * 180 / Math.PI;
    camera.position.y = -(H - visH) / 2;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);

  function loadImage(src) {
    return new Promise(function (res, rej) {
      var img = new Image();
      img.onload = function () { res(img); };
      img.onerror = function () { rej(new Error('Missing ' + src)); };
      img.src = src;
    });
  }
  function tex(img) {
    var t = new THREE.Texture(img); t.needsUpdate = true; t.encoding = THREE.sRGBEncoding;
    t.minFilter = THREE.LinearFilter; t.generateMipmaps = false;
    return t;
  }
  function withHoles(img) {
    var cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    var ctx = cv.getContext('2d');
    ctx.drawImage(img, 0, 0, W, H);
    ctx.globalCompositeOperation = 'destination-out';
    COINS.forEach(function (c) { ctx.beginPath(); ctx.arc(c[0], c[1], R - 3, 0, Math.PI * 2); ctx.fill(); });
    var t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding;
    t.minFilter = THREE.LinearFilter; t.generateMipmaps = false;
    return t;
  }

  // ---- Coin build shared with the ring coins (coin-ring.js): navy chrome reflecting a dark studio
  // ---- with bright strip lights, flat raised rim, finely engraved field, raised white-silver logo
  function chromeEnv() {
    var c = document.createElement('canvas'); c.width = 1024; c.height = 512;
    var g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 512);
    gr.addColorStop(0, '#5a6372'); gr.addColorStop(0.35, '#222a36'); gr.addColorStop(0.55, '#151b27'); gr.addColorStop(1, '#0d121c');
    g.fillStyle = gr; g.fillRect(0, 0, 1024, 512);
    g.filter = 'blur(6px)';
    [[48, 22, 1], [118, 14, 0.9], [205, 10, 0.75], [300, 8, 0.55], [430, 12, 0.5]].forEach(function (b) {
      g.fillStyle = 'rgba(255,255,255,' + b[2] + ')'; g.fillRect(0, b[0] - b[1] / 2, 1024, b[1]); });
    // the hero's token faces rest facing the viewer, so they reflect the area behind the camera
    // (x 768, y 256): keep that dark, with the softboxes either side and one faint diagonal streak
    [[640, 60, 40, 280, 0.9], [880, 90, 34, 220, 0.85], [560, 120, 26, 200, 0.7], [960, 110, 30, 220, 0.7],
     [180, 80, 50, 260, 0.85], [340, 100, 30, 220, 0.6], [470, 90, 24, 240, 0.55], [40, 120, 30, 200, 0.6]].forEach(function (b) {
      g.fillStyle = 'rgba(255,255,255,' + b[4] + ')'; g.fillRect(b[0], b[1], b[2], b[3]); });
    g.save(); g.translate(768, 230); g.rotate(-0.6); g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(-120, -8, 240, 16); g.restore();
    var t = new THREE.CanvasTexture(c); t.mapping = THREE.EquirectangularReflectionMapping; t.encoding = THREE.sRGBEncoding;
    var pm = new THREE.PMREMGenerator(renderer), e = pm.fromEquirectangular(t).texture; pm.dispose();
    return e;
  }
  function grooveTex() {
    var n = 256, c = document.createElement('canvas'); c.width = c.height = n;
    var g = c.getContext('2d'), d = g.createImageData(n, n);
    for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) {
      var dx = x - n / 2 + 0.5, dy = y - n / 2 + 0.5, r = Math.hypot(dx, dy) || 1, k = Math.sin(r * 0.9) * 0.22, o = (y * n + x) * 4;
      d.data[o] = Math.round((dx / r * k * 0.5 + 0.5) * 255); d.data[o + 1] = Math.round((-dy / r * k * 0.5 + 0.5) * 255); d.data[o + 2] = 255; d.data[o + 3] = 255;
    }
    g.putImageData(d, 0, 0);
    return new THREE.CanvasTexture(c);
  }
  var EDGE_BLUE = new THREE.Color(0x275aab);
  function edgeBlue(m, k) {              // slight sky-blue reflection toward the edges, as on the ring coins
    m.onBeforeCompile = function (sh) {
      sh.uniforms.uEdge = { value: EDGE_BLUE }; sh.uniforms.uEdgeK = { value: k };
      sh.fragmentShader = 'uniform vec3 uEdge; uniform float uEdgeK;\n' + sh.fragmentShader.replace('#include <dithering_fragment>',
        'float edgeF = pow(1.0 - clamp(abs(dot(normal, geometry.viewDir)), 0.0, 1.0), 2.2);\n' +
        'gl_FragColor.rgb = mix(gl_FragColor.rgb, uEdge, edgeF * uEdgeK);\n#include <dithering_fragment>');
    };
    return m;
  }
  var H2 = T / 2, FACE = H2 * 0.74, RIM_IN = R * 0.86, RIM_OUT = R * 0.965, BEV = H2 * 0.22;
  function lathe(pts, segs) { var g = new THREE.LatheGeometry(pts.map(function (p) { return new THREE.Vector2(p[0], p[1]); }), segs || 96); g.rotateX(Math.PI / 2); return g; }
  var capPts = [[R * 0.77, FACE]];
  for (var bi = 0; bi <= 6; bi++) { var bf = bi / 6; capPts.push([R * (0.785 + 0.03 * bf), FACE + H2 * 0.07 * Math.sin(Math.PI * bf)]); }
  capPts.push([RIM_IN, FACE], [RIM_IN + R * 0.005, H2 * 0.98], [RIM_IN + R * 0.015, H2]);
  for (var ci = 0; ci <= 6; ci++) { var an = Math.PI / 2 * ci / 6; capPts.push([RIM_OUT + (R - RIM_OUT) * Math.sin(an), H2 - BEV * (1 - Math.cos(an))]); }
  var capGeo = lathe(capPts);
  var fieldGeo = new THREE.CircleGeometry(R * 0.775, 64); fieldGeo.translate(0, 0, FACE);
  var sideGeo = lathe([[R, H2], [R, -(H2 - BEV)]], 96);   // runs up to the photo face at the front
  var COIN = new THREE.Color(0x5b8fe0).convertSRGBToLinear();
  var coinEnv = chromeEnv();
  var bodyMat = edgeBlue(new THREE.MeshPhysicalMaterial({ color: COIN, metalness: 1, roughness: 0.05, clearcoat: 1, clearcoatRoughness: 0.03, envMap: coinEnv, envMapIntensity: 2.1, side: THREE.DoubleSide }), 0.6);
  var fieldMat = edgeBlue(new THREE.MeshPhysicalMaterial({ color: COIN, metalness: 1, roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.04, envMap: coinEnv, envMapIntensity: 2, normalMap: grooveTex(), normalScale: new THREE.Vector2(0.4, 0.4) }), 0.45);
  var chromeSideMat = edgeBlue(new THREE.MeshPhysicalMaterial({ color: new THREE.Color(0x6a9be6).convertSRGBToLinear(), metalness: 1, roughness: 0.06, clearcoat: 1, clearcoatRoughness: 0.03, envMap: coinEnv, envMapIntensity: 2.2, side: THREE.DoubleSide }), 0.6);

  // each token's silver logo, cut out of its image as a grey mask (assets/tokens/logo_XX.png, made by make_masks.py)
  var tokenSrcs = [];
  for (var i = 1; i <= TOKEN_COUNT; i++) tokenSrcs.push(BASE + 'tokens/logo_' + (i < 10 ? '0' : '') + i + '.png');

  var coins = [];
  var dimMats = [];
  var seed = 7;
  function rand() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }

  // first image is where the flip ends (night), second is where it starts (dusk)
  Promise.all([loadImage(BASE + 'skyline-night.jpg'), loadImage(BASE + 'skyline-dusk.jpg')].concat(tokenSrcs.map(loadImage))).then(function (imgs) {
    var sky = imgs[0], skyDark = imgs[1], toks = imgs.slice(2);
    var skyTex = tex(sky), darkTex = tex(skyDark);

    var vk = (DIST + R * 1.4) / DIST;
    voidPlane.scale.set(vk, vk, 1);
    voidPlane.material = new THREE.MeshBasicMaterial({ map: skyTex, color: new THREE.Color(0.86, 0.86, 0.88) });

    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshBasicMaterial({ map: withHoles(sky), alphaTest: 0.5 })));

    // Night photo over the dusk one; gives way right to left behind the return wave
    function darkLayer(map, scale) {
      var m = new THREE.ShaderMaterial({
        uniforms: { uMap: { value: map }, uT: { value: 0 }, uEnd: { value: 0 }, uScale: { value: scale } },
        vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
        fragmentShader: [
          'varying vec2 vUv; uniform sampler2D uMap; uniform float uT; uniform float uEnd; uniform float uScale;',
          'void main(){',
          '  vec4 c = texture2D(uMap, vUv);',
          '  if (c.a < 0.5) discard;',
          '  float tb = ' + SWEEP0.toFixed(2) + ' + (1.0 - clamp((vUv.x * ' + W.toFixed(1) + ' - ' + WX0.toFixed(1) + ') / ' + (WX1 - WX0).toFixed(1) + ', 0.0, 1.0)) * ' + SWEEP_SPAN.toFixed(2) + ';',   // right to left
          '  float d = max(1.0 - smoothstep(tb, tb + ' + SWEEP_FADE.toFixed(2) + ', uT), uEnd);',
          '  gl_FragColor = vec4(c.rgb * uScale, d);',
          '}'].join('\n'),
        transparent: true, depthWrite: false
      });
      dimMats.push(m);
      return m;
    }
    var dim = new THREE.Mesh(new THREE.PlaneGeometry(W, H), darkLayer(withHoles(skyDark), 1));
    dim.position.z = 0.1;
    scene.add(dim);
    var dimCavity = new THREE.Mesh(new THREE.PlaneGeometry(W, H), darkLayer(darkTex, 0.86));
    dimCavity.scale.set(vk, vk, 1);
    dimCavity.position.z = -R * 1.4 + 0.5;
    scene.add(dimCavity);

    // raised white-silver logo: the cut-out stacked in a few layers so it reads as solid metal when the coin turns
    var logoMats = toks.map(function (img) {
      var t = new THREE.Texture(img); t.needsUpdate = true;
      return [0, 1, 2].map(function (L) {
        var shade = [0.62, 0.78, 1][L];
        return new THREE.MeshPhysicalMaterial({ color: new THREE.Color(0xeef4fa).multiplyScalar(shade).convertSRGBToLinear(), metalness: 0.7, roughness: 0.22, clearcoat: 0.6, clearcoatRoughness: 0.06,
          envMapIntensity: 1.25, emissive: new THREE.Color(0x9fb2c4).multiplyScalar(shade), emissiveIntensity: 0.35, alphaMap: t, transparent: false, alphaTest: 0.5 });
      });
    });
    var logoGeo = new THREE.CircleGeometry(R, 56);
    var luv = logoGeo.attributes.uv;
    for (var j = 0; j < luv.count; j++) luv.setXY(j, 0.5 + (luv.getX(j) - 0.5) * 0.97, 0.5 + (luv.getY(j) - 0.5) * 0.97);

    COINS.forEach(function (c) {
      var cx = c[0], cy = c[1];
      var g = new THREE.Group();
      g.position.set(cx - W / 2, H / 2 - cy, -T / 2 + 0.4);

      var fGeo = new THREE.CircleGeometry(R, 56);
      var uv = fGeo.attributes.uv;
      for (var k = 0; k < uv.count; k++) {
        var u = uv.getX(k), v = uv.getY(k);
        uv.setXY(k, (cx + (2 * u - 1) * R) / W, 1 - (cy - (2 * v - 1) * R) / H);
      }
      var fMat = new THREE.MeshBasicMaterial({ map: skyTex });
      var front = new THREE.Mesh(fGeo, fMat);
      front.position.z = T / 2;

      // token side: chrome rim and engraved field with the raised logo (built facing +z, then turned to the back)
      var back = new THREE.Group();
      back.add(new THREE.Mesh(capGeo, bodyMat), new THREE.Mesh(fieldGeo, fieldMat));
      logoMats[c[2] - 1].forEach(function (m, L) { var lg = new THREE.Mesh(logoGeo, m); lg.position.z = FACE + 0.3 + L * 1.0; back.add(lg); });
      back.rotation.y = Math.PI;

      var side = new THREE.Mesh(sideGeo, chromeSideMat);
      var fDimMat = new THREE.MeshBasicMaterial({ map: darkTex, transparent: true, opacity: 1, depthWrite: false });
      var fDim = new THREE.Mesh(fGeo, fDimMat); fDim.position.z = T / 2 + 0.1;
      // Pale disc over the photo slice: shows where each coin is before it flips
      var tintMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xbcd3ff).convertSRGBToLinear(), transparent: true, opacity: 0, depthWrite: false });
      var tint = new THREE.Mesh(fGeo, tintMat); tint.position.z = T / 2 + 0.2;
      g.add(fDim, front, back, side, tint);
      scene.add(g);

      var d = Math.min(DMAX, Math.max(0, (WX1 - cx) * DMAX / (WX1 - WX0)));   // wave runs from the right edge to the left
      var s = S0 + (rand() - 0.5) * 0.08;                  // +/-0.04 s jitter per coin
      coins.push({ g: g, tint: tintMat, fDim: fDimMat, side: side, backMesh: back, fMat: fMat,
        o1: s + d / V1, r1: s + 0.48 + d / V2 });
    });

    resize();
    stage.classList.add('is-ready');
    draw(0);
    start();
  }).catch(function (e) { console.error(e); });

  function smooth(a, b, x) { var k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); }

  // ---- v8 motion (angleAt in the v8 index.html). Flip left = negative Y rotation.
  var DEG = Math.PI / 180;
  function flipTo(t, start, dur, endSpeed) {
    var x = (t - start) / dur;
    if (x <= 0) return 0;
    if (x >= 1) return Math.PI;
    return Math.PI * ((-2 * x * x * x + 3 * x * x) + endSpeed * (x * x * x - x * x));
  }
  // hops after landing: [delay after landing (s), height (rad), rise (s), drop (s)]
  var HOPS_SWING = [[0.00, 35 * DEG, 0.30, 0.17], [0.67, 9 * DEG, 0.17, 0.15], [1.25, 3 * DEG, 0.13, 0.12]];
  var HOPS_BACK = [[0.00, 15 * DEG, 0.20, 0.16], [0.44, 4 * DEG, 0.12, 0.10]];
  function bounce(t, landed, hops, fit) {
    var last = hops[hops.length - 1], len = last[0] + last[2] + last[3];
    var k = Math.min(1, (fit === undefined ? Infinity : fit) / len), b = 0;
    for (var i = 0; i < hops.length; i++) {
      var h = hops[i], u = (t - landed) / k - h[0];
      if (u <= 0 || u >= h[2] + h[3]) continue;
      b += u < h[2] ? h[1] * Math.sin((Math.PI / 2) * u / h[2]) : h[1] * Math.cos((Math.PI / 2) * (u - h[2]) / h[3]);
    }
    return b;
  }
  function angleAt(t, c) {
    var a = 0;
    // two turns, both to the left: dusk photo -> token -> night photo. Each landing bounces
    // back toward the side it came from (to the right), as in v8
    a -= flipTo(t, c.o1, 0.20, 1);                          // 1. left onto the token
    a += bounce(t, c.o1 + 0.20, HOPS_BACK, c.r1 - (c.o1 + 0.20));
    a -= flipTo(t, c.r1, 0.25, 1);                          // 2. left again onto the night photo
    a += bounce(t, c.r1 + 0.25, HOPS_SWING);
    return a;
  }

  function pose(c, t, endFade) {
    var a = angleAt(t, c);
    c.g.rotation.y = a;
    // at rest when the coin is back to a full turn (0 or -360 degrees): it then sits flush in its slot
    // and nothing of its edge shows, so the finished photo is seamless
    var moving = Math.abs(Math.sin(a / 2)) > 1e-4;
    // while turning, bring the coin fully in front of the photo so no part of it slips behind the
    // photo and gets clipped (the notches seen at the coin edges)
    c.g.position.z = moving ? 0.5 + R * Math.abs(Math.sin(a)) + (T / 2) * Math.abs(Math.cos(a)) : -T / 2 + 0.4;
    c.side.visible = moving;
    c.backMesh.visible = moving;
    // reveal: just before its first flip each coin shows as a pale disc, which fades as it turns
    var reveal = smooth(c.o1 - 0.45, c.o1, t) * (1 - smooth(c.o1, c.o1 + 0.1, t));
    c.tint.opacity = 0.17 * reveal;
    var cs = Math.cos(a);
    c.fMat.color.setScalar(0.55 + 0.45 * Math.max(cs, 0));
    // the front swaps from the dusk to the night photo while the coin shows its token
    c.fDim.opacity = Math.max(t < c.o1 + 0.15 ? 1 : 0, endFade);   // 0.15 s: past edge-on
  }

  function draw(t) {
    var endFade = 0;
    for (var m = 0; m < dimMats.length; m++) { dimMats[m].uniforms.uT.value = t; dimMats[m].uniforms.uEnd.value = endFade; }
    for (var i = 0; i < coins.length; i++) pose(coins[i], t, endFade);
    if (fadeShade) {
      // night band gives way right to left on the same timing as the night photo
      var cols = [];
      for (var k = 0; k <= 10; k++) {
        var u = k / 10, tb = SWEEP0 + (1 - u) * SWEEP_SPAN;
        var d = Math.max(1 - smooth(tb, tb + SWEEP_FADE, t), endFade);
        cols.push('rgb(' + [0, 1, 2].map(function (i) { return Math.round(NIGHT_RGB[i] * d + DUSK_RGB[i] * (1 - d)); }).join(',') + ') ' + (u * 100) + '%');
      }
      // one fade layer whose colour follows the photo from night to dusk
      fadeShade.style.backgroundImage = 'linear-gradient(to right, ' + cols.join(', ') + ')';
    }
    renderer.render(scene, camera);
  }

  // Lets a recorder or test step to an exact moment
  window.setHeroTime = function (v) { running = false; draw(v); };

  // The hero is held in place while you scroll: wheel, trackpad, touch and arrow keys
  // play the flip instead of moving the page. Once every coin has turned back, the page
  // scrolls normally. Scrolling up at the very top plays it back in reverse.
  // T_END: the furthest coin finishes its last bounce (second turn lands after 0.25 s, then 1.5 s of hops)
  var T_START = 0.3, T_END = S0 + 0.04 + 0.48 + DMAX / V2 + 0.25 + 1.5 + 0.1;   // +0.1 s so every coin is fully at rest
  var SCROLL_RANGE = 600;          // wheel or swipe distance for the whole sequence
  var running = false;
  function start() {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { draw(T_END); return; } // show the finished dusk photo, no motion and no hold
    running = true;
    var p = (window.scrollY || window.pageYOffset) > 0 ? 1 : 0; // arriving part-way down: already done
    var current = T_START + p * (T_END - T_START);
    draw(current);

    function atTop() { return (window.scrollY || window.pageYOffset) <= 1; }
    // returns true when the movement was used by the animation (so the page must not move)
    function take(dy) {
      if (!atTop()) { if (p < 1) p = 1; return false; } // e.g. scrollbar dragged: treat as finished
      // the page stays put until the animation itself has finished (every coin has turned to the
      // dark image and stopped bouncing), not just until enough scrolling has been done
      if (dy > 0 && (p < 1 || current < T_END - 0.002)) { p = Math.min(1, p + dy / SCROLL_RANGE); return true; }
      if (dy < 0 && (p > 0 || current > T_START + 0.002)) { p = Math.max(0, p - (-dy) / SCROLL_RANGE); return true; }
      return false;
    }
    window.addEventListener('wheel', function (e) {
      var dy = e.deltaMode === 1 ? e.deltaY * 40 : e.deltaMode === 2 ? e.deltaY * window.innerHeight : e.deltaY;
      if (take(dy)) e.preventDefault();
    }, { passive: false });

    var lastY = null;
    window.addEventListener('touchstart', function (e) { lastY = e.touches[0].clientY; }, { passive: true });
    window.addEventListener('touchmove', function (e) {
      if (lastY === null) return;
      var y = e.touches[0].clientY, dy = (lastY - y) * 2; lastY = y;
      if (take(dy)) e.preventDefault();
    }, { passive: false });
    window.addEventListener('touchend', function () { lastY = null; }, { passive: true });

    window.addEventListener('keydown', function (e) {
      var tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      var step = { ArrowDown: 120, ArrowUp: -120, PageDown: 600, PageUp: -600, ' ': e.shiftKey ? -600 : 600 }[e.key];
      if (step && take(step)) e.preventDefault();
    });

    window.heroFlipDone = function () { return current >= T_END - 0.002; };   // for tests
    var lastNow = 0;
    function frame(now) {
      if (!running) return;
      var target = T_START + p * (T_END - T_START);
      // glide toward the scroll position at the same pace on any screen refresh rate, and never
      // jump more than 1/30 s of animation per frame, so separate wheel clicks blend into one motion
      var dt = lastNow ? Math.min(0.05, (now - lastNow) / 1000) : 0.016; lastNow = now;
      if (Math.abs(target - current) <= 0.0005 && current !== target) { current = target; draw(current); }
      else if (Math.abs(target - current) > 0.0005) {
        var step = (target - current) * (1 - Math.exp(-dt / 0.1));
        var cap = dt * 4;                          // at most 4x real-time speed
        current += Math.max(-cap, Math.min(cap, step));
        draw(current);
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
})();
