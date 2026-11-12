// K logo tile: a solid rounded square with real thickness, spinning on a slanted axis and
// floating gently. The K is three raised chrome pieces with bevelled rims, built from the logo mark.
(function () {
  var stage = document.getElementById('k-tile');
  if (!stage || !window.THREE) return;

  var SIZE = 2, RADIUS = 0.36, DEPTH = 0.26;   // tile width/height, corner radius, thickness
  var TURN = 3.2;                              // seconds per full turn
  var SLANT = 0.24, LEAN = 0.18;               // axis tilt to the left and toward the viewer (radians)
  var K_SCALE = 0.094;                         // logo units (28-unit box) to tile units

  var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  stage.appendChild(renderer.domElement);

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
  camera.position.set(0, 0, 7.2);

  scene.add(new THREE.HemisphereLight(0xdfe8ff, 0x1a2a44, 0.9));
  var key = new THREE.DirectionalLight(0xffffff, 0.9); key.position.set(-2, 3, 4); scene.add(key);
  var rim = new THREE.DirectionalLight(0xa9c4ff, 0.6); rim.position.set(3, -1, -2); scene.add(rim);

  // Studio reflections for the chrome: bright sky with soft light strips over a dark floor
  function studioEnv() {
    var c = document.createElement('canvas'); c.width = 1024; c.height = 512;
    var g = c.getContext('2d');
    var sky = g.createLinearGradient(0, 0, 0, 512);
    sky.addColorStop(0, '#ffffff'); sky.addColorStop(0.5, '#e4e9f1'); sky.addColorStop(0.62, '#9aa4b4');
    sky.addColorStop(1, '#2a313d');
    g.fillStyle = sky; g.fillRect(0, 0, 1024, 512);
    var band = g.createLinearGradient(0, 0, 1024, 0); // light and shade around the horizon, swept by the spin
    [[0, 0.0], [0.12, 0.35], [0.25, 0.0], [0.4, 0.3], [0.55, 0.0], [0.7, 0.35], [0.85, 0.0], [1, 0.0]].forEach(function (s) {
      band.addColorStop(s[0], 'rgba(70,80,98,' + s[1] + ')');
    });
    g.fillStyle = band; g.fillRect(0, 150, 1024, 230);
    g.fillStyle = '#ffffff';
    [[60, 180, 200, 70], [560, 200, 240, 60], [330, 60, 160, 40], [860, 90, 120, 50]].forEach(function (r) { g.fillRect(r[0], r[1], r[2], r[3]); });
    var tex = new THREE.CanvasTexture(c);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    var pm = new THREE.PMREMGenerator(renderer);
    var env = pm.fromEquirectangular(tex).texture;
    pm.dispose(); tex.dispose();
    return env;
  }
  var env = studioEnv();

  function roundedRect(w, h, r) {
    var s = new THREE.Shape(), x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
    return s;
  }

  // Smooth navy face with a soft diagonal sheen
  function faceTexture() {
    var N = 1024, c = document.createElement('canvas'); c.width = c.height = N;
    var g = c.getContext('2d');
    var bg = g.createLinearGradient(0, 0, N, N);
    bg.addColorStop(0, '#3c5f92'); bg.addColorStop(0.45, '#1f3a64'); bg.addColorStop(1, '#2d4c7c');
    g.fillStyle = bg; g.fillRect(0, 0, N, N);
    var sheen = g.createLinearGradient(0, 0, N, N * 0.6);
    sheen.addColorStop(0.3, 'rgba(255,255,255,0)'); sheen.addColorStop(0.5, 'rgba(255,255,255,0.12)'); sheen.addColorStop(0.7, 'rgba(255,255,255,0)');
    g.fillStyle = sheen; g.fillRect(0, 0, N, N);
    var t = new THREE.CanvasTexture(c);
    t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    t.repeat.set(1 / SIZE, 1 / SIZE); t.offset.set(0.5, 0.5); // shape coordinates (-1..1) to texture (0..1)
    return t;
  }

  // Smooth silver sweep for the chrome pieces
  function brushedTexture() {
    var N = 512, c = document.createElement('canvas'); c.width = c.height = N;
    var g = c.getContext('2d');
    var grad = g.createLinearGradient(0, 0, N, N); // silver: bright top left, grey sweep, darker bottom right
    grad.addColorStop(0, '#ffffff'); grad.addColorStop(0.35, '#e6e9ee'); grad.addColorStop(0.5, '#aeb5c0');
    grad.addColorStop(0.62, '#e9ecf0'); grad.addColorStop(1, '#9aa2ae');
    g.fillStyle = grad; g.fillRect(0, 0, N, N);
    var t = new THREE.CanvasTexture(c);
    var span = 15 * K_SCALE;                        // K width/height in tile units
    t.repeat.set(1 / span, -1 / span); t.offset.set(0.5, 0.5); // cap coordinates to texture (0..1)
    return t;
  }

  // K outline paths from the logo mark (absolute M, L, H, V, C, Z only)
  var K_PATHS = [
    'M7 7.7C7 7.3134 7.3134 7 7.7 7H13.3C13.6866 7 14 7.3134 14 7.7V13.3589C14 13.5229 13.9425 13.6816 13.8374 13.8075L8.23742 20.5173C7.81808 21.0198 7 20.7233 7 20.0688V7.7Z',
    'M15 12.4574C15 13.0588 15.7083 13.3802 16.161 12.9842L21.5979 8.2268C22.0844 7.80117 21.7833 7 21.137 7H15.7C15.3134 7 15 7.3134 15 7.7V12.4574Z',
    'M15 14.6899C15 14.0663 15.754 13.754 16.195 14.195L21.805 19.805C22.246 20.246 21.9337 21 21.3101 21H15.7C15.3134 21 15 20.6866 15 20.3V14.6899Z'
  ];
  function pathToShape(d) {
    var tok = d.match(/[MLHVCZ]|-?\d*\.?\d+/g), s = new THREE.Shape(), i = 0, cmd, x = 0, y = 0;
    function n() { return parseFloat(tok[i++]); }
    function X(v) { return (v - 14.5) * K_SCALE; }   // centre the K on the face
    function Y(v) { return (14 - v) * K_SCALE; }     // SVG y runs down, 3D y runs up
    while (i < tok.length) {
      if (/[A-Z]/.test(tok[i])) cmd = tok[i++];
      if (cmd === 'M') { x = n(); y = n(); s.moveTo(X(x), Y(y)); cmd = 'L'; }
      else if (cmd === 'L') { x = n(); y = n(); s.lineTo(X(x), Y(y)); }
      else if (cmd === 'H') { x = n(); s.lineTo(X(x), Y(y)); }
      else if (cmd === 'V') { y = n(); s.lineTo(X(x), Y(y)); }
      else if (cmd === 'C') {
        var x1 = n(), y1 = n(), x2 = n(), y2 = n(); x = n(); y = n();
        s.bezierCurveTo(X(x1), Y(y1), X(x2), Y(y2), X(x), Y(y));
      } else if (cmd === 'Z') { cmd = null; }
    }
    return s;
  }

  var shape = roundedRect(SIZE, SIZE, RADIUS);
  var body = new THREE.ExtrudeGeometry(shape, { depth: DEPTH, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 4, curveSegments: 24 });
  body.translate(0, 0, -DEPTH / 2);
  var sideMat = new THREE.MeshStandardMaterial({ color: 0x4a6ea6, metalness: 0.55, roughness: 0.28 });

  var tile = new THREE.Group();      // spins on the slanted axis
  var content = new THREE.Group();
    tile.add(content);
  content.add(new THREE.Mesh(body, sideMat));

  var faceGeo = new THREE.ShapeGeometry(roundedRect(SIZE * 0.97, SIZE * 0.97, RADIUS * 0.95), 24);
  var faceMat = new THREE.MeshStandardMaterial({ map: faceTexture(), metalness: 0.25, roughness: 0.45 });
  var FACE_Z = DEPTH / 2 + 0.051;
  var front = new THREE.Mesh(faceGeo, faceMat); front.position.z = FACE_Z;
  var back = new THREE.Mesh(faceGeo, faceMat); back.rotation.y = Math.PI; back.position.z = -FACE_Z;
  content.add(front, back);

  // Raised chrome K: a thin slab with a rounded bevel that catches bright rim highlights
  var kGeo = new THREE.ExtrudeGeometry(K_PATHS.map(pathToShape), {
    depth: 0.02, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.016, bevelOffset: -0.014, bevelSegments: 6, curveSegments: 16
  });
  var kMat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: brushedTexture(), metalness: 1, roughness: 0.2, envMap: env, envMapIntensity: 1.25 });
  var rimMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness: 0.08, envMap: env, envMapIntensity: 2 });
  var kMats = [kMat, rimMat];      // flat tops brushed, bevelled rims polished
  var kFront = new THREE.Mesh(kGeo, kMats); kFront.position.z = FACE_Z;
  var kBack = new THREE.Mesh(kGeo, kMats); kBack.rotation.y = Math.PI; kBack.position.z = -FACE_Z;
  content.add(kFront, kBack);

  var axis = new THREE.Group();     // slanted axis the tile spins around
  axis.rotation.z = SLANT; axis.rotation.x = LEAN;
  axis.add(tile);
  scene.add(axis);

  function resize() {
    var w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize); resize();

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var visible = true;
  if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(stage);
  var shadow = stage.parentNode.querySelector('.k-shadow');
  var t = 0, last = 0;
  window.setKTime = function (v) { reduce = true; t = v; draw(); };
  function draw() {
    tile.rotation.y = reduce && t === 0 ? -0.5 : 2 * Math.PI * t / TURN;
    var lift = Math.sin(2 * Math.PI * t / 4);
    axis.position.y = 0.24 * lift;                                        // float up and down
    if (shadow) {                                                         // shadow shrinks and fades as the tile rises
      shadow.style.transform = 'scale(' + (0.86 - 0.14 * lift).toFixed(3) + ')';
      shadow.style.opacity = (0.75 - 0.25 * lift).toFixed(3);
    }
    axis.rotation.x = LEAN + 0.06 * Math.sin(2 * Math.PI * t / 4);      // slight wobble
    renderer.render(scene, camera);
  }
  function frame(now) {
    var dt = last ? (now - last) / 1000 : 0; last = now;
    if (!reduce && visible) t += Math.min(dt, 0.1);
    draw(); requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
