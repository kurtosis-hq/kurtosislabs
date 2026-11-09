// Observe native scrolling without intercepting wheel, touch or keyboard input.
// Read all positions before updating any UI; at most one update per frame.
(function () {
  var observers = [], pending = false;
  function update() {
    pending = false;
    var height = window.innerHeight;
    var measurements = observers.map(function (entry) {
      var rect = entry.element.getBoundingClientRect();
      return { entry: entry, visible: rect.bottom > 0 && rect.top < height,
        progress: Math.max(0, Math.min(1, (height * 0.85 - rect.top) / (height * 0.7))) };
    });
    measurements.forEach(function (item) { item.entry.change(item.progress, item.visible); });
  }
  function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(update);
  }
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener('load', schedule);
  window.KLScroll = {
    observe: function (element, change) {
      observers.push({ element: element, change: change });
      schedule();
    },
    steps: function (element, count, change) {
      var manual = false;
      var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.observe(element, function (progress, visible) {
        if (!visible) manual = false;
        if (visible && !manual && !reduce.matches) change(Math.min(count - 1, Math.floor(progress * count)));
      });
      return { select: function (index) { manual = true; change(index); } };
    },
    button: function (element, action) {
      element.setAttribute('role', 'button');
      element.tabIndex = 0;
      element.addEventListener('click', action);
      element.addEventListener('keydown', function (event) {
        if (event.target !== element || (event.key !== 'Enter' && event.key !== ' ')) return;
        event.preventDefault(); action();
      });
    }
  };
})();
