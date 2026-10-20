import { checkLayout } from './layout.mjs';
// Local-only host adapter. Reads a caller-supplied asset; contains no TE glyph data.
// Browser geometry is retained intact: curves are not flattened into coarse pixels.
import { tokens } from './tokens.mjs';
const NS = 'http://www.w3.org/2000/svg';
const SHAPES = new Set(['path', 'line', 'polyline', 'polygon', 'rect', 'circle', 'ellipse']);
const ATTRS = new Set(['d', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'width', 'height', 'cx', 'cy', 'r', 'rx', 'ry', 'points']);
export const decodeGlyphId = id => id.replace(/_x([0-9a-f]{2})_/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
export const textGlyphId = char => /[A-Z]/.test(char) ? char.toLowerCase() : char;
export const stockGlyphOffset = (glyph,height,scale) => Number.isFinite(glyph.cellTop)
  ? (glyph.box.y-glyph.cellTop)*scale
  : height-Math.min(height,glyph.box.height*scale);

export async function loadStockFont(source) {
  if (/<!ENTITY/i.test(source)) throw new Error('Font entity declarations are unsupported');
  const cleanSource = source.replace(/<!DOCTYPE[^>\[\]]*>/gi, '');
  if (/<!DOCTYPE/i.test(cleanSource)) throw new Error('Font DTD internal subsets are unsupported');
  const parsed = new DOMParser().parseFromString(cleanSource, 'image/svg+xml');
  if (parsed.querySelector('parsererror') || parsed.documentElement.localName !== 'svg') throw new Error('Invalid SVG font');
  if (parsed.querySelector('[transform]')) throw new Error('Unexpected font transforms; use a qualified adapter for this font revision');
  const probe = document.createElementNS(NS, 'svg');
  probe.style.cssText = 'position:absolute;left:-10000px;top:0;width:4000px;height:4000px;visibility:hidden';
  document.body.append(probe);
  const glyphs = new Map();
  try {
    for (const original of parsed.documentElement.children) {
      const id = original.getAttribute('id');
      if (!id) continue;
      const char = decodeGlyphId(id);
      if (char.length !== 1 || /[A-Z]/.test(char)) continue; // Uppercase IDs are UI icons, not text letters.
      if (glyphs.has(char)) throw new Error(`Duplicate glyph: ${char}`);
      const group = document.createElementNS(NS, 'g');
      const visit = (element, inheritedStroke = '#000000') => {
        const stroke = element.getAttribute('stroke') || inheritedStroke;
        if (element.localName === 'g') { for (const child of element.children) visit(child, stroke); return; }
        if (!SHAPES.has(element.localName) || !['#000000', '#000', 'black'].includes(stroke.toLowerCase())) return;
        const shape = document.createElementNS(NS, element.localName);
        for (const { name, value } of element.attributes) if (ATTRS.has(name)) shape.setAttribute(name, value);
        for (const [name,allowed] of [['stroke-linecap',['butt','round','square']],['stroke-linejoin',['miter','round','bevel']]]) {
          const value=element.getAttribute(name); if(allowed.includes(value))shape.setAttribute(name,value);
        }
        shape.setAttribute('fill', 'none');
        shape.setAttribute('stroke', 'currentColor');
        group.append(shape);
      };
      visit(original);
      if (!group.childElementCount) continue;
      probe.append(group);
      const b = group.getBBox();
      if (![b.x, b.y, b.width, b.height].every(Number.isFinite) || !b.width && !b.height) continue;
      const cell=[...original.querySelectorAll('rect')].find(e=>['#ffff00','yellow'].includes((e.getAttribute('stroke')||'').toLowerCase()));
      const cellTop=cell?Number(cell.getAttribute('y')||0):null;
      if(cellTop!==null&&!Number.isFinite(cellTop))throw new Error(`Invalid cell guide for '${char}'`);
      glyphs.set(char, { markup: group.innerHTML, cellTop, box: { x: b.x, y: b.y, width: b.width, height: b.height } });
    }
  } finally { probe.remove(); }
  const letters = [...'abcdefghijklmnopqrstuvwxyz'];
  const missing = letters.filter(c => !glyphs.has(c));
  if (missing.length) throw new Error(`Font lacks text IDs: ${missing.join(' ')}`);
  // A shared cell height, not per-character stretching: a dot remains a dot.
  const capHeight = Math.max(...letters.map(c => glyphs.get(c).box.height));
  const sha256 = [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(source)))].map(x => x.toString(16).padStart(2, '0')).join('');
  return { glyphs, capHeight, sha256, ids: [...glyphs.keys()].sort() };
}

export function stockTextLayout(font, value, height) {
  const characters = [...String(value).toUpperCase()];
  const scale = height / font.capHeight;
  let cursor = 0;
  const placements = characters.map(c => {
    if (c === ' ') { cursor += height * 0.48; return null; }
    const glyph = font.glyphs.get(textGlyphId(c));
    if (!glyph) throw new Error(`Stock font missing '${c}' (ID '${textGlyphId(c)}'); choose another label, never silently substitute`);
    const result = { glyph, x: cursor };
    cursor += Math.max(glyph.box.width * scale, height * 0.22) + height * 0.17;
    return result;
  }).filter(Boolean);
  const width=Math.max(0,...placements.map(({glyph,x})=>x+glyph.box.width*scale));
  return { placements, scale, width, advance: characters.length ? cursor-height*.17 : 0 };
}

// Replace only text in an existing host SVG; keep reference artwork and coordinates.
// This returns DOM for private inspection, not a distributable asset/export string.
export function applyStockFont(svg, scene, font) {
  const issues = [];
  const layouts = new Map(scene.texts.map(t => [t.id, stockTextLayout(font, t.value, tokens.type[t.size].nominalHeight)]));
  const origins = new Map(scene.texts.map(t => {
    const width = layouts.get(t.id).width;
    return [t.id, t.align === 'right' ? t.x + t.width - width : t.align === 'center' ? t.x + (t.width - width) / 2 : t.x];
  }));
  for (const group of scene.readouts || []) {
    const valueWidth = layouts.get(group.valueId).width, unitWidth = layouts.get(group.unitId).width;
    const width = valueWidth + group.gap + unitWidth;
    const left = group.align === 'right' ? group.x - width : group.align === 'center' ? group.x - width / 2 : group.x;
    origins.set(group.valueId, left); origins.set(group.unitId, left + valueWidth + group.gap);
    if (width > group.maxWidth) issues.push(`${group.valueId}: stock value and unit need ${width.toFixed(1)}px; reformat or relayout`);
  }
  for (const t of scene.texts) {
    const { nominalHeight: height, strokeWidth } = tokens.type[t.size];
    const layout = layouts.get(t.id);
    if (layout.width > t.maxWidth) issues.push(`${t.id}: stock lettering needs ${layout.width.toFixed(1)}px; shorten or repaginate`);
    const textIds = new Set(scene.nodes.filter(n => n.textId === t.id).map(n => n.id));
    const originalNodes = [...svg.querySelectorAll('[id]')].filter(n => textIds.has(n.id));
    const anchor = originalNodes[0];
    const group = document.createElementNS(NS, 'g');
    group.setAttribute('data-private-stock-font', 'true');
    group.setAttribute('color', tokens.color[t.tone]);
    // Preserve the original visual anchor (right/center are restored by the caller's recorded text).
    const origin = origins.get(t.id);
    for (const { glyph, x } of layout.placements) {
      const g = document.createElementNS(NS, 'g');
      // Source glyphs have local cell coordinates; normalize x bearing and align to the common cap cell.
      const baselineOffset = stockGlyphOffset(glyph,height,layout.scale);
      g.setAttribute('transform', `translate(${origin + x},${t.y + baselineOffset}) scale(${layout.scale}) translate(${-glyph.box.x},${-glyph.box.y})`);
      g.setAttribute('stroke-width', String(strokeWidth / layout.scale));
      g.innerHTML = glyph.markup;
      group.append(g);
    }
    if (anchor) anchor.before(group); else svg.append(group);
    originalNodes.forEach(n => n.remove());
    if (origin - strokeWidth / 2 < 8 || origin + layout.width + strokeWidth / 2 > 312) issues.push(`${t.id}: stock lettering crosses the horizontal safe area`);
  }
  const measured = { ...scene, texts: scene.texts.map(t => ({ ...t, x: origins.get(t.id), width: layouts.get(t.id).width })) };
  issues.push(...checkLayout(measured));
  return issues;
}
