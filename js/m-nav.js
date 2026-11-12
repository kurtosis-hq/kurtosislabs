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
  function open(on) {
    menu.hidden = !on; burger.setAttribute('aria-expanded', on ? 'true' : 'false');
    document.documentElement.style.overflow = on ? 'hidden' : '';
    if (on) close.focus(); else burger.focus();
  }
  burger.addEventListener('click', function () { open(true); });
  close.addEventListener('click', function () { open(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) open(false); });
  menu.addEventListener('click', function (e) { var a = e.target.closest('a'); if (a) open(false); });
  if (prod && sub) prod.addEventListener('click', function () {
    var on = sub.hidden; sub.hidden = !on; prod.setAttribute('aria-expanded', on ? 'true' : 'false');
  });
})();
