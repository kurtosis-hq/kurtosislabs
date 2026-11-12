// Sign-up form: there is no mailing list connected yet, so the form says so instead of pretending to send.
(function () {
  var form = document.getElementById('signup');
  var note = document.getElementById('signup-note');
  if (!form || !note) return;
  // Sign up opens the contact page (the same link as the Request a demo buttons)
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var demo = document.querySelector('a.btn[href*="ontact"]');
    if (demo) location.href = demo.href;
    else note.textContent = 'Sign-up is not connected to a mailing list yet.';
  });
})();

// Navigation: transparent at the very top, a floating black bar once the page has scrolled.
// While the Products box reaches up under the bar, the bar slides away so it never covers the
// box; it comes back once the box has scrolled fully off the top (or back below the bar).
(function () {
  var nav = document.getElementById('site-nav');
  if (!nav) return;
  var box = document.querySelector('.bento');
  function update() {
    nav.classList.toggle('is-pill', (window.scrollY || window.pageYOffset) > 8);
    if (!box) return;
    var r = box.getBoundingClientRect(), navBottom = nav.offsetTop + nav.offsetHeight;   // resting position, unaffected by the slide
    nav.classList.toggle('is-away', r.top < navBottom + 24 && r.bottom > 0);
  }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();

// Products menu in the nav: click Products to open it, click it again, click elsewhere or press Escape to close
(function () {
  var btn = document.getElementById('nav-products'), menu = document.getElementById('nav-menu-products');
  if (!btn || !menu) return;
  function set(open) { menu.hidden = !open; btn.setAttribute('aria-expanded', open ? 'true' : 'false'); }
  btn.addEventListener('click', function (e) { e.preventDefault(); set(menu.hidden); });
  menu.addEventListener('click', function (e) { if (e.target.closest('.nm-item')) set(false); });
  document.addEventListener('click', function (e) { if (!menu.hidden && !e.target.closest('.nav-item')) set(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { set(false); btn.focus(); } });
})();

// Nav links to sections on this page (e.g. Customers → Who We Serve): glide there instead of jumping.
// Also handles arriving from another page with #customers in the address, once the page has laid out.
(function () {
  function go(id, smooth) {
    var el = id && document.getElementById(id);
    if (!el) return false;
    var y = el.getBoundingClientRect().top + (window.scrollY || window.pageYOffset);
    window.scrollTo({ top: y, behavior: smooth ? 'smooth' : 'instant' });
    return true;
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href').slice(1);
    if (id && document.getElementById(id) && go(id, true)) { e.preventDefault(); history.replaceState(null, '', '#' + id); }
  });
  if (location.hash.length > 1) window.addEventListener('load', function () { setTimeout(function () { go(location.hash.slice(1), false); }, 50); });
})();
