import test from 'node:test';
import assert from 'node:assert/strict';
import {interactionExamples,editPlayback,shiftPresentation,routeActivity} from '../src/interaction-examples.mjs';
import {validateScene,tokens} from '../src/components.mjs';
import {checkLayout} from '../src/layout.mjs';
import {stockGlyphOffset} from '../src/stock-font.mjs';

test('punctuation retains its cell bearing so a minus does not become an underscore',()=>{
  // Invented fixture geometry; no stock font data.
  assert.equal(stockGlyphOffset({cellTop:100,box:{y:120,height:1}},20,.5),10);
  assert.equal(stockGlyphOffset({cellTop:100,box:{y:139,height:1}},20,.5),19.5);
  assert.equal(stockGlyphOffset({cellTop:null,box:{y:0,height:40}},20,.5),0);
});

test('interaction states preserve readable bounds and clear text',()=>{
  for(const p of interactionExamples){const s=p.build();assert.deepEqual(validateScene(s),[],p.id);assert.deepEqual(checkLayout(s),[],p.id);for(const n of s.nodes)assert(n.points.every(([,y])=>y+n.width/2<=tokens.safeArea.criticalContentBottom),p.id+'/'+n.id);}
});
test('playback and activity change without moving editing or configuration',()=>{
  const a=editPlayback(6),b=editPlayback(3);
  assert.deepEqual(a.nodes.find(n=>n.id==='edit-outline'),b.nodes.find(n=>n.id==='edit-outline'));
  assert.notDeepEqual(a.nodes.find(n=>n.id==='play-marker'),b.nodes.find(n=>n.id==='play-marker'));
  const idle=routeActivity(),active=routeActivity(true);
  assert.deepEqual(idle.nodes,active.nodes.filter(n=>n.id!=='activity'));
  assert.deepEqual(idle.texts,active.texts);
});
test('held Shift changes its readout while waveform and boundaries stay fixed',()=>{
  const normal=shiftPresentation(),held=shiftPresentation(true);
  const fixed=s=>s.nodes.filter(n=>['slice-wave','start-bound','end-bound'].includes(n.id));
  assert.deepEqual(fixed(normal),fixed(held));
  assert.equal(held.texts.find(t=>t.id==='alternate-unit').value,'DB');
  assert.deepEqual(shiftPresentation(false),normal);
});
