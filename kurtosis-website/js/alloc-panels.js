// Allocation panels: three cards in a row, one open and the others folded into frosted cards showing their number.
// When the section reaches the middle of the screen it is held in place, and each scroll step
// opens the next card (the one before folds to the left). Once the last card is open the page
// scrolls on; scrolling back up walks through them in reverse.
(function () {
  var box = document.getElementById('alloc-panels');
  var photo = document.querySelector('.alloc-photo');
  if (!box || !photo) return;
  var panels = Array.prototype.slice.call(box.querySelectorAll('.ap-panel'));
  var arts = Array.prototype.slice.call(document.querySelectorAll('.alloc-art'));   // one illustration per panel
  var shownArt = 0;
  var N = panels.length;
  var OPEN_W = 584, SHUT_W = 210, GAP = 18, OPEN_H = 282, SHUT_H = 196; // Figma pixels (frames 76:100, 76:133)
  // mobile: the cards stack top to bottom instead (sizes come from data- attributes on the box)
  var VERT = box.dataset.axis === 'y', COL_W = 0;
  if (VERT) { OPEN_H = +box.dataset.openH; SHUT_H = +box.dataset.shutH; GAP = +box.dataset.gap; COL_W = +box.dataset.w; }
  var STEP = 75;       // wheel or swipe distance that moves one card (about a third of a trackpad swipe)
  var SETTLE = 400;    // ms to ignore input after a change: the full card animation, so trackpad momentum can't skip or release early
  var idx = 0, acc = 0, lockedAt = 0, locked = false;
  var fluid = document.body.classList.contains('responsive');
  function canHold() { return !fluid || (window.innerWidth >= 1024 && photo.getBoundingClientRect().height <= window.innerHeight - 120); }

  function u(n) { return 'calc(' + n + ' * var(--u))'; }
  function layout() {
    // illustration swap: the open card's picture fades in, the previous one fades out (the --from/--to
    // angles are only used by the spin version, kept so it can be switched back on)
    var dir = idx >= shownArt ? 1 : -1;
    arts.forEach(function (im) {
      var i = +im.dataset.i;
      if (i === idx) { im.style.setProperty('--from', (90 * dir) + 'deg'); im.classList.remove('is-out'); im.classList.add('is-on'); }
      else if (i === shownArt) { im.style.setProperty('--to', (-90 * dir) + 'deg'); im.classList.remove('is-on'); im.classList.add('is-out'); }
      else { im.classList.remove('is-on', 'is-out'); }
    });
    if (window.allocArt) window.allocArt(idx, dir);   // 3D models spin to match
    shownArt = idx;
    var x = 0;
    panels.forEach(function (p, i) {
      var open = i === idx;
      if (fluid) {
        p.classList.toggle('is-open', open); p.classList.toggle('is-shut', !open);
        p.querySelector('.ap-body').setAttribute('aria-hidden', String(!open));
        p.querySelector('.ap-tab').setAttribute('aria-expanded', String(open));
        return;
      }
      if (VERT) {
        var hv = open ? OPEN_H : SHUT_H;
        p.style.left = u(0); p.style.width = u(COL_W); p.style.top = u(x); p.style.height = u(hv);
        p.classList.toggle('is-open', open); p.classList.toggle('is-shut', !open);
        p.querySelector('.ap-body').setAttribute('aria-hidden', open ? 'false' : 'true');
        x += hv + GAP;
        return;
      }
      var w = open ? OPEN_W : SHUT_W, h = open ? OPEN_H : SHUT_H;
      p.style.left = u(x); p.style.width = u(w);
      p.style.top = u(OPEN_H - h); p.style.height = u(h);   // bars line up with the card's bottom edge
      p.classList.toggle('is-open', open); p.classList.toggle('is-shut', !open);
      p.querySelector('.ap-body').setAttribute('aria-hidden', open ? 'false' : 'true');
      x += w + GAP;
    });
  }
  function go(i) { if (i === idx || i < 0 || i >= N) return false; idx = i; acc = 0; lockedAt = Date.now(); layout(); return true; }
  panels.forEach(function (p, i) { p.querySelector('.ap-tab').addEventListener('click', function () { go(i); }); });
  layout();

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return; // panels still open on click; no scroll hold

  // where the photo should sit while held: centred, or top-aligned if it's taller than the screen
  function target() { var h = photo.getBoundingClientRect().height; return Math.max(0, (window.innerHeight - h) / 2); }
  function snap() { window.scrollTo({ top: (window.scrollY || window.pageYOffset) + photo.getBoundingClientRect().top - target(), behavior: 'instant' }); }
  var lastInput = 0, lastTop = photo.getBoundingClientRect().top;   // when the user last scrolled by wheel, touch or key; where the box was

  // returns true when the movement was used here (so the page must not move)
  function take(dy) {
    if (!canHold()) { locked = false; return false; }
    lastInput = Date.now();
    var top = photo.getBoundingClientRect().top, t = target();
    lastTop = top;
    if (!locked) {
      // engage on the scroll step that would carry the box past its hold point, so the page stops exactly
      // there instead of overshooting and snapping back
      if (dy > 0 && idx < N - 1 && top - dy <= t + 1 && top > t - window.innerHeight * 0.6) { locked = true; snap(); acc = 0; lockedAt = Date.now(); return true; }
      if (dy < 0 && idx > 0 && top - dy >= t - 1 && top < t + window.innerHeight * 0.6) { locked = true; snap(); acc = 0; lockedAt = Date.now(); return true; }
      return false;
    }
    if (Math.abs(top - t) > 2) snap();   // momentum slipped past: put the whole box back in the middle
    if (Date.now() - lockedAt < SETTLE) { acc = 0; return true; }   // let the last change finish
    acc += dy;
    if (acc > STEP) {
      if (idx < N - 1) go(idx + 1); else { locked = false; acc = 0; }   // last card shown: one more deliberate scroll moves on
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

  // scrollbar drags or jumps past the section never get stuck: drop the hold if it leaves the screen
  // Keeps the whole box on screen while held, even if trackpad momentum (which some browsers
  // don't let a page stop) moves the page. It also catches the box if a fast flick carries it past
  // the middle before the hold engages. A scrollbar drag that leaves the section releases it.
  window.addEventListener('scroll', function () {
    if (!canHold()) { locked = false; return; }
    var r = photo.getBoundingClientRect(), t = target(), top = r.top, prev = lastTop;
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
    // not held: keep the cards ready for the way the section will next be entered, so a skip past it can
    // never leave the hold switched off. Above its hold point it waits on card 01 (scrolling down steps
    // 01, 02, 03); below, on card 03 (scrolling up steps back)
    if (top > t + 2 && idx !== 0) { idx = 0; acc = 0; layout(); }
    else if (top < t - 2 && idx !== N - 1) { idx = N - 1; acc = 0; layout(); }
  }, { passive: true });

  window.setAllocPanel = function (i) { go(i); };
})();
