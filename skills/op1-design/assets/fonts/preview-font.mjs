// Original kit adapter (MIT). Iosevka font assets retain their included OFL.
import {tokens} from '../../scripts/lib/tokens.mjs';
import {checkLayout} from '../../scripts/lib/layout.mjs';
const NS='http://www.w3.org/2000/svg';
export async function loadPreviewFont(){
  const [profile,metrics]=await Promise.all(['profile.json','metrics.json'].map(name=>fetch(new URL(name,import.meta.url)).then(r=>{if(!r.ok)throw Error('Preview font metadata unavailable');return r.json();})));
  const response=await fetch(new URL(profile.file,import.meta.url));if(!response.ok)throw Error('Preview font unavailable');const bytes=await response.arrayBuffer();
  const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');
  if(hash!==profile.sha256||metrics.fontSHA256!==hash)throw Error('Preview font checksum mismatch');
  const face=new FontFace('OP1KitPreview',bytes,{weight:String(profile.weight)});await face.load();document.fonts.add(face);
  return {profile,metrics,features:Object.entries(profile.features).map(([tag,value])=>`"${tag}" ${value}`).join(', ')};
}
export function previewTextLayout(font,value,type){
  const scale=(type.nominalHeight+type.strokeWidth)/font.profile.capHeight;let cursor=0;const placed=[],boxes=[];
  for(const char of value){const glyph=font.metrics.glyphs[char];if(!glyph)throw RangeError(`Unsupported kit preview character: ${char}`);if(glyph.bounds){const [x0,y0,x1,y1]=glyph.bounds;boxes.push([cursor+x0,y0,cursor+x1,y1]);placed.push({char,cursor});}cursor+=glyph.advance;}
  const left=boxes.length?Math.min(...boxes.map(b=>b[0])):0,right=boxes.length?Math.max(...boxes.map(b=>b[2])):0;
  return {scale,left,width:(right-left)*scale,top:boxes.length?Math.max(...boxes.map(b=>b[3]))*scale:0,bottom:boxes.length?Math.min(...boxes.map(b=>b[1]))*scale:0,placed};
}
export function applyPreviewFont(svg,scene,font){
  const layouts=new Map(scene.texts.map(t=>[t.id,previewTextLayout(font,t.value,tokens.type[t.size])])),origins=new Map(scene.texts.map(t=>[t.id,t.x+(t.width-layouts.get(t.id).width)*({left:0,center:.5,right:1}[t.align])])),issues=[];
  for(const g of scene.readouts||[]){const a=layouts.get(g.valueId),b=layouts.get(g.unitId),width=a.width+g.gap+b.width,left=g.x-width*({left:0,center:.5,right:1}[g.align]);origins.set(g.valueId,left);origins.set(g.unitId,left+a.width+g.gap);if(width>g.maxWidth)issues.push(`${g.valueId}: complete preview readout exceeds its field`);}
  const ids=new Set(scene.nodes.filter(n=>n.textId).map(n=>n.id));for(const e of svg.querySelectorAll('[id]'))if(ids.has(e.id))e.remove();
  for(const t of scene.texts){const m=layouts.get(t.id),type=tokens.type[t.size],x=origins.get(t.id),baseline=t.y+type.nominalHeight+type.strokeWidth/2;
    if(t.maxWidth!==null&&t.maxWidth!==undefined&&m.width>t.maxWidth)issues.push(`${t.id}: preview text exceeds its field`);
    if(m.placed.length&&(x<8||x+m.width>312||baseline-m.top<8||baseline-m.bottom>140))issues.push(`${t.id}: preview text crosses the content guide`);
    for(const p of m.placed){const e=document.createElementNS(NS,'text');for(const[k,v]of Object.entries({x:x+(p.cursor-m.left)*m.scale,y:baseline,'font-family':'OP1KitPreview','font-size':font.profile.unitsPerEm*m.scale,'font-weight':font.profile.weight,fill:tokens.color[t.tone],style:`font-feature-settings:${font.features}`}))e.setAttribute(k,v);e.textContent=p.char;svg.append(e);}
  }
  issues.push(...checkLayout({...scene,texts:scene.texts.map(t=>{const m=layouts.get(t.id),type=tokens.type[t.size],baseline=t.y+type.nominalHeight+type.strokeWidth/2;return {...t,x:origins.get(t.id),width:m.width,inkBounds:{x:origins.get(t.id),y:baseline-m.top,width:m.width,height:m.top-m.bottom}};})}));return issues;
}
