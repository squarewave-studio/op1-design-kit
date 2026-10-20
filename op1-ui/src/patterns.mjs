import { scene, line, text, vectorPath, tokens } from './components.mjs';

// Independently authored composition studies and proposed applications.
// No extracted paths, glyphs or stock artwork are used.
const lane = tokens.encoderOrder;
const label = (s,id,value,x,y,tone='white',size='browserRow',align='left') => text(s,{id,value,x,y,tone,size,align});
const curve = (s,id,commands,tone='white',width=1.5,fillTone=null) => vectorPath(s,id,commands,tone,width,fillTone);
function ellipse(s,id,cx,cy,rx,ry,tone='white',width=1.5) {
  const k=.55228475;
  curve(s,id,[['M',cx+rx,cy],['C',cx+rx,cy+k*ry,cx+k*rx,cy+ry,cx,cy+ry],['C',cx-k*rx,cy+ry,cx-rx,cy+k*ry,cx-rx,cy],['C',cx-rx,cy-k*ry,cx-k*rx,cy-ry,cx,cy-ry],['C',cx+k*rx,cy-ry,cx+rx,cy-k*ry,cx+rx,cy]],tone,width);
}
function cross(s,id,x,y,tone) { line(s,id+'h',[[x-3,y],[x+3,y]],tone,1.5);line(s,id+'v',[[x,y-3],[x,y+3]],tone,1.5); }
function readout(s,id,value,unit,x,y,tone) {
  const box=label(s,id+'-value',value,x,y,tone,'parameterValue');
  label(s,id+'-unit',unit,x+box.width+4,y+box.height-tokens.type.browserRow.nominalHeight,tone);
  s.readouts.push({valueId:id+'-value',unitId:id+'-unit',x,align:'left',maxWidth:70,gap:4});
}
function moduleWave(s,id,x,y,tone,amount=10) {
  curve(s,id,[['M',x,y],['C',x+12,y-amount,x+20,y-amount,x+28,y],['C',x+36,y+amount,x+44,y+amount,x+56,y]],tone);
}

export function engineStudy() {
  const s=scene();
  for(let row=0;row<2;row++) {
    const y=row*70;
    label(s,`pitch-label-${row}`,'PITCH',12,10+y,'blue');
    label(s,`shape-label-${row}`,'SHAPE',66,10+y,'green');
    label(s,`decay-label-${row}`,'DECAY',137,10+y,'white');
    label(s,`source-number-${row}`,String(row+1),201,14+y,'secondary','browserRow','center');
    curve(s,`source-identity-${row}`,[['M',190,9+y],['L',212,9+y],['L',212,34+y],['L',190,34+y],['Z']],'secondary',1);
    const dialY=(row?39:41)+y,radius=row?12:13;
    ellipse(s,`pitch-dial-${row}`,33,dialY,radius,radius,'blue');
    line(s,`pitch-pointer-${row}`,[[33,dialY],[row?42:33,dialY-10]],'blue');
    label(s,`pitch-value-${row}`,row?'7':'0',33,63+y-(row?8:0),'blue','browserRow','center');
    moduleWave(s,`source-wave-${row}`,66,44+y,'green',row?7:12);
    label(s,`shape-value-${row}`,row?'3':'2',94,63+y-(row?8:0),'green','browserRow','center');
    label(s,`decay-value-${row}`,row?'240':'120',137,27+y,'white','parameterValue');
    curve(s,`source-envelope-${row}`,[['M',137,66+y],['L',145,52+y],['C',154,60+y,169,65+y,190,66+y]],'white');
  }
  label(s,'mode','MODE',254,10,'orange','browserRow','center');
  ellipse(s,'mode-ring',254,76,37,37,'orange');
  for(let i=0;i<8;i++){const a=i*Math.PI/4;line(s,`mode-tick-${i}`,[[254+31*Math.cos(a),76+31*Math.sin(a)],[254+35*Math.cos(a),76+35*Math.sin(a)]],'orange');}
  line(s,'mode-pointer',[[254,76],[273,57]],'orange',2);
  label(s,'mode-value','4',254,118,'orange','parameterValue','center');
  return s;
}
export function membraneScreen({state='rest'}={}) {
  const changed=state==='changed', strike=state==='strike';
  const tension=(changed||state==='tension')?90:64, position=(changed||state==='position')?62:35, damping=(changed||state==='damping')?75:42, shell=changed?4:2;
  const s=scene();label(s,'instrument','MEMBRANE',12,10,'secondary');
  const cx=107,cy=76,rx=78,ry=20;
  const oval=(id,x,y,r1,r2,tone,width=1.3,fill=null)=>{
    const k=.55228475;
    curve(s,id,[['M',x-r1,y],['C',x-r1,y-k*r2,x-k*r1,y-r2,x,y-r2],['C',x+k*r1,y-r2,x+r1,y-k*r2,x+r1,y],['C',x+r1,y+k*r2,x+k*r1,y+r2,x,y+r2],['C',x-k*r1,y+r2,x-r1,y+k*r2,x-r1,y],['Z']],tone,width,fill);
  };
  // The bowl, rim and camera remain fixed. No free arm, stick or crosshairs.
  curve(s,'shell-left',[['M',29,78],['C',41,120,68,130,107,131],['C',146,130,172,120,185,78]],'orange',1.6,'background');
  if(shell===4)for(let i=0;i<4;i++){
    const x=80+i*18;
    line(s,`shell-grain-${i}`,[[x,112],[x,121]],'orange',1);
  }
  oval('rim-outer',cx,cy,rx,ry,'secondary',1.8,'background');
  oval('skin',cx,cy-1,71,15,'secondary',1,'background');
  // Less exposed fitting length represents greater tension, with fixed anchors.
  [25,65,115,155].forEach((degrees,i)=>{
    const a=degrees*Math.PI/180,x=cx+rx*Math.cos(a),y=cy+ry*Math.sin(a);
    const exposed=Math.min(Math.max(.5,9.4-tension*.1),(i===0||i===3)?8:12);
    line(s,`tension-${i}`,[[x-.5,y-2],[x+.5,y+exposed]],'blue',2.2);
  });
  const sx=52.5+position*.9,sy=75;
  oval('strike-contact',sx,sy,strike?3.2:2.2,strike?2:1.5,'green',1.3,strike?'green':'background');
  if(strike){
    // Bound the event to the skin even when adapting the strike-position range.
    const radius=Math.min(24,sx-(cx-71)-4,(cx+71)-sx-4);
    oval('response1',sx,sy,radius,radius*.25,'green',1.2);
  }
  // More felt coverage increases damping; the pad stays near the rim.
  // Draw it last so it occludes the skin response rather than becoming transparent.
  const feltWidth=Math.max(3,18+(damping-42)*.45),left=169-feltWidth;
  curve(s,'damping-contact',[['M',left+2,68],['L',169,72],['L',167,77],['L',left,73],['Z']],'white',1.3,'background');
  const values=[tension,position,damping,shell].map(String);
  ['TENSION','STRIKE','DAMP','SHELL'].forEach((name,i)=>{label(s,`name-${i}`,name,212,24+i*31,lane[i]);label(s,`value-${i}`,values[i],311,24+tokens.type.browserRow.nominalHeight-20+i*31,lane[i],'parameterValue','right');});
  return s;
}
export function envelopeStudy() {
  const s=scene();
  curve(s,'envelope',[['M',20,119],['C',26,74,42,44,66,29],['C',74,68,91,76,131,78],['L',228,78],['C',240,103,260,119,298,119]],'blue',1.5);
  [[20,119],[66,29],[131,78],[228,78],[298,119]].forEach(([x,y],i)=>{line(s,`point-${i}-h`,[[x-1.5,y],[x+1.5,y]],'blue',1);line(s,`point-${i}-v`,[[x,y-1.5],[x,y+1.5]],'blue',1);});
  ['A 12','D 240','S 65','R 1.2'].forEach((v,i)=>label(s,`value-${i}`,v,12+i*80,125,lane[i]));
  return s;
}
export function transientScreen({state='rest'}={}) {
  const s=scene();const changed=state==='changed',hit=state==='strike';
  const attack=(changed||state==='attack')?8:4,bodyGain=(changed||state==='body')?-6:2,tailMs=(changed||state==='tail')?240:120;
  label(s,'instrument','TRANSIENT',12,9,'secondary');
  label(s,'amount-label','MIX',306,9,'orange','browserRow','right');label(s,'amount-value',changed?'80':'60',306,28,'orange','parameterValue','right');label(s,'mix-unit','%',306,54,'orange','browserRow','right');
  const neutral=82,peak=neutral-4*attack,body=neutral-4*bodyGain,tail=145+.5*tailMs;
  line(s,'neutral-reference',[[40,neutral],[300,neutral]],'decorative',1);
  label(s,'neutral-label','0DB',9,76,'secondary');
  curve(s,'attack',[['M',45,neutral],['C',48,neutral,52,peak+4,58,peak]],'blue',2);
  curve(s,'body',[['M',58,peak],['C',69,body-4,101,body,145,body]],'green',2);
  curve(s,'tail',[['M',145,body],['C',145+(tail-145)*.3,body,145+(tail-145)*.75,neutral,tail,neutral]],'white',2);
  cross(s,'attack-handle',58,peak,'blue');cross(s,'body-handle',145,body,'green');cross(s,'tail-handle',tail,neutral,'white');
  readout(s,'attack','+'+attack,'DB',75,30,'blue');readout(s,'body',bodyGain>0?'+'+bodyGain:String(bodyGain),'DB',150,37,'green');
  readout(s,'tail',String(tailMs),'MS',220,98,'white');
  ['ATTACK','BODY','TAIL'].forEach((v,i)=>label(s,`name-${i}`,v,20+i*105,125,lane[i]));
  if(hit) {line(s,'hit-marker',[[68,37],[68,110]],'orange',1);cross(s,'hit-tip',68,37,'orange');}
  return s;
}
export const screenExamples = [
  {id:'engine-study',title:'Grouped Engine Controls',build:engineStudy},
  {id:'membrane-rest',title:'Membrane: At Rest',build:()=>membraneScreen()},
  {id:'membrane-changed',title:'Membrane: Controls Changed',build:()=>membraneScreen({state:'changed'})},
  ...['tension','position','damping'].map(state=>({id:'membrane-'+state,title:'Membrane: '+state+' only',build:()=>membraneScreen({state})})),
  {id:'membrane-strike',title:'Membrane: Struck',build:()=>membraneScreen({state:'strike'})},
  {id:'envelope-study',title:'Envelope Composition Study',build:envelopeStudy},
  {id:'transient-rest',title:'Transient: Default Shape',build:()=>transientScreen()},
  {id:'transient-changed',title:'Transient: Controls Changed',build:()=>transientScreen({state:'changed'})},
  ...['attack','body','tail'].map(state=>({id:'transient-'+state,title:'Transient: '+state+' only',build:()=>transientScreen({state})})),
  {id:'transient-strike',title:'Transient: Musical Event',build:()=>transientScreen({state:'strike'})}
];
