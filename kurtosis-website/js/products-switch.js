// Cards follow native page scrolling; clicking or tapping keeps the chosen item
// selected until the section leaves the screen. Scrolling is never blocked.
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
  var idx = 0;

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
  function go(i) { if (i === idx || i < 0 || i >= N) return false; idx = i; layout(); return true; }
  function firstStep(p) { for (var k = 0; k < N; k++) if (STEPS[k].p === p) return k; return 0; }
  cards.forEach(function (c, i) { window.KLScroll.button(c, function () { if (i !== STEPS[idx].p) follow.select(firstStep(i)); }); });
  labs.forEach(function (l, i) { l.style.cursor = 'pointer'; window.KLScroll.button(l, function () { follow.select(firstStep(HZ) + 1 + i); }); });
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

  var follow = window.KLScroll.steps(bento, N, go);
  window.setProduct = function (i) { follow.select(i); };
})();
