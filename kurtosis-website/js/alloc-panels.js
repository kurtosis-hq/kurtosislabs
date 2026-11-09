// Cards follow native page scrolling; clicking or tapping keeps the chosen item
// selected until the section leaves the screen. Scrolling is never blocked.
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
  var idx = 0;

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
  function go(i) { if (i === idx || i < 0 || i >= N) return false; idx = i; layout(); return true; }
  panels.forEach(function (p, i) { p.querySelector('.ap-tab').addEventListener('click', function () { follow.select(i); }); });
  layout();

  var follow = window.KLScroll.steps(box, N, go);
  window.setAllocPanel = function (i) { follow.select(i); };
})();
