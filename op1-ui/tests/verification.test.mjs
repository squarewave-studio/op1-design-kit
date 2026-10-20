import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {checkScene} from '../tools/check_scene.mjs';
import {scene,text,line,vectorPath,parameter} from '../src/components.mjs';

const plain=()=>({width:320,height:160,nodes:[],texts:[],readouts:[]});
test('portable scene checker accepts the shipped independent visual state files',()=>{
  const root=new URL('../../skills/op1-design/references/visuals/',import.meta.url);
  const manifest=JSON.parse(readFileSync(new URL('examples.json',root)));
  for(const p of manifest.patterns)for(const state of p.states)assert.deepEqual(checkScene(JSON.parse(readFileSync(new URL(state.scene,root)))),[],state.id);
});
test('scene checker catches overlapping supplied ink and text crossing a curve',()=>{
  const s=scene();text(s,{id:'label',value:'TUNE',x:20,y:40});
  text(s,{id:'other',value:'RATE',x:22,y:40});
  assert(checkScene(s).some(i=>i.includes('overlaps text')));
  const t=scene();text(t,{id:'label',value:'TUNE',x:20,y:40});
  vectorPath(t,'curve',[['M',10,48],['C',30,48,50,48,80,48]]);
  assert(checkScene(t).some(i=>i.includes('too close to artwork curve')));
});
test('scene checker includes stroke extents and actual commands in content bounds',()=>{
  const s=plain();s.nodes=[{id:'edge',points:[[10,10],[20,10]],width:4,commands:[['M',10,10],['L',315,10]]}];
  assert(checkScene(s).some(i=>i.includes('content guide')));
  const t=plain();t.nodes=[{id:'edge',points:[[10,10],[20,10]],width:4,commands:[['M',10,10],['C',30,100,80,150,100,100]]}];
  assert(checkScene(t).some(i=>i.includes('content guide')));
});
test('scene checker rejects malformed measurements rather than trusting a width pass',()=>{
  assert(checkScene({}).length);
  for(const width of [-1,null]){
    const s=plain();s.texts=[{id:'bad',value:'VALUE',x:20,y:20,width,size:'browserRow'}];
    assert(checkScene(s).some(i=>i.includes('invalid text bounds')));
  }
  const s=plain();s.texts=[{id:'wide',value:'LONG VALUE',x:20,y:20,width:100,size:'browserRow',maxWidth:60}];
  assert(checkScene(s).some(i=>i.includes('declared width')));
  s.texts[0].width=20;s.texts[0].size='invented';
  assert(checkScene(s).some(i=>i.includes('unknown profile')));
});
test('scene checker verifies readout grouping after a font adapter changes measurements',()=>{
  const s=scene();parameter(s,{id:'time',label:'TIME',value:'145',unit:'MS',lane:0,x:20,y:20});
  assert.deepEqual(checkScene(s),[]);
  const unit=s.texts.find(t=>t.id==='time-unit');unit.y+=3;
  assert(checkScene(s).some(i=>i.includes('baselines differ')));
  unit.y-=3;unit.x-=3;
  assert(checkScene(s).some(i=>i.includes('gap is too small')));
});

test('profile names must be strings naming own declared profiles',()=>{
  for(const size of ['constructor','__proto__','toString',['browserRow']]){
    const s=plain();s.texts=[{id:'outside',value:'TUNE',x:1000,y:1000,width:40,size}];
    assert(checkScene(s).some(i=>i.includes('unknown profile')));
  }
});
test('an invalid text reference cannot exempt artwork from clearance checks',()=>{
  for(const textId of ['missing',true,'']){
    const s=scene();text(s,{id:'label',value:'TUNE',x:20,y:40});
    line(s,'crossing',[[10,48],[80,48]]);s.nodes.at(-1).textId=textId;
    assert(checkScene(s).some(i=>i.includes('textId must reference')));
  }
});
