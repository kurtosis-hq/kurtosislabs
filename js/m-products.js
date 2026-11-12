// Mobile Products: both products are shown one under the other (Figma "Mobile view" 36:3497).
// Horizon's live chart works as on the desktop: when Capital Planning and the two cards under it are on
// screen they are held in place, and each scroll step moves the chart to the next stage of the cycle
// (Cycle Starts, Transition, Near Date, Target Date). After the last stage the page scrolls on;
// scrolling back up reverses it. The chart is drawn at the desktop's size and scaled down in CSS,
// so the drawing code below is the desktop's (js/products-switch.js).
(function () {
  var zone = document.getElementById('m-cycle-zone');
  if (!zone) return;
  function u(n) { return 'calc(' + n + ' * var(--u))'; }
  // ---- Allocation chart. Screenshot pixels, scaled by K into page units
  var K = 0.25703;
  var BX = [583, 705, 834, 954, 1080, 1201, 1327, 1448, 1572, 1694], BW = 90;   // measured from the reference dashboard
  var TOP = [674, 691, 708, 723, 738, 756, 770, 783, 795, 805];    // top of the floating (light) part
  var BOT = [847, 856, 869, 882, 896, 913, 929, 943, 961, 978];    // bottom of the fixed (dark) part
  var SPLIT = 826, SPLIT_GAP = 3;
  var HI = [0, 3, 6, 9];                                            // bar highlighted at each stage
  var LAB_C = [178, 467, 741, 1027];                                // label centres from the nav's left edge
  var cyc = document.getElementById('cycle'), bars = [], pill, labs = [];
  if (cyc) {
    var bw = cyc.querySelector('.cy-bars');
    BX.forEach(function () { var b = document.createElement('div'); b.className = 'cy-bar'; b.innerHTML = '<i class="lt"></i><i class="dk"></i>'; bw.appendChild(b); bars.push(b); });
    pill = cyc.querySelector('.cy-pill');
    labs = Array.prototype.slice.call(cyc.querySelectorAll('.cy-lab'));
    labs.forEach(function (l, i) { l.style.left = u((LAB_C[i] - 170) * K); });
  }
  function drawCycle(stage) {                                       // stage -1: as on arrival, Cycle Starts selected, no bar raised
    bars.forEach(function (b, i) {
      var t = TOP[i], bo = BOT[i];
      b.style.left = u(BX[i] * K); b.style.width = u(BW * K);
      b.style.top = u(t * K); b.style.height = u((bo - t) * K);
      b.firstChild.style.height = u((SPLIT - t) * K);
      b.lastChild.style.height = u((bo - SPLIT - SPLIT_GAP) * K);
      b.classList.toggle('is-hi', stage >= 0 && HI[stage] === i);
    });
    if (pill) {
      var on = Math.max(stage, 0);
      pill.style.opacity = 1;
      pill.style.left = u((LAB_C[on] - 170) * K);
      labs.forEach(function (l, i) { l.classList.toggle('is-on', i === on); });
    }
    showStage(Math.max(stage, 0));
  }

  // ---- The two cards under the chart follow the selected stage
  var STAGES = [
    { s: 'Cycle Starts', n: '01', t: 'Keep your options open.', b: 'Start with eligible variable-rate positions. Check how easily you could sell or redeem each holding.',
      T: 'Know Your Limit', m: 'Your mandate, position sizes and available cash', c: 'Invest only within approved limits.' },
    { s: 'Transition', n: '02', t: 'Is a fixed rate worth it?', b: 'Weigh the income against the cost of committing capital and the risk of a harder exit.',
      T: 'Check The Commitment', m: 'Income, maturity date, trading costs and exit risks', c: 'Choose positions that fit your date and mandate.' },
    { s: 'Near Date', n: '03', t: 'Plan your exit', b: 'Review investments due to mature around your date. Check what could delay repayment.',
      T: 'Know what could delay cash', m: 'Repayment dates, redemption terms and settlement', c: 'Check the route back to cash before relying on it.' },
    { s: 'Target Date', n: '04', t: 'Withdraw or reinvest?', b: 'Review available proceeds and withdrawal terms before choosing your next move.',
      T: 'Check what is available', m: 'Cash available, withdrawal terms and remaining holdings', c: 'Reinvest only if the next cycle fits your cash needs.' }
  ];
  var stepCard = document.getElementById('cy-step'), checkCard = document.getElementById('cy-check');
  var shown = 0, swapTimer = null;
  function fill(card, map) {
    Object.keys(map).forEach(function (f) { var el = card.querySelector('[data-f="' + f + '"]'); if (el) el.textContent = map[f]; });
  }
  function showStage(s) {
    if (!stepCard || !checkCard || s === shown) return;
    shown = s;
    stepCard.classList.add('is-swap'); checkCard.classList.add('is-swap');
    clearTimeout(swapTimer);
    swapTimer = setTimeout(function () {                          // swap while faded out, then fade back in
      var d = STAGES[shown];
      fill(stepCard, { n: d.n, t: d.t, b: d.b, s: d.s });
      fill(checkCard, { t: d.T, m: d.m, c: d.c, s: d.s });
      stepCard.classList.remove('is-swap'); checkCard.classList.remove('is-swap');
    }, 250);
  }


  var STEPS = [-1, 0, 1, 2, 3], N = STEPS.length;
  var STEP = 60, SETTLE = 300;   // a quarter swipe per chart stage
  var idx = 0, acc = 0, lockedAt = 0, locked = false;
  function go(i) { if (i === idx || i < 0 || i >= N) return false; idx = i; acc = 0; lockedAt = Date.now(); drawCycle(STEPS[idx]); return true; }
  labs.forEach(function (l, i) { l.style.cursor = 'pointer'; l.addEventListener('click', function () { go(i + 1); }); });
  drawCycle(-1);

  // The Checks bars slide in once, when the card first comes into view
  var exitCard = document.getElementById('exit-card');
  if (exitCard) {
    if ('IntersectionObserver' in window) {
      var eio = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { exitCard.classList.add('exits-in'); eio.disconnect(); } }, { threshold: 0.5 });
      eio.observe(exitCard);
    } else exitCard.classList.add('exits-in');
  }

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;   // stages still change on tap; no scroll hold

  function target() { var h = zone.getBoundingClientRect().height; return (window.innerHeight - h) / 2; }
  function snap() { window.scrollTo({ top: (window.scrollY || window.pageYOffset) + zone.getBoundingClientRect().top - target(), behavior: 'instant' }); }
  var lastInput = 0, lastTop = zone.getBoundingClientRect().top;
  function take(dy) {
    lastInput = Date.now();
    var top = zone.getBoundingClientRect().top, t = target();
    lastTop = top;
    if (!locked) {
      if (dy > 0 && idx < N - 1 && top - dy <= t + 1 && top > t - window.innerHeight * 0.6) { locked = true; snap(); acc = 0; lockedAt = Date.now(); return true; }
      if (dy < 0 && idx > 0 && top - dy >= t - 1 && top < t + window.innerHeight * 0.6) { locked = true; snap(); acc = 0; lockedAt = Date.now(); return true; }
      return false;
    }
    if (Math.abs(top - t) > 2) snap();
    if (Date.now() - lockedAt < SETTLE) { acc = 0; return true; }
    acc += dy;
    if (acc > STEP) { if (idx < N - 1) go(idx + 1); else { locked = false; acc = 0; } }
    else if (acc < -STEP) { if (idx > 0) go(idx - 1); else { locked = false; acc = 0; } }
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
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    var step = { ArrowDown: 120, ArrowUp: -120, PageDown: 600, PageUp: -600, ' ': e.shiftKey ? -600 : 600 }[e.key];
    if (step && take(step > 0 ? STEP + 1 : -STEP - 1)) e.preventDefault();
  });
  window.addEventListener('scroll', function () {
    var r = zone.getBoundingClientRect(), t = target(), top = r.top, prev = lastTop;
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
    // not held: reset for the way the chart will next be entered, so a skip can't leave it part-way
    if (top > t + 2 && idx !== 0) { idx = 0; drawCycle(STEPS[0]); }
    else if (top < t - 2 && idx !== N - 1) { idx = N - 1; drawCycle(STEPS[N - 1]); }
  }, { passive: true });
  window.setCycleStep = function (i) { go(i); };   // for tests
})();
