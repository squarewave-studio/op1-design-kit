#!/usr/bin/env node
// Check kit-format scene geometry and supplied text bounds, without loading fonts.
import {readFileSync,realpathSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {checkLayout} from './lib/layout.mjs';
import {tokens} from './lib/tokens.mjs';

export function checkScene(s) {
  const issues=[];
  if(!s || s.width!==320 || s.height!==160 || !Array.isArray(s.nodes) || !Array.isArray(s.texts))return ['Expected a 320×160 kit scene with nodes and texts arrays'];
  const ids=new Set(),textIds=new Set();
  const finite=(...v)=>v.every(Number.isFinite);
  const inBounds=(id,x,y,w,h,pad)=>{
    if(x-pad<tokens.safeArea.left || y-pad<tokens.safeArea.top || x+w+pad>320-tokens.safeArea.right || y+h+pad>tokens.safeArea.criticalContentBottom)issues.push(`${id}: ink crosses the proposed content guide`);
  };
  for(const n of s.nodes) {
    if(!n || typeof n.id!=='string' || !n.id || ids.has(n.id)){issues.push('Missing or duplicate artwork ID');continue;}
    ids.add(n.id);
    if(!finite(n.width) || n.width<=0){issues.push(`${n.id}: invalid stroke width`);continue;}
    let points=n.points;
    if(n.commands!==undefined) {
      if(!Array.isArray(n.commands) || !n.commands.length || n.commands[0]?.[0]!=='M'){issues.push(`${n.id}: invalid path start`);continue;}
      points=[];let moves=0,valid=true;
      for(const command of n.commands) {
        if(!Array.isArray(command)){valid=false;break;}
        const [op,...v]=command,arity={M:2,L:2,C:6,Z:0}[op];
        if(arity===undefined || v.length!==arity || !finite(...v)){valid=false;break;}
        if(op==='M')moves++;
        for(let i=0;i<v.length;i+=2)points.push(v.slice(i,i+2));
      }
      if(!valid || moves!==1){issues.push(`${n.id}: expected one finite M/L/C/Z contour`);continue;}
    }
    if(!Array.isArray(points) || points.length<2 || points.some(p=>!Array.isArray(p)||p.length!==2||!finite(...p))){issues.push(`${n.id}: invalid geometry points`);continue;}
    for(const [x,y] of points)inBounds(n.id,x,y,0,0,n.width/2);
  }
  for(const t of s.texts) {
    if(!t || typeof t.id!=='string' || !t.id || textIds.has(t.id)){issues.push('Missing or duplicate text ID');continue;}
    textIds.add(t.id);
    const profile=typeof t.size==='string' && Object.hasOwn(tokens.type,t.size)?tokens.type[t.size]:null;
    if(!profile || typeof t.value!=='string' || !finite(t.x,t.y,t.width) || t.width<0){issues.push(`${t.id}: invalid text bounds or unknown profile`);continue;}
    if(t.maxWidth!==undefined && t.maxWidth!==null && t.maxWidth!==Infinity && (!finite(t.maxWidth) || t.maxWidth<0 || t.width>t.maxWidth+.001))issues.push(`${t.id}: text exceeds its declared width`);
    inBounds(t.id,t.x,t.y,t.width,profile.nominalHeight,profile.strokeWidth/2);
  }
  for(const n of s.nodes)if(n && Object.hasOwn(n,'textId') && (typeof n.textId!=='string' || !textIds.has(n.textId)))issues.push(`${n.id}: textId must reference an existing semantic text record`);
  if(s.readouts!==undefined && !Array.isArray(s.readouts))issues.push('Expected readouts array');
  if(issues.length)return [...new Set(issues)];
  for(const r of s.readouts||[]) {
    if(!r || typeof r!=='object'){issues.push('Invalid value/unit group');continue;}
    const value=s.texts.find(t=>t.id===r.valueId),unit=s.texts.find(t=>t.id===r.unitId);
    if(!value || !unit || !finite(r.maxWidth,r.gap) || r.maxWidth<=0 || r.gap<0){issues.push('Invalid value/unit group');continue;}
    if(unit.x+unit.width-value.x>r.maxWidth+.001)issues.push(`${value.id}: value/unit group exceeds its width`);
    if(unit.x-value.x-value.width<r.gap-.001)issues.push(`${value.id}: value/unit gap is too small`);
    if(Math.abs(value.y+tokens.type[value.size].nominalHeight-unit.y-tokens.type[unit.size].nominalHeight)>.01)issues.push(`${value.id}: value and unit baselines differ`);
  }
  return [...new Set([...issues,...checkLayout(s)])];
}

function main() {
  const args=process.argv.slice(2);let fontMode='schematic';
  if(args[0]==='--font-mode'){args.shift();fontMode=args.shift();}
  if(args.length===1&&args[0]==='--help'){console.log('node check_scene.mjs [--font-mode schematic|stock-local] scene.json [...]');return;}
  if(!['schematic','stock-local'].includes(fontMode)||!args.length){console.error('Expected --font-mode schematic|stock-local and one or more kit scene JSON files');process.exitCode=1;return;}
  for(const file of args) {
    try {
      const issues=checkScene(JSON.parse(readFileSync(file,'utf8')));
      if(issues.length){process.exitCode=1;for(const issue of issues)console.error(`ERROR ${file}: ${issue}`);}
      else console.log(`PASS ${file}: geometry and supplied ${fontMode} text bounds; visual and native checks still required`);
    }catch(error){console.error(`ERROR ${file}: ${error.message}`);process.exitCode=1;}
  }
}
let isMain=false;
if(process.argv[1] && process.argv[1]!=='-'){
  try{isMain=pathToFileURL(realpathSync(resolve(process.argv[1]))).href===import.meta.url;}catch{}
}
if(isMain)main();
