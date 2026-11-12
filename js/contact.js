// Contact page: checks the form, then shows a thank-you card. There is no inbox connected yet,
// so nothing is sent and the card says so. Links back to the landing page go to the right layout
// for the screen (and, inside the preview, back to the preview's own frame).
(function () {
  var home = document.documentElement.getAttribute('data-home') || 'index.html';
  Array.prototype.slice.call(document.querySelectorAll('a.js-home')).forEach(function (a) {
    var hash = (a.getAttribute('href') || '').split('#')[1];
    a.setAttribute('href', home + (hash ? '#' + hash : ''));
    a.addEventListener('click', function (e) {
      // inside the site preview: ask the preview to show the landing page again
      if (window.parent !== window) {
        try { window.parent.postMessage({ kl: 'home', hash: hash ? '#' + hash : '' }, '*'); e.preventDefault(); } catch (err) {}
      }
    });
  });
  var top = document.getElementById('cf-top');
  if (top) top.addEventListener('click', function (e) { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); });

  var form = document.getElementById('c-form'), done = document.getElementById('c-done'), err = document.getElementById('c-error');
  if (!form) return;
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  form.addEventListener('input', function (e) { if (e.target.classList) e.target.classList.remove('is-bad'); });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = form.elements.name, email = form.elements.email, org = form.elements.organisation, consent = form.elements.consent;
    var problems = [], first = null;
    function bad(el, msg) { el.classList.add('is-bad'); problems.push(msg); if (!first) first = el; }
    if (!name.value.trim()) bad(name, 'your name');
    if (!EMAIL.test(email.value.trim())) bad(email, 'a work email we can reply to');
    if (!org.value.trim()) bad(org, 'your organisation');
    if (!consent.checked) { problems.push('your agreement that we can contact you'); if (!first) first = consent; }
    if (problems.length) {
      err.textContent = 'Please add ' + problems.join(', ') + '.';
      err.hidden = false; first.focus();
      return;
    }
    err.hidden = true;
    document.getElementById('c-done-name').textContent = ', ' + name.value.trim().split(/\s+/)[0];
    document.getElementById('c-done-email').textContent = email.value.trim();
    form.hidden = true; done.hidden = false; done.focus();
  });
})();
