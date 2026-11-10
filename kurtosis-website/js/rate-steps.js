// Rate points: three points (01 to 03) shown one at a time beside the coin ring. When the section
// reaches the middle of the screen it is held in place; each scroll step shows the next point and
// fills the bar on the left a further third. After 03 the page scrolls on; scrolling back up reverses.
// The first step waits until the coins have formed their circle (js/coin-ring.js).
(function () {
  var sec = document.querySelector('.sec-rate');
  if (!sec) return;
  var steps = Array.prototype.slice.call(sec.querySelectorAll('.rate-step'));
  var fill = sec.querySelector('.rate-bar-fill');
  var N = steps.length;
  var STEP = 110;      // wheel or swipe distance that moves one point (about half a trackpad swipe)
  var SETTLE = 450;    // ms to ignore input after a change, so trackpad momentum can't skip a point
  var idx = 0, acc = 0, lockedAt = 0, locked = false;
  var fluid = document.body.classList.contains('responsive');
  var controls = Array.prototype.slice.call(sec.querySelectorAll('[data-rate]'));
  function canHold() { return !fluid || (window.innerWidth >= 1024 && sec.getBoundingClientRect().height <= window.innerHeight - 120); }

  function layout() {
    steps.forEach(function (s, i) {
      s.classList.toggle('is-on', i === idx);
      s.setAttribute('aria-hidden', i === idx ? 'false' : 'true');
    });
    if (fill) fill.style.height = ((idx + 1) / N * 100) + '%';
    controls.forEach(function (button, i) { button.setAttribute('aria-pressed', String(i === idx)); });
  }
  function go(i) { if (i === idx || i < 0 || i >= N) return false; idx = i; acc = 0; lockedAt = Date.now(); layout(); return true; }
  controls.forEach(function (button, i) { button.addEventListener('click', function () { go(i); }); });
  layout();

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  function ringReady() { return sec.dataset.ringWait === '0' || !window.ringIntroDone || window.ringIntroDone(); }   // mobile: the ring is below the held view, so the points don't wait for it

  // where the section sits while held: centred, or top-aligned if it's taller than the screen
  function target() {
    // a section taller than the screen (mobile) names the part to keep centred while held
    // mobile: the section's top edge stops this many Figma px below the top of the screen
    if (sec.dataset.holdAt) return parseFloat(sec.dataset.holdAt) * sec.getBoundingClientRect().width / parseFloat(sec.dataset.holdW || 375);
    var mk = sec.dataset.holdEl && sec.querySelector(sec.dataset.holdEl);
    if (mk) { var r = mk.getBoundingClientRect(); return (window.innerHeight - r.height) / 2 - (r.top - sec.getBoundingClientRect().top); }
    var h = sec.getBoundingClientRect().height; return Math.max(0, (window.innerHeight - h) / 2);
  }
  function snap() { window.scrollTo({ top: (window.scrollY || window.pageYOffset) + sec.getBoundingClientRect().top - target(), behavior: 'instant' }); }
  var lastInput = 0, lastTop = sec.getBoundingClientRect().top;

  // returns true when the movement was used here (so the page must not move)
  function take(dy) {
    if (!canHold()) { locked = false; return false; }
    lastInput = Date.now();
    var top = sec.getBoundingClientRect().top, t = target();
    lastTop = top;
    if (!locked) {
      // engage on the scroll step that would carry the box past its hold point, so the page stops exactly
      // there instead of overshooting and snapping back
      if (dy > 0 && idx < N - 1 && top - dy <= t + 1 && top > t - window.innerHeight * 0.6) { locked = true; snap(); acc = 0; lockedAt = Date.now(); return true; }
      if (dy < 0 && idx > 0 && top - dy >= t - 1 && top < t + window.innerHeight * 0.6) { locked = true; snap(); acc = 0; lockedAt = Date.now(); return true; }
      return false;
    }
    if (Math.abs(top - t) > 2) snap();   // momentum slipped past: put the section back
    if (!ringReady() || Date.now() - lockedAt < SETTLE) { acc = 0; return true; }   // coins still arriving, or the last change still settling
    acc += dy;
    if (acc > STEP) {
      if (idx < N - 1) go(idx + 1); else { locked = false; acc = 0; }   // 03 shown: one more deliberate scroll moves on
    } else if (acc < -STEP) {
      if (idx > 0) go(idx - 1); else { locked = false; acc = 0; }
    }
    return true;
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
    if (/^(INPUT|TEXTAREA|BUTTON|A|SELECT)$/.test(tag)) return;
    var step = { ArrowDown: 120, ArrowUp: -120, PageDown: 600, PageUp: -600, ' ': e.shiftKey ? -600 : 600 }[e.key];
    if (step && take(step > 0 ? STEP + 1 : -STEP - 1)) e.preventDefault();
  });

  // Keeps the section in place while held, even against trackpad momentum, and catches it if a fast
  // flick carries it past the middle before the hold engages. When not held, the points reset for the
  // way the section will next be entered (01 from above, 03 from below), so a skip can't switch it off.
  window.addEventListener('scroll', function () {
    if (!canHold()) { locked = false; return; }
    var r = sec.getBoundingClientRect(), t = target(), top = r.top, prev = lastTop;
    lastTop = top;
    if (locked) {
      if (r.bottom < 0 || r.top > window.innerHeight) { locked = false; return; }
      if (Math.abs(top - t) > 2) snap();
      return;
    }
    if (prev !== null && Date.now() - lastInput <= 1000) {
      var down = prev > t && top <= t && idx < N - 1, up = prev < t && top >= t && idx > 0;
      if (down || up) { locked = true; acc = 0; lockedAt = Date.now(); snap(); return; }
    }
    if (top > t + 2 && idx !== 0) { idx = 0; acc = 0; layout(); }
    else if (top < t - 2 && idx !== N - 1) { idx = N - 1; acc = 0; layout(); }
  }, { passive: true });

  window.setRateStep = function (i) { go(i); };   // for tests
})();
