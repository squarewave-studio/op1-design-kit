import {mkdir,writeFile} from 'node:fs/promises';
import {interactionPatterns} from '../src/interaction-examples.mjs';
import {renderSvg,validateScene} from '../src/components.mjs';
import {checkLayout} from '../src/layout.mjs';

const out=new URL('../../skills/op1-design/references/visuals/',import.meta.url);
await mkdir(out,{recursive:true});
const patterns=[];
for(const p of interactionPatterns) {
  const states=[];
  for(const [id,title,build,state] of p.states) {
    const scene=build(),issues=[...validateScene(scene),...checkLayout(scene)];
    if(issues.length)throw new Error(`${id}: ${issues.join('; ')}`);
    await writeFile(new URL(id+'.svg',out),renderSvg(scene,{title}).replace(/<title>.*?<\/title>/,'')+'\n');
    // Original schematic geometry and semantic text only, never stock glyph data.
    await writeFile(new URL(id+'.json',out),JSON.stringify({...scene,nodes:scene.nodes.filter(n=>!n.textId)})+'\n');
    states.push({id,title,state,png:id+'.png',svg:id+'.svg',scene:id+'.json'});
  }
  const {states:_,...contract}=p;
  patterns.push({...contract,states});
}
await writeFile(new URL('examples.json',out),JSON.stringify({schemaVersion:1,version:'0.1.0',scope:'Original host pattern demonstrations; not stock screens or native implementations',fontModes:{png:'stock-local / optical-v1',svg:'original schematic alphabet',scene:'semantic text records plus original schematic geometry'},patterns},null,2)+'\n');
console.log(`Exported ${patterns.length} pattern contracts and ${patterns.reduce((n,p)=>n+p.states.length,0)} original schematic SVGs`);
