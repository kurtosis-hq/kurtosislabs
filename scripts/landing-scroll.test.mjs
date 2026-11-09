import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../kurtosis-website/js/scroll-progress.js', import.meta.url), 'utf8');
function fixture(reduced = false) {
  const events = {}, frames = [];
  const window = { innerHeight: 1000, matchMedia: () => ({ matches: reduced }),
    addEventListener: (type, handler, options) => { events[type] = { handler, options }; } };
  vm.runInNewContext(source, { window, requestAnimationFrame: callback => frames.push(callback) });
  return { api: window.KLScroll, events, frames,
    flush() { frames.splice(0).forEach(callback => callback()); } };
}

test('scroll notifications coalesce and never intercept wheel, touch or keyboard input', () => {
  const f = fixture(); let updates = 0;
  f.api.observe({ getBoundingClientRect: () => ({ top: 500, bottom: 800 }) }, () => updates++);
  for (let i = 0; i < 20; i++) f.events.scroll.handler();
  assert.equal(f.frames.length, 1);
  f.flush(); assert.equal(updates, 1);
  assert.equal(f.events.scroll.options.passive, true);
  for (const type of ['wheel', 'touchmove', 'keydown']) assert.equal(f.events[type], undefined);
});

test('all positions are read before any animation updates', () => {
  const f = fixture(), order = [];
  for (let i = 0; i < 2; i++) f.api.observe({ getBoundingClientRect() {
    order.push(`read${i}`); return { top: 500, bottom: 800 };
  } }, () => order.push(`write${i}`));
  f.flush(); assert.deepEqual(order, ['read0', 'read1', 'write0', 'write1']);
});

test('manual selection survives scrolling until the section leaves the viewport', () => {
  const f = fixture(); let top = 700, selected;
  const controls = f.api.steps({ getBoundingClientRect: () => ({ top, bottom: top + 200 }) }, 3, i => { selected = i; });
  f.flush(); assert.equal(selected, 0);
  controls.select(2); top = 650; f.events.scroll.handler(); f.flush();
  assert.equal(selected, 2);
  top = 1100; f.events.scroll.handler(); f.flush();
  top = 700; f.events.scroll.handler(); f.flush(); assert.equal(selected, 0);
  top = 100; f.events.scroll.handler(); f.flush(); assert.equal(selected, 2);
});

test('reduced motion leaves selection to the reader', () => {
  const f = fixture(true); let selected = 0;
  const controls = f.api.steps({ getBoundingClientRect: () => ({ top: 100, bottom: 300 }) }, 3, i => { selected = i; });
  f.flush(); assert.equal(selected, 0);
  controls.select(1); assert.equal(selected, 1);
});
