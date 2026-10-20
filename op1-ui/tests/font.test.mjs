import test from 'node:test';
import assert from 'node:assert/strict';
import { decodeGlyphId, textGlyphId, stockTextLayout } from '../src/stock-font.mjs';

test('stock text IDs preserve the distinct icon namespace', () => {
  assert.equal(textGlyphId('A'), 'a');
  assert.equal(decodeGlyphId('D'), 'D');
  assert.equal(decodeGlyphId('_x23_'), '#');
  assert.equal(decodeGlyphId('_x30_'), '0');
  assert.equal(decodeGlyphId('_x34_by4'), '4by4');
});
test('stock spacing uses independent ink width, explicit spaces and no missing-glyph substitution', () => {
  // Invented metadata, not extracted font geometry.
  const glyphs = new Map([['a', { box: { width: 5, height: 10 } }], ['i', { box: { width: 1, height: 10 } }]]);
  const font = { glyphs, capHeight: 10 };
  assert(stockTextLayout(font, 'A', 18).width > stockTextLayout(font, 'I', 18).width);
  assert(stockTextLayout(font, 'A A', 18).width > stockTextLayout(font, 'AA', 18).width);
  assert.throws(() => stockTextLayout(font, 'AB', 18), /missing 'B'/);
});

test('a narrow final glyph aligns by visible ink rather than spacing allowance',()=>{
  const font={capHeight:10,glyphs:new Map([['1',{box:{width:0,height:10}}],['0',{box:{width:6,height:10}}]])};
  const single=stockTextLayout(font,'1',20);
  assert.equal(single.width,0);assert(single.advance>single.width);
  const pair=stockTextLayout(font,'01',20);
  assert.equal(pair.width,pair.placements[1].x);
  assert(pair.advance>pair.width);
});
