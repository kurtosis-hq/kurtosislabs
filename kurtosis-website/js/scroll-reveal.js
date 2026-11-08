// Scroll-in reveal for everything below the hero ("soft drift", variant C of the test bed).
// Cards, pictures and panels rise into place with a light blur; their headings and paragraphs
// follow a beat later, each word drifting up and brightening one after another.
(function () {
  // REWIND: true = scrolling back up hides what has gone off the bottom of the screen again, so it
  // plays once more on the next pass down. Set to false to reveal each element once and leave it.
  var REWIND = true;
  var css = [
    '.sv-w{display:inline-block;will-change:opacity,translate;opacity:.08;translate:0 0.5em;transition:opacity .6s ease,translate .7s cubic-bezier(.25,.8,.25,1)}',
    '.sv-in .sv-w{opacity:1;translate:0 0}',
    '.sv-b{will-change:opacity,translate,filter;opacity:0;translate:0 90px;filter:blur(4px);transition:opacity .9s ease,translate 1.1s cubic-bezier(.2,.7,.2,1),filter .9s ease}',
    '.sv-b.sv-in{opacity:1;translate:0 0;filter:none}',
    // boxes that hold the page still only fade, so nothing slides while the page is stopped
    '.sv-b.sv-calm{translate:0 0;filter:none;transition:opacity .6s ease}',
    '@media (prefers-reduced-motion:reduce){.sv-w,.sv-b{transition:none!important;opacity:1!important;filter:none!important;translate:0 0!important}}'
  ].join('\n');
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var canvas = document.querySelector('.canvas');
  if (!canvas) return;
  function pageTop(el) { var r = el.getBoundingClientRect(); return r.top + (window.scrollY || window.pageYOffset); }
  var heroBottom = (function () { var h = document.getElementById('hero-flip'); return h ? pageTop(h) + h.getBoundingClientRect().height : 0; })();
  function belowHero(el) { return pageTop(el) >= heroBottom - 2; }

  // text that JavaScript rewrites (chart stage cards) or that sits inside moving parts is left alone
  var SKIP = '#cycle, #cy-step, #cy-check, .chip, .exit, .live-tag, .faq-btn, .btn, button, label, #signup-note, header';
  var TEXT = 'h2, h3, p, .t-h4, .t-path, .t-num, .faq-q, .faq-num';
  // (cards that already animate on their own, like the product cards, are revealed through their column instead;
  // the Allocation background photo stays still)
  var BLOCK = '.bento, #prod-left, .prod-pane > .p-card, .dash-well, .dash-img, #alloc-panels, .alloc-3d, .serve-card, .rule, .phil-photo, .signup, .rule-white, .step-pill, .path-rule';

  // sections that stay still: the footer
  var STILL = 'footer';

  var CALM = '.bento, #prod-left, .prod-pane > .p-card, .dash-well, .dash-img, #alloc-panels';
  var texts = [], blocks = [];
  Array.prototype.slice.call(canvas.querySelectorAll(TEXT)).forEach(function (el) {
    if (el.closest(SKIP) || el.closest(STILL) || !belowHero(el) || texts.some(function (t) { return t.contains(el); })) return;
    texts.push(el);
  });
  Array.prototype.slice.call(document.querySelectorAll(BLOCK)).forEach(function (el) {
    if (!belowHero(el) || el.closest(STILL)) return;
    el.classList.add('sv-b'); blocks.push(el);
    if (el.matches(CALM)) el.classList.add('sv-calm');
  });

  // wrap each word (keeping <b>, <br> and other tags) in a span with its own delay
  function splitWords(el) {
    el.classList.remove('reveal');
    var i = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (w) {
            if (!w) return;
            if (!w.trim()) { frag.appendChild(document.createTextNode(w)); return; }
            var s = document.createElement('span'); s.className = 'sv-w'; s.textContent = w;
            s.style.transitionDelay = (i++ * 0.035).toFixed(3) + 's';
            frag.appendChild(s);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.nodeName !== 'BR') walk(n);
      });
    })(el);
  }

  function start() {
    texts.forEach(splitWords);
    if (!('IntersectionObserver' in window)) { texts.concat(blocks).forEach(function (el) { el.classList.add('sv-in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      // what entered together is revealed top to bottom, a beat apart; text waits for its card
      var hits = entries.filter(function (e) { return e.isIntersecting && !e.target.classList.contains('sv-in'); }).map(function (e) { return e.target; });
      hits.sort(function (a, b) { return a.getBoundingClientRect().top - b.getBoundingClientRect().top; });
      hits.forEach(function (el, k) {
        var lag = k * 0.08 + (texts.indexOf(el) >= 0 ? 0.25 : 0);
        if (el.classList.contains('sv-b')) { el.style.transitionDelay = lag.toFixed(2) + 's'; el.classList.add('sv-in'); }
        else { clearTimeout(el._svT); el._svT = setTimeout(function () { el.classList.add('sv-in'); }, lag * 1000); }
        if (!REWIND) io.unobserve(el);
      });
      // rewind: anything that has dropped off the bottom of the screen goes back to its hidden state
      if (REWIND) entries.forEach(function (e) {
        if (e.isIntersecting || e.boundingClientRect.top < 0) return;
        var el = e.target;
        clearTimeout(el._svT);
        if (el.classList.contains('sv-b')) el.style.transitionDelay = '0s';
        el.classList.remove('sv-in');
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
    texts.concat(blocks).forEach(function (el) { io.observe(el); });
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(start); else window.addEventListener('load', start);
})();
