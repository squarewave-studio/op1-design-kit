import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const initialiser = readFileSync(new URL('../theme-init.js', import.meta.url), 'utf8');
const header = readFileSync(new URL('../header.js', import.meta.url), 'utf8');

function fixture({ theme, cache, blockedStorage = false, response = { stargazers_count: 9 }, ok = true } = {}) {
  const saved = new Map([['op1-kit-theme', theme], ['op1-kit-github-stars', cache]]);
  const storage = {
    getItem(key) { if (blockedStorage) throw Error('Storage blocked'); return saved.get(key) ?? null; },
    setItem(key, value) { if (blockedStorage) throw Error('Storage blocked'); saved.set(key, value); }
  };
  const attributes = {};
  const count = { textContent: 'Star' };
  let click;
  const toggle = { hidden: true, setAttribute: (key, value) => { attributes[key] = value; }, addEventListener: (_, listener) => { click = listener; } };
  const link = { querySelector: () => count, setAttribute: (key, value) => { attributes[`stars-${key}`] = value; } };
  const calls = [];
  const context = vm.createContext({
    document: { documentElement: { dataset: {} }, querySelector: selector => selector === '[data-theme-toggle]' ? toggle : link },
    localStorage: storage, sessionStorage: storage, AbortController, setTimeout, clearTimeout,
    fetch: async (url, options) => { calls.push({ url, options }); return { ok, json: async () => response }; }
  });
  vm.runInContext(initialiser, context);
  vm.runInContext(header, context);
  return { context, saved, attributes, count, toggle, calls, click: () => click() };
}
const settle = () => new Promise(resolve => setImmediate(resolve));

test('dark is the default and choosing light persists before the next page paints', async () => {
  const page = fixture();
  assert.equal(page.context.document.documentElement.dataset.theme, 'dark');
  assert.equal(page.toggle.hidden, false);
  page.click();
  assert.equal(page.saved.get('op1-kit-theme'), 'light');
  assert.equal(page.attributes['aria-label'], 'Switch To Dark Mode');
  assert.equal(fixture({ theme: page.saved.get('op1-kit-theme') }).context.document.documentElement.dataset.theme, 'light');
  page.click();
  assert.equal(page.saved.get('op1-kit-theme'), 'dark');
  await settle();
});

test('the switch and counter still work when storage is blocked', async () => {
  const page = fixture({ blockedStorage: true });
  page.click();
  assert.equal(page.context.document.documentElement.dataset.theme, 'light');
  await settle();
  assert.equal(page.count.textContent, '9');
});

test('GitHub counts are fetched without credentials and cached between pages', async () => {
  const page = fixture({ response: { stargazers_count: 1234 } });
  await settle();
  assert.equal(page.count.textContent, '1,234');
  assert.equal(page.calls[0].options.credentials, 'omit');
  assert.equal(page.calls[0].options.referrerPolicy, 'no-referrer');
  const next = fixture({ cache: page.saved.get('op1-kit-github-stars') });
  assert.equal(next.count.textContent, '1,234');
  assert.equal(next.calls.length, 0);
});

test('an unavailable API keeps the Star link, rather than showing a false zero', async () => {
  const page = fixture({ ok: false });
  await settle();
  assert.equal(page.count.textContent, 'Star');
  assert.equal(page.saved.has('op1-kit-github-stars') && Boolean(page.saved.get('op1-kit-github-stars')), false);
});

test('stale counts refresh and malformed counts never enter the header', async () => {
  const page = fixture({ cache: JSON.stringify({ count: 8, time: 0 }), response: { stargazers_count: '<script>' } });
  await settle();
  assert.equal(page.calls.length, 1);
  assert.equal(page.count.textContent, '8');
  const zero = fixture({ response: { stargazers_count: 0 } });
  await settle();
  assert.equal(zero.count.textContent, '0');
});
