// Responsive navigation: one set of links, with focus kept out of collapsed content.
(function () {
  var nav = document.getElementById('site-nav');
  var toggle = nav.querySelector('.menu-toggle');
  var links = document.getElementById('main-links');
  var narrow = window.matchMedia('(width < 64rem)');
  function setMenu(open, restore) {
    nav.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) links.querySelector('a').focus({ preventScroll: true });
    else {
      document.getElementById('nav-menu-products').hidden = true;
      document.getElementById('nav-products').setAttribute('aria-expanded', 'false');
    }
    if (!open && restore) toggle.focus({ preventScroll: true });
  }
  toggle.addEventListener('click', function () { setMenu(toggle.getAttribute('aria-expanded') !== 'true'); });
  links.addEventListener('click', function (event) {
    var link = event.target.closest('a');
    if (link && link.id !== 'nav-products') setMenu(false, narrow.matches);
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && nav.classList.contains('menu-open')) setMenu(false, true);
  });
  document.addEventListener('click', function (event) {
    if (!nav.contains(event.target)) setMenu(false);
  });
  nav.addEventListener('focusout', function () {
    requestAnimationFrame(function () { if (!nav.contains(document.activeElement)) setMenu(false); });
  });
  narrow.addEventListener('change', function () {
    var hadFocus = links.contains(document.activeElement);
    setMenu(false, narrow.matches && hadFocus);
    if (!narrow.matches && document.activeElement === toggle) nav.querySelector('.brand').focus({ preventScroll: true });
  });
})();
