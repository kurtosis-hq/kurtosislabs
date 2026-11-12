// Product switcher: Kurtosis Ratings and Horizon. One product card is open (icon, text,
// button) and the other folds into a short title card; the right-hand panels cross-fade to match.
// When the section reaches the middle of the screen it is held in place and one scroll step moves
// to the next product. After the last one the page scrolls on; scrolling back up reverses it.
(function () {
  var col = document.getElementById('prod-left');
  var bento = document.querySelector('.bento');
  if (!col || !bento) return;
  var cards = Array.prototype.slice.call(col.querySelectorAll('.prod-card'));
  var panes = Array.prototype.slice.call(document.querySelectorAll('.prod-pane'));
  // Steps: Ratings, Horizon on arrival (no bar raised), then Horizon's four cycle stages
  var HZ = 1, STEPS = [{ p: 0, s: 3 }, { p: HZ, s: -1 }, { p: HZ, s: 0 }, { p: HZ, s: 1 }, { p: HZ, s: 2 }, { p: HZ, s: 3 }];
  var N = STEPS.length;
  var OPEN_H = 566, SHUT_H = 117, GAP = 17, MARK_H = 265;   // Figma pixels (two products: open card 566, folded card 117)
  var STEP = 110, SETTLE = 650, STAGE_STEP = 60, STAGE_SETTLE = 300;   // SETTLE covers the full card and panel animation
  var idx = 0, acc = 0, lockedAt = 0, locked = false;

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
    { n: '01', t: 'Keep your options open.', b: 'Start with eligible variable-rate positions. Check how easily you could sell or redeem each holding.',
      T: 'Know Your Limit', m: 'Your mandate, position sizes and available cash', c: 'Invest only within approved limits.' },
    { n: '02', t: 'Is a fixed rate worth it?', b: 'Weigh the income against the cost of committing capital and the risk of a harder exit.',
      T: 'Check The Commitment', m: 'Income, maturity date, trading costs and exit risks', c: 'Choose positions that fit your date and mandate.' },
    { n: '03', t: 'Plan your exit', b: 'Review investments due to mature around your date. Check what could delay repayment.',
      T: 'Know what could delay cash', m: 'Repayment dates, redemption terms and settlement', c: 'Check the route back to cash before relying on it.' },
    { n: '04', t: 'Withdraw or reinvest?', b: 'Review available proceeds and withdrawal terms before choosing your next move.',
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
      fill(stepCard, { n: d.n, t: d.t, b: d.b });
      fill(checkCard, { t: d.T, m: d.m, c: d.c });
      stepCard.classList.remove('is-swap'); checkCard.classList.remove('is-swap');
    }, 250);
  }

  var mark = col.querySelector('.pc-mark');
  var dots = Array.prototype.slice.call(document.querySelectorAll('.prod-dots i'));
  function layout() {
    var y = 0, prod = STEPS[idx].p;
    drawCycle(idx === 0 ? -1 : STEPS[idx].s);   // before Horizon the chart waits at its arrival state
    cards.forEach(function (c, i) {
      var open = i === prod, h = open ? OPEN_H : SHUT_H;
      c.style.top = u(y); c.style.height = u(h);
      if (open && mark) { mark.style.top = u(y + (OPEN_H - MARK_H) / 2); mark.dataset.p = i; }   // bookmark centred on the open card, in that product's colour
      c.classList.toggle('is-open', open);
      c.querySelector('.pc-full').setAttribute('aria-hidden', open ? 'false' : 'true');
      y += h + GAP;
    });
    dots.forEach(function (d, i) { d.classList.toggle('is-on', i === prod); });
    panes.forEach(function (p, i) {
      p.classList.toggle('is-on', i === prod);
      p.setAttribute('aria-hidden', i === prod ? 'false' : 'true');
    });
  }
  function go(i) { if (i === idx || i < 0 || i >= N) return false; idx = i; acc = 0; lockedAt = Date.now(); layout(); return true; }
  function onStages() { return STEPS[idx].p === HZ && idx >= firstStep(HZ); }   // on Horizon: each chart stage takes a quarter swipe
  function firstStep(p) { for (var k = 0; k < N; k++) if (STEPS[k].p === p) return k; return 0; }
  cards.forEach(function (c, i) { c.addEventListener('click', function () { if (i !== STEPS[idx].p) go(firstStep(i)); }); });
  labs.forEach(function (l, i) { l.style.cursor = 'pointer'; l.addEventListener('click', function () { go(firstStep(HZ) + 1 + i); }); });
  layout();

  // Exit Routes bars slide in once, when the section first comes into view
  var exitCard = document.getElementById('exit-card');
  if (exitCard) {
    if ('IntersectionObserver' in window) {
      var eio = new IntersectionObserver(function (es) {
        if (es[0].isIntersecting) { exitCard.classList.add('exits-in'); eio.disconnect(); }
      }, { threshold: 0.5 });
      eio.observe(exitCard);
    } else exitCard.classList.add('exits-in');
  }

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return; // cards still switch on click; no scroll hold

  function target() { var h = bento.getBoundingClientRect().height; return Math.max(0, (window.innerHeight - h) / 2); }
  function snap() { window.scrollTo({ top: (window.scrollY || window.pageYOffset) + bento.getBoundingClientRect().top - target(), behavior: 'instant' }); }
  var lastInput = 0, lastTop = bento.getBoundingClientRect().top;   // when the user last scrolled by wheel, touch or key; where the box was

  // returns true when the movement was used here (so the page must not move)
  function take(dy) {
    lastInput = Date.now();
    var top = bento.getBoundingClientRect().top, t = target();
    lastTop = top;
    if (!locked) {
      // engage on the scroll step that would carry the box past its hold point, so the page stops exactly
      // there instead of overshooting and snapping back
      if (dy > 0 && idx < N - 1 && top - dy <= t + 1 && top > t - window.innerHeight * 0.6) { locked = true; snap(); acc = 0; lockedAt = Date.now(); return true; }
      if (dy < 0 && idx > 0 && top - dy >= t - 1 && top < t + window.innerHeight * 0.6) { locked = true; snap(); acc = 0; lockedAt = Date.now(); return true; }
      return false;
    }
    if (Math.abs(top - t) > 2) snap();   // momentum slipped past: put the whole box back in the middle
    if (Date.now() - lockedAt < (onStages() ? STAGE_SETTLE : SETTLE)) { acc = 0; return true; }   // chart stages animate faster   // ignore scrolling until the animation has finished
    acc += dy;
    var need = onStages() ? STAGE_STEP : STEP;
    if (acc > need) {
      if (idx < N - 1) go(idx + 1); else { locked = false; acc = 0; }   // past the last product: one more deliberate scroll lets the page move on
    } else if (acc < -need) {
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
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    var step = { ArrowDown: 120, ArrowUp: -120, PageDown: 600, PageUp: -600, ' ': e.shiftKey ? -600 : 600 }[e.key];
    if (step && take(step > 0 ? STEP + 1 : -STEP - 1)) e.preventDefault();
  });

  // Keeps the whole box on screen while held, even if trackpad momentum (which some browsers
  // don't let a page stop) moves the page. It also catches the box if a fast flick carries it past
  // the middle before the hold engages. A scrollbar drag that leaves the section releases it.
  window.addEventListener('scroll', function () {
    var r = bento.getBoundingClientRect(), t = target(), top = r.top, prev = lastTop;
    lastTop = top;
    if (locked) {
      if (r.bottom < 0 || r.top > window.innerHeight) { locked = false; return; }
      if (Math.abs(top - t) > 2) snap();
      return;
    }
    if (prev === null || Date.now() - lastInput > 1000) return;
    var down = prev > t && top <= t && idx < N - 1, up = prev < t && top >= t && idx > 0;
    if (down || up) { locked = true; acc = 0; lockedAt = Date.now(); snap(); }
  }, { passive: true });

  window.setProduct = function (i) { go(i); };
})();
