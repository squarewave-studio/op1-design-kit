import test from 'node:test';
import assert from 'node:assert/strict';
import { scene, text, line, vectorPath } from '../src/components.mjs';
import { checkLayout } from '../src/layout.mjs';

test('text/art clearance includes curved artwork with a shared ID prefix',()=>{
  const s=scene();text(s,{id:'mode',value:'4',x:50,y:50});
  vectorPath(s,'mode-ring',[['M',40,55],['C',45,40,65,70,70,55]],'orange');
  assert(checkLayout(s).some(x=>x.includes('mode-ring')));
});
test('crossing text and a later overlapping label are both reported',()=>{
  const s=scene();text(s,{id:'one',value:'12',x:20,y:20});
  text(s,{id:'two',value:'MS',x:23,y:20});
  line(s,'guide',[[15,26],[45,26]]);
  const issues=checkLayout(s);assert(issues.some(x=>x.includes('overlaps text')));assert(issues.some(x=>x.includes('artwork guide')));
});
test('cleared labels preserve a visible gap to artwork',()=>{
  const s=scene();text(s,{id:'clear',value:'12',x:20,y:20});
  line(s,'guide',[[15,38],[45,38]]);
  assert.deepEqual(checkLayout(s),[]);
});
