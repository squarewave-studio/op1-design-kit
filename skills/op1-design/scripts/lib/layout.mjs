import { tokens } from './tokens.mjs';

// Check semantic text boxes against other text and flattened artwork strokes.
// Cubics are sampled densely for these fixed reference compositions.
function segments(node) {
  if (!node.commands) return node.points.slice(1).map((p,i)=>[node.points[i],p]);
  let at, start; const result=[];
  for(const [op,...v] of node.commands) {
    if(op==='M') {at=v;start=v;}
    else if(op==='L'||op==='Z') {const end=op==='Z'?start:v;result.push([at,end]);at=end;}
    else if(op==='C') {
      const p=at;
      for(let i=1;i<=64;i++) {const t=i/64,u=1-t,end=[u*u*u*p[0]+3*u*u*t*v[0]+3*u*t*t*v[2]+t*t*t*v[4],u*u*u*p[1]+3*u*u*t*v[1]+3*u*t*t*v[3]+t*t*t*v[5]];result.push([at,end]);at=end;}
    }
  }
  return result;
}
function intersects(a,b,r) {
  let lo=0,hi=1;const dx=b[0]-a[0],dy=b[1]-a[1];
  for(const [p,q] of [[-dx,a[0]-r.x],[dx,r.x+r.w-a[0]],[-dy,a[1]-r.y],[dy,r.y+r.h-a[1]]]) {
    if(p===0) {if(q<0)return false;}
    else {const t=q/p;if(p<0)lo=Math.max(lo,t);else hi=Math.min(hi,t);if(lo>hi)return false;}
  }
  return true;
}
export function checkLayout(s, gap=tokens.layout.textArtworkGap) {
  const invalid=s.texts.filter(t=>t.inkBounds!==undefined && (!t.inkBounds || !['x','y','width','height'].every(k=>Number.isFinite(t.inkBounds[k])) || t.inkBounds.width<0 || t.inkBounds.height<0));
  if(invalid.length)return invalid.map(t=>`${t.id}: invalid measured ink bounds`);
  const boxes=s.texts.filter(t=>t.value).map(t=>t.inkBounds
    ? {id:t.id,x:t.inkBounds.x,y:t.inkBounds.y,w:t.inkBounds.width,h:t.inkBounds.height,pad:0}
    : {id:t.id,x:t.x,y:t.y,w:t.width,h:tokens.type[t.size].nominalHeight,pad:tokens.type[t.size].strokeWidth/2});
  const isText=n=>Boolean(n.textId);
  const art=s.nodes.filter(n=>!isText(n));const issues=[];
  for(let i=0;i<boxes.length;i++) {
    const a=boxes[i];
    for(const b of boxes.slice(i+1)) if(a.x-a.pad<b.x+b.w+b.pad && a.x+a.w+a.pad>b.x-b.pad && a.y-a.pad<b.y+b.h+b.pad && a.y+a.h+a.pad>b.y-b.pad) issues.push(`${a.id} overlaps text ${b.id}`);
    for(const n of art) {
      const p=gap+a.pad+n.width/2+.05;const r={x:a.x-p,y:a.y-p,w:a.w+2*p,h:a.h+2*p};
      if(segments(n).some(([start,end])=>intersects(start,end,r))) issues.push(`${a.id} is too close to artwork ${n.id}`);
    }
  }
  return issues;
}
