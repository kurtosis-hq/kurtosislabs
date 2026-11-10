// Mobile navigation: clear over the hero, a black bar once the page scrolls (as the desktop nav turns
// into its black bar). The menu button opens a full-screen menu with the same links as the desktop
// nav; Products opens to show Kurtosis Ratings and Kurtosis Horizon.
(function () {
  var nav = document.getElementById('m-nav'), menu = document.getElementById('m-menu');
  var burger = document.getElementById('m-burger'), close = document.getElementById('m-close');
  var prod = document.getElementById('m-products'), sub = document.getElementById('m-sub');
  if (!nav || !menu) return;
  function solid() { nav.classList.toggle('is-solid', (window.scrollY || window.pageYOffset) > 8); }
  window.addEventListener('scroll', solid, { passive: true }); solid();
  var previousOverflow = '';
  function open(on, restoreFocus) {
    if (on && menu.hidden) previousOverflow = document.documentElement.style.overflow;
    menu.hidden = !on; burger.setAttribute('aria-expanded', on ? 'true' : 'false');
    document.documentElement.style.overflow = on ? 'hidden' : previousOverflow;
    if (on) close.focus(); else if (restoreFocus !== false) burger.focus({ preventScroll: true });
  }
  burger.addEventListener('click', function () { open(true); });
  close.addEventListener('click', function () { open(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) open(false); });
  menu.addEventListener('click', function (e) { var a = e.target.closest('a'); if (a) open(false); });
  // Keep the landing page's scroll-driven animations from consuming menu scrolling.
  ['wheel', 'touchmove'].forEach(function (type) {
    menu.addEventListener(type, function (e) { e.stopPropagation(); }, { passive: true });
  });
  // Contact and Coming Soon stay on the same document when their desktop nav appears.
  // Release the scroll lock and move focus out of the now-hidden phone menu.
  window.addEventListener('resize', function () {
    if (!menu.hidden && getComputedStyle(nav).display === 'none') {
      var hadFocus = menu.contains(document.activeElement);
      open(false, false);
      if (hadFocus) {
        var home = document.querySelector('#site-nav .brand');
        if (home) home.focus({ preventScroll: true });
      }
    }
  });
  menu.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') e.stopPropagation();
    if (e.key !== 'Tab') return;
    var items = Array.prototype.slice.call(menu.querySelectorAll('a[href], button'))
      .filter(function (el) { return el.getClientRects().length; });
    var first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  if (prod && sub) prod.addEventListener('click', function () {
    var on = sub.hidden; sub.hidden = !on; prod.setAttribute('aria-expanded', on ? 'true' : 'false');
  });
})();
