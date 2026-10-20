import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {previewTextLayout} from '../../skills/op1-design/assets/fonts/preview-font.mjs';
import {tokens} from '../src/tokens.mjs';
const base=new URL('../../skills/op1-design/assets/fonts/',import.meta.url);
const font={profile:JSON.parse(readFileSync(new URL('profile.json',base))),metrics:JSON.parse(readFileSync(new URL('metrics.json',base)))};
test('browser preview uses visible ink for final I and 1',()=>{
  for(const char of ['I','1']){
    const result=previewTextLayout(font,char,tokens.type.browserRow),glyph=font.metrics.glyphs[char];
    assert.equal(result.width,(glyph.bounds[2]-glyph.bounds[0])*result.scale);
    assert.ok(result.width<glyph.advance*result.scale);
  }
});
test('browser preview covers the exposed set and rejects unsupported text',()=>{
  const result=previewTextLayout(font,font.profile.textCharacters,tokens.type.browserRow);
  assert.ok(result.width>0);
  assert.throws(()=>previewTextLayout(font,'é',tokens.type.browserRow),/Unsupported kit preview character/);
  const slash=previewTextLayout(font,'/',tokens.type.browserRow);
  assert.ok(slash.top>(tokens.type.browserRow.nominalHeight+tokens.type.browserRow.strokeWidth));
});
import {checkLayout} from '../src/layout.mjs';
test('collision checker uses descender ink beyond the cap cell',()=>{
  const m=previewTextLayout(font,';',tokens.type.browserRow),baseline=40+tokens.type.browserRow.nominalHeight+tokens.type.browserRow.strokeWidth/2;
  const s={texts:[{id:'punctuation',value:';',size:'browserRow',x:80,y:40,width:m.width,inkBounds:{x:80,y:baseline-m.top,width:m.width,height:m.top-m.bottom}}],nodes:[{id:'line',points:[[78,58],[90,58]],width:1}]};
  assert.ok(checkLayout(s).some(x=>x.includes('too close to artwork line')));
  s.texts[0].inkBounds.height=NaN;
  assert.ok(checkLayout(s).some(x=>x.includes('invalid measured ink bounds')));
});
