// Numbered points follow natural scroll progress and remain selectable by button.
(function () {
  var sec = document.querySelector('.sec-rate');
  if (!sec) return;
  var steps = Array.prototype.slice.call(sec.querySelectorAll('.rate-step'));
  var fill = sec.querySelector('.rate-bar-fill');
  var N = steps.length;
  var idx = 0;

  var controls = Array.prototype.slice.call(sec.querySelectorAll('.rate-controls button'));
  function layout() {
    steps.forEach(function (s, i) {
      s.classList.toggle('is-on', i === idx);
      s.setAttribute('aria-hidden', i === idx ? 'false' : 'true');
    });
    controls.forEach(function (button, i) { button.setAttribute('aria-pressed', String(i === idx)); });
    if (fill) fill.style.transform = 'scaleY(' + ((idx + 1) / N) + ')';
  }
  function go(i) { if (i === idx || i < 0 || i >= N) return false; idx = i; layout(); return true; }
  layout();

  var follow = window.KLScroll.steps(sec.querySelector('.rate-bar') || sec, N, go);
  controls.forEach(function (button, i) { button.addEventListener('click', function () { follow.select(i); }); });
  window.setRateStep = function (i) { follow.select(i); };
})();
