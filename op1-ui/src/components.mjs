import { tokens } from './tokens.mjs';
import { measureText, normalizeText, textLines } from './font.mjs';
export { tokens, measureText };

const color = name => {
  const value = tokens.color[name];
  if (!value) throw new RangeError(`Unknown colour role: ${name}`);
  return value;
};
const finite = (...values) => {
  if (values.some(v => !Number.isFinite(v))) throw new RangeError('Geometry must be finite');
};
export function scene() { return { width: 320, height: 160, nodes: [], texts: [], readouts: [] }; }

export function line(s, id, points, tone = 'white', width = 1) {
  if (!id || s.nodes.some(n => n.id === id)) throw new Error(`Missing or duplicate node ID: ${id}`);
  finite(width, ...points.flat());
  if (points.length < 2 || points.some(p => p.length !== 2) || width <= 0) throw new RangeError('A line needs at least two points and a positive width');
  s.nodes.push({ id, points, color: color(tone), width });
}

// Explicit cubic paths preserve smooth authored curves without browser-only features.
export function vectorPath(s, id, commands, tone = 'white', width = 1.5, fillTone = null) {
  if (!id || s.nodes.some(n => n.id === id)) throw new Error(`Missing or duplicate node ID: ${id}`);
  if (!commands.length || commands[0][0] !== 'M' || commands.filter(c => c[0] === 'M').length !== 1) throw new RangeError('Use one explicit M subpath');
  const points = [];
  for (const [op, ...values] of commands) {
    if (!Object.hasOwn({M:2,L:2,C:6,Z:0}, op) || values.length !== {M:2,L:2,C:6,Z:0}[op]) throw new RangeError('Explicit M/L/C/Z geometry required');
    finite(...values);
    for (let i=0;i<values.length;i+=2) points.push(values.slice(i,i+2));
  }
  finite(width); if (width<=0) throw new RangeError('Positive stroke width required');
  s.nodes.push({id, commands, points, color:color(tone), width, fill:fillTone ? color(fillTone) : 'none'});
}

// x/y locate the top-left of the glyph centreline, not the SVG baseline.
// Width is measured first. Overflow never silently selects a smaller profile.
export function text(s, { id, value, x, y, size = 'browserRow', tone = 'white', align = 'left', maxWidth = Infinity }) {
  size = tokens.typeAliases[size] || size;
  const type = tokens.type[size];
  if (!type) throw new RangeError(`Unknown stock-reference text profile: ${size}`);
  if (!['left', 'center', 'right'].includes(align)) throw new RangeError('Invalid text alignment');
  finite(x, y);
  const label = normalizeText(value), width = measureText(label, type.nominalHeight);
  if (width > maxWidth) throw new RangeError(`${id}: '${label}' needs ${width.toFixed(1)}px; shorten, format or paginate within ${maxWidth}px`);
  if (align === 'center') x -= width / 2;
  if (align === 'right') x -= width;
  const paths = textLines(label, x, y, type.nominalHeight);
  s.texts.push({ id, value: label, x, y, size, tone, maxWidth, align, width });
  paths.forEach((points, i) => { line(s, `${id}-${i}`, points, tone, type.strokeWidth); s.nodes.at(-1).textId = id; });
  return { x, y, width, height: type.nominalHeight };
}

export function parameter(s, { id, label, value, unit = '', lane, x, y, size = 'parameterValue', width = 70, align = 'left' }) {
  size = tokens.typeAliases[size] || size;
  const tone = tokens.encoderOrder[lane];
  if (!tone) throw new RangeError('Encoder lane must be 0..3');
  text(s, { id: `${id}-label`, value: label, x, y, tone, maxWidth: width, align });
  const valueWidth = measureText(value, tokens.type[size].nominalHeight);
  const totalWidth = valueWidth + (unit ? 4 + measureText(unit, tokens.type.browserRow.nominalHeight) : 0);
  if (totalWidth > width) throw new RangeError(`${id}: value and unit do not fit; use a compact unit/value or another layout`);
  const left = align === 'right' ? x - totalWidth : align === 'center' ? x - totalWidth / 2 : x;
  const valueY = y + tokens.type.browserRow.nominalHeight + 6;
  const box = text(s, { id: `${id}-value`, value, x: unit ? left : x, y: valueY, size, tone, maxWidth: width, align: unit ? 'left' : align });
  if (unit) {
    const unitWidth = measureText(unit, tokens.type.browserRow.nominalHeight);
    if (box.width + 4 + unitWidth > width) throw new RangeError(`${id}: value and unit do not fit; use a compact unit/value or another layout`);
    text(s, { id: `${id}-unit`, value: unit, x: left + box.width + 4, y: valueY + box.height - tokens.type.browserRow.nominalHeight, tone });
    s.readouts.push({ valueId: `${id}-value`, unitId: `${id}-unit`, x, align, maxWidth: width, gap: 4 });
  }
}

export function header(s, { title, context = '', right = '' }) {
  const rightWidth = measureText(right, tokens.type.browserRow.nominalHeight);
  text(s, { id: 'title', value: title, x: 9, y: 9, maxWidth: right ? 286 - rightWidth : 302 });
  if (right) text(s, { id: 'header-right', value: right, x: 311, y: 9, align: 'right', maxWidth: 150 });
  if (context) text(s, { id: 'context', value: context, x: 9, y: 25, tone: 'secondary', maxWidth: 302 });
}

export function softKeys(s, labels) {
  if (labels.length !== 4) throw new RangeError('Supply four T-key labels; use empty strings for unused keys');
  labels.forEach((value, i) => text(s, { id: `t${i + 1}`, value, x: 40 + i * 80, y: 125, align: 'center', maxWidth: 68 }));
}

export function envelope(s, { x = 90, y = 48, width = 212, height = 28, attack = 0.25, decay = 0.55 } = {}) {
  finite(x, y, width, height, attack, decay);
  if (width <= 0 || height <= 0 || attack < 0 || attack > 1 || decay < 0 || decay > 1) throw new RangeError('Envelope geometry/range');
  const peak = x + width * (0.08 + attack * 0.35);
  line(s, 'env-attack', [[x, y + height], [peak - 6, y + height * 0.35], [peak, y]], 'green', 1.5);
  line(s, 'env-decay', [[peak, y], [peak + (width - (peak - x)) * (0.2 + decay * 0.5), y + height * 0.85], [x + width, y + height]], 'white', 1.5);
}

export function status(s, { message, detail = '', error = false }) {
  text(s, { id: 'status', value: message, x: 160, y: 56, size: 'parameterValue', tone: error ? 'orange' : 'white', align: 'center', maxWidth: 284 });
  if (detail) text(s, { id: 'status-detail', value: detail, x: 160, y: 88, align: 'center', maxWidth: 284 });
}

export function selectionList(s, { items, selected = 0 }) {
  if (!items.length) { status(s, { message: 'NO ITEMS', detail: 'NOTHING AVAILABLE' }); return; }
  if (!Number.isInteger(selected) || selected < 0 || selected >= items.length) throw new RangeError('Selection outside list');
  const first = Math.min(Math.max(0, selected - 1), Math.max(0, items.length - 3));
  items.slice(first, first + 3).forEach((value, i) => {
    const active = first + i === selected;
    text(s, { id: `row-${i}`, value, x: 28, y: 45 + i * 25, size: 'browserRow', tone: active ? 'blue' : 'secondary', maxWidth: 280 });
    if (active) line(s, 'selection', [[11, 48 + i * 25], [17, 53 + i * 25], [11, 58 + i * 25]], 'blue', 1.5);
  });
}

export function validateScene(s) {
  const { left, top, right, bottom } = tokens.safeArea;
  const issues = [];
  for (const n of s.nodes) for (const [x, y] of n.points) {
    const half = n.width / 2;
    if (x - half < left || y - half < top || x + half > s.width - right || y + half > s.height - bottom) {
      issues.push(`${n.id}: stroke outside proposed safe area`); break;
    }
  }
  return issues;
}

const number = n => String(Number(n.toFixed(4)));
const escape = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]);
export function renderSvg(s, { title = 'OP-1 UI reference', guides = false } = {}) {
  const paths = s.nodes.map(n => `<path id="${escape(n.id)}" d="${n.commands ? n.commands.map(([op,...v]) => op + (v.length ? ' ' + v.map(number).join(' ') : '')).join(' ') : n.points.map(([x, y], i) => `${i ? 'L' : 'M'} ${number(x)},${number(y)}`).join(' ')}" fill="${n.fill || 'none'}" stroke="${n.color}" stroke-width="${number(n.width)}"/>`).join('\n');
  // Background is the only intentional full-canvas primitive. Guides are preview-only.
  return `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="160" viewBox="0 0 320 160"><title>${escape(title)}</title><rect x="0" y="0" width="320" height="160" fill="${tokens.color.background}"/>\n${paths}${guides ? '<rect x="8" y="8" width="304" height="136" fill="none" stroke="#625d77" stroke-width="0.5"/>' : ''}</svg>`;
}
