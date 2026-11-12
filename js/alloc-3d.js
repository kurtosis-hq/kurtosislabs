// Allocation illustrations as real 3D models (tray of coins, document with magnifier, globe with
// plane and coins), modelled from the 360-degree reference sheets. The open panel's model sways
// gently; changing panel spins the current model away and the next one in, with real depth.
// If WebGL is unavailable the flat pictures (.alloc-art) stay in place.
(function () {
  var stage = document.getElementById('alloc-3d');
  if (!stage || !window.THREE) return;
  var BASE = 'assets/';

  var renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); } catch (e) { return; }
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  stage.appendChild(renderer.domElement);

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(30, 0.8, 0.1, 50);
  camera.position.set(0, 0, 6.8);

  // ---- Studio reflections: light grey room with bright softboxes and strip lights, so chrome
  // ---- reads silver-white with crisp highlights and the steel parts read blue
  (function () {
    var c = document.createElement('canvas'); c.width = 1024; c.height = 512;
    var g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 512);
    gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.3, '#e4e8ec'); gr.addColorStop(0.5, '#aab3bd'); gr.addColorStop(0.62, '#6a737d'); gr.addColorStop(1, '#3a414a');   // bright sky, dark floor: chrome contrast
    g.fillStyle = gr; g.fillRect(0, 0, 1024, 512);
    g.filter = 'blur(8px)';
    [[60, 26, 1], [150, 14, 0.85], [300, 10, 0.5]].forEach(function (b) { g.fillStyle = 'rgba(255,255,255,' + b[2] + ')'; g.fillRect(0, b[0] - b[1] / 2, 1024, b[1]); });
    [[640, 70, 50, 260, 1], [880, 90, 40, 230, 0.9], [180, 80, 60, 260, 0.9], [400, 110, 30, 220, 0.6], [760, 330, 160, 30, 0.35]].forEach(function (b) {
      g.fillStyle = 'rgba(255,255,255,' + b[4] + ')'; g.fillRect(b[0], b[1], b[2], b[3]); });
    var t = new THREE.CanvasTexture(c); t.mapping = THREE.EquirectangularReflectionMapping; t.encoding = THREE.sRGBEncoding;
    var pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromEquirectangular(t).texture; pm.dispose();
  })();
  var key = new THREE.DirectionalLight(0xffffff, 0.9); key.position.set(-2, 3, 4); scene.add(key);
  var fill = new THREE.DirectionalLight(0xdfe8f2, 0.35); fill.position.set(3, -1, 2); scene.add(fill);

  function lin(hex) { return new THREE.Color(hex).convertSRGBToLinear(); }
  var SILVER = new THREE.MeshPhysicalMaterial({ color: lin(0xf2f4f7), metalness: 1, roughness: 0.08, clearcoat: 0.4, clearcoatRoughness: 0.08, envMapIntensity: 1.55 });
  var STEEL = new THREE.MeshPhysicalMaterial({ color: lin(0x86a4c4), metalness: 1, roughness: 0.12, clearcoat: 0.6, clearcoatRoughness: 0.08, envMapIntensity: 1.4 });
  var MIRROR = new THREE.MeshPhysicalMaterial({ color: lin(0xf6f8fa), metalness: 1, roughness: 0.04, envMapIntensity: 1.4 });

  // ---- shape helpers
  function rrect(w, h, r) {
    var s = new THREE.Shape(), x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s;
  }
  function rpath(w, h, r) { var s = rrect(w, h, r), p = new THREE.Path(); p.curves = s.curves; return p; }
  function poly(pts) { var sh = new THREE.Shape(); sh.moveTo(pts[0][0], pts[0][1]); for (var i = 1; i < pts.length; i++) sh.lineTo(pts[i][0], pts[i][1]); sh.closePath(); return sh; }
  function arc(cx, cy, r, a0, a1, n) { var o = []; for (var i = 0; i <= n; i++) { var a = a0 + (a1 - a0) * i / n; o.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } return o; }
  function strokeShape(pts, w) {
    var L = [], R = [];
    for (var i = 0; i < pts.length; i++) {
      var p0 = pts[Math.max(0, i - 1)], p1 = pts[Math.min(pts.length - 1, i + 1)];
      var dx = p1[0] - p0[0], dy = p1[1] - p0[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l * w / 2, ny = dx / l * w / 2;
      L.push([pts[i][0] + nx, pts[i][1] + ny]); R.push([pts[i][0] - nx, pts[i][1] - ny]);
    }
    return poly(L.concat(R.reverse()));
  }
  var D = Math.PI / 180;
  var GLYPH = {   // in a -1..1 box
    usd: [strokeShape(arc(0, 0.36, 0.36, 28 * D, 270 * D, 40).concat(arc(0, -0.36, 0.36, 90 * D, -152 * D, 40).slice(1)), 0.3), poly([[-0.08, 1], [0.08, 1], [0.08, -1], [-0.08, -1]])],
    eur: [strokeShape(arc(0.16, 0, 0.74, 48 * D, 312 * D, 64), 0.3), poly([[-0.92, 0.27], [0.32, 0.27], [0.27, 0.08], [-0.92, 0.08]]), poly([[-0.92, -0.08], [0.24, -0.08], [0.19, -0.27], [-0.92, -0.27]])]
  };
  function glyph(kind, size, depth, mat) {
    var g = new THREE.ExtrudeGeometry(GLYPH[kind], { depth: depth / size, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.03, bevelSegments: 2, curveSegments: 12 });
    g.scale(size, size, size); g.computeVertexNormals();
    return new THREE.Mesh(g, mat);
  }
  // coin with a softly rounded rim, axis along +z
  function coinGeo(r, h) {
    var e = Math.min(h * 0.35, r * 0.12), pts = [new THREE.Vector2(0.0001, -h / 2)];
    for (var i = 0; i <= 6; i++) { var a = -Math.PI / 2 + Math.PI / 2 * i / 6; pts.push(new THREE.Vector2(r - e + e * Math.cos(a), -h / 2 + e + e * Math.sin(a))); }
    for (var j = 0; j <= 6; j++) { var b = Math.PI / 2 * j / 6; pts.push(new THREE.Vector2(r - e + e * Math.cos(b), h / 2 - e + e * Math.sin(b))); }
    pts.push(new THREE.Vector2(0.0001, h / 2));
    var g = new THREE.LatheGeometry(pts, 72); g.rotateX(Math.PI / 2); return g;
  }
  function slab(shape, depth, bevel, mat) {
    var g = new THREE.ExtrudeGeometry(shape, { depth: depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 4, curveSegments: 16 });
    g.translate(0, 0, -depth / 2); g.computeVertexNormals(); return new THREE.Mesh(g, mat);
  }

  // ---- 1. Tray of standing coins (front coin silver with a blue $)
  function makeTray() {
    var m = new THREE.Group();
    var wall = rrect(2.3, 1.15, 0.28); wall.holes.push(rpath(2.04, 0.89, 0.18));
    var w = slab(wall, 0.4, 0.035, STEEL); w.rotation.x = -Math.PI / 2; w.position.y = 0.2; m.add(w);
    var floor = slab(rrect(2.3, 1.15, 0.28), 0.08, 0.02, STEEL); floor.rotation.x = -Math.PI / 2; floor.position.y = 0.04; m.add(floor);
    var cg = coinGeo(0.5, 0.17);
    [[-0.66, SILVER], [-0.24, SILVER], [0.18, STEEL], [0.6, STEEL]].forEach(function (c, i) {
      var coin = new THREE.Mesh(cg, c[1]); coin.rotation.y = -Math.PI / 2; coin.position.set(c[0], 0.6, 0); m.add(coin);
      if (i === 0) { var s = glyph('usd', 0.27, 0.035, STEEL); s.rotation.y = -Math.PI / 2; s.position.set(c[0] - 0.09, 0.6, 0); m.add(s); }
    });
    m.position.y = -0.55;
    var holder = new THREE.Group(); holder.add(m); holder.userData = { yaw: 0.9, tilt: 0.42, scale: 1.12 };   // $ coin at the front left, tray running back to the right
    return holder;
  }

  // ---- 2. Document with three bars, magnifier and two coin stacks
  function makeDoc() {
    var m = new THREE.Group();
    m.add(slab(rrect(1.55, 2.05, 0.2), 0.12, 0.035, SILVER));
    [0.5, 0.18, -0.14].forEach(function (y) { var b = slab(rrect(1.0, 0.15, 0.075), 0.05, 0.015, STEEL); b.position.set(-0.17, y, 0.11); m.add(b); });
    var ring = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.085, 24, 72), STEEL); ring.position.set(0.36, 0.05, 0.3); m.add(ring);
    var glass = new THREE.Mesh(new THREE.CircleGeometry(0.4, 64), MIRROR); glass.position.set(0.36, 0.05, 0.3); m.add(glass);
    var glassB = glass.clone(); glassB.rotation.y = Math.PI; m.add(glassB);
    var handle = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.5, 32), STEEL);
    handle.position.set(0.36 + 0.68 * Math.cos(-0.8), 0.05 + 0.68 * Math.sin(-0.8), 0.3); handle.rotation.z = Math.PI / 2 - 0.8; m.add(handle);
    var cg = coinGeo(0.3, 0.12);
    [[-0.32, -0.88, 0.42, 3], [0.27, -0.96, 0.7, 2]].forEach(function (st) {
      for (var k = 0; k < st[3]; k++) { var c = new THREE.Mesh(cg, STEEL); c.rotation.x = -Math.PI / 2; c.position.set(st[0], st[1] + k * 0.13, st[2]); m.add(c); }
      var s = glyph('usd', 0.1, 0.02, SILVER); s.rotation.x = -Math.PI / 2; s.position.set(st[0], st[1] + (st[3] - 1) * 0.13 + 0.065, st[2]); m.add(s);
    });
    m.position.y = -0.24;   // low enough to clear the heading, as in the Figma frame
    var holder = new THREE.Group(); holder.add(m); holder.userData = { yaw: 0.12, tilt: 0.12, scale: 0.92 };
    return holder;
  }

  // ---- 3. Globe with silver continents, paper plane, $ and € coins
  function makeGlobe(mapTex, bumpTex) {
    var m = new THREE.Group();
    var globe = new THREE.Mesh(new THREE.SphereGeometry(0.85, 96, 64), new THREE.MeshPhysicalMaterial({ map: mapTex, metalness: 1, roughness: 0.18, clearcoat: 0.6, clearcoatRoughness: 0.08, bumpMap: bumpTex, bumpScale: 0.015, envMapIntensity: 1.2 }));
    globe.rotation.y = -0.25; m.add(globe);   // the Americas face the viewer, as in the reference
    var cg = coinGeo(0.33, 0.11);
    var c1 = new THREE.Mesh(cg, SILVER); c1.position.set(-0.32, 0.98, 0.3); c1.rotation.set(-0.1, 0.25, 0); m.add(c1);
    var g1 = glyph('usd', 0.19, 0.03, STEEL); g1.position.set(0, 0, 0.055); c1.add(g1);
    var c2 = new THREE.Mesh(cg, SILVER); c2.position.set(0.86, -0.36, 0.45); c2.rotation.set(0, -0.3, 0); m.add(c2);
    var g2 = glyph('eur', 0.18, 0.03, STEEL); g2.position.set(0, 0, 0.055); c2.add(g2);
    // paper dart: two wings meeting along a keel, nose up and to the right
    var N = [1.18, 1.08, 0.1], C = [0.42, 0.56, 0.32], TL = [0.2, 0.78, 0.52], TR = [0.66, 0.34, 0.16], K = [0.56, 0.5, 0.08];
    function tri(a, b, c, mat) {
      var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(a.concat(b, c), 3)); g.computeVertexNormals();
      var mm = mat.clone(); mm.side = THREE.DoubleSide; return new THREE.Mesh(g, mm);
    }
    m.add(tri(N, TL, C, STEEL), tri(N, C, TR, SILVER), tri(N, C, K, SILVER));
    m.position.set(-0.2, -0.35, 0);   // clear of the card on the left, low enough to clear the heading, plane still on the page
    var holder = new THREE.Group(); holder.add(m); holder.userData = { yaw: 0, tilt: 0.05, scale: 0.98 };
    return holder;
  }

  var models = [], current = 0, from = -1, t0 = 0, dirSign = 1, clock = 0, last = 0, visible = true, built = false;
  function loadTex(src, srgb) {
    return new Promise(function (res) { new THREE.TextureLoader().load(src, function (t) { if (srgb) t.encoding = THREE.sRGBEncoding; res(t); }, undefined, function () { res(null); }); });
  }
  Promise.all([loadTex(BASE + 'globe-map.jpg', true), loadTex(BASE + 'land-mask.png', false)]).then(function (tx) {
    models = [makeTray(), makeDoc(), makeGlobe(tx[0], tx[1])];
    models.forEach(function (mod, i) { mod.visible = i === current; scene.add(mod); });
    built = true;
    resize();
    document.documentElement.classList.add('alloc-3d-ready');   // hides the flat pictures
    requestAnimationFrame(frame);
  });

  function resize() {
    var w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(stage);

  var OUT = 0.38, IN = 0.62;   // seconds: turn away, turn in
  function easeIn(x) { return x * x * x; }
  function easeOutBack(x) { var s = 1.4; x -= 1; return 1 + (s + 1) * x * x * x + s * x * x; }

  // called by alloc-panels.js when the open panel changes
  window.allocArt = function (i, dir) {
    if (!built || i === current) { current = i; return; }
    from = current; current = i; dirSign = dir >= 0 ? 1 : -1; t0 = clock;
  };

  function pose(mod, spin, k) {
    var u = mod.userData, sway = 0.13 * Math.sin(clock * 0.55), bob = 0.035 * Math.sin(clock * 0.9);
    mod.rotation.set(u.tilt, u.yaw + sway + spin, 0);
    mod.position.y = bob;
    mod.scale.setScalar(u.scale * k);
  }
  function frame(now) {
    var dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016; last = now;
    if (visible) {
      if (!frozen) clock += dt;
      var e = clock - t0;
      models.forEach(function (m) { m.visible = false; });
      if (from >= 0 && e < OUT) {                         // current model turns away edge-on
        var a = easeIn(e / OUT); models[from].visible = true; pose(models[from], dirSign * a * Math.PI / 2, 1 - 0.12 * a);
      } else if (from >= 0 && e < OUT + IN) {             // next model turns in from the other side and settles
        var b = (e - OUT) / IN; models[current].visible = true; pose(models[current], -dirSign * (1 - easeOutBack(b)) * Math.PI / 2, 0.88 + 0.12 * Math.min(1, b * 1.6));
      } else { from = -1; models[current].visible = true; pose(models[current], 0, 1); }
      renderer.render(scene, camera);
    }
    requestAnimationFrame(frame);
  }
  var frozen = false;
  window.setAllocArtTime = function (v, freeze) { clock = v; frozen = !!freeze; };   // for tests
})();
