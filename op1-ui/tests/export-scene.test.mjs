import test from 'node:test';
import assert from 'node:assert/strict';
import {serializeScene} from '../src/export-scene.mjs';
import {interactionExamples} from '../src/interaction-examples.mjs';
import {checkScene} from '../tools/check_scene.mjs';

test('scene export absorbs observed cross-platform trig rounding without losing layout precision',()=>{
  const linux={points:[[48.4,32.68315528912946],[103.7,94.4242121476593]],value:'999 MS',maxWidth:null};
  const mac={points:[[48.4,32.683155289129456],[103.7,94.42421214765932]],value:'999 MS',maxWidth:null};
  assert.equal(serializeScene(linux),serializeScene(mac));
  assert.deepEqual(JSON.parse(serializeScene(linux)),{points:[[48.4,32.6832],[103.7,94.4242]],value:'999 MS',maxWidth:null});
  assert.equal(serializeScene({maxWidth:Infinity}),'{"maxWidth":null}');
  assert.throws(()=>serializeScene({x:Infinity}),/finite/);
});
test('all serialized interaction scenes retain valid geometry and text clearance',()=>{
  for(const p of interactionExamples) assert.deepEqual(checkScene(JSON.parse(serializeScene(p.build()))),[],p.id);
});
