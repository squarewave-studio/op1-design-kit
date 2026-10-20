import {scene,line,text,vectorPath,tokens} from './components.mjs';
import {membraneScreen} from './patterns.mjs';

// Original pattern demonstrations. These are not reconstructions of stock apps.
const label=(s,id,value,x,y,tone='white',size='xs',align='left')=>text(s,{id,value,x,y,tone,size,align});
const box=(s,id,x,y,w,h,tone='secondary',fill=null)=>vectorPath(s,id,[['M',x,y],['L',x+w,y],['L',x+w,y+h],['L',x,y+h],['Z']],tone,1.5,fill);
const cross=(s,id,x,y,tone='white')=>{line(s,id+'h',[[x-3,y],[x+3,y]],tone,2);line(s,id+'v',[[x,y-3],[x,y+3]],tone,2);};
const wave=u=>Math.sin(u*47)*(.25+.6*Math.sin(u*9)**2)+.18*Math.sin(u*103);

export function contextDetail(start=.2) {
  const s=scene(),end=start+.25;
  label(s,'heading','CONTEXT + DETAIL',16,10);
  const trace=(id,left,right,y,h,a,b)=>line(s,id,Array.from({length:81},(_,i)=>{const u=i/80;return[left+(right-left)*u,y-wave(a+(b-a)*u)*h];}),'secondary',1.2);
  trace('whole-wave',16,304,48,10,0,1);
  const x1=16+288*start,x2=16+288*end;
  box(s,'selected-span',x1,31,x2-x1,33,'secondary');
  line(s,'overview-start',[[x1,30],[x1,65]],'blue',2);
  line(s,'overview-end',[[x2,30],[x2,65]],'green',2);
  line(s,'start-link',[[x1,67],[18,75]],'decorative',1);
  line(s,'end-link',[[x2,67],[302,75]],'decorative',1);
  trace('detail-wave',18,302,96,18,start,end);
  line(s,'detail-start',[[18,77],[18,115]],'blue',2);
  line(s,'detail-end',[[302,77],[302,115]],'green',2);
  label(s,'start-label','START',16,125,'blue');label(s,'end-label','END',304,125,'green','xs','right');
  return s;
}
export function editPlayback(play=6) {
  const s=scene();label(s,'heading','EDIT + PLAY',16,10);
  for(let i=1;i<=8;i++) {
    const x=40+(i-1)*34;
    label(s,`step-${i}`,String(i),x,32,'secondary','xs','center');
    box(s,`cell-${i}`,x-12,58,24,28,'decorative');
    if([1,3,6,8].includes(i))line(s,`stored-note-${i}`,[[x-5,72],[x+5,72]],'secondary',3);
  }
  const editX=108,playX=40+(play-1)*34;
  box(s,'edit-outline',editX-15,54,30,36,'blue');
  vectorPath(s,'play-marker',[['M',playX,96],['L',playX-5,105],['L',playX+5,105],['Z']],'white',1.5,'white');
  label(s,'edit-caption','EDIT 3',16,125,'blue');label(s,'play-caption',`PLAY ${play}`,304,125,'white','xs','right');
  return s;
}
export function browserChoice(bank='METAL') {
  const s=scene(),metal=bank==='METAL';
  label(s,'bank-label','BANK',16,10,'blue');label(s,'patch-label','PATCH',180,10,'green');
  const banks=['METAL','WOOD','SKIN'],items=metal?['BOWL','BELL','PLATE']:['HOLLOW','KNOCK','BLOCK'];
  banks.forEach((v,i)=>label(s,`bank-${i}`,v,28,42+i*25,v===bank?'blue':'secondary'));
  items.forEach((v,i)=>label(s,`patch-${i}`,v,184,42+i*25,i===1?'green':'secondary'));
  box(s,'bank-choice',12,36+banks.indexOf(bank)*25,128,24,'blue');
  box(s,'patch-choice',168,61,139,24,'green');
  line(s,'column-divider',[[154,34],[154,113]],'decorative',1);
  label(s,'bank-position',`${banks.indexOf(bank)+1}/3`,16,125,'blue');label(s,'patch-position','2/3',304,125,'green','xs','right');
  return s;
}
export function shiftPresentation(shift=false) {
  const s=scene();label(s,'heading','SLICE',16,10);label(s,'modifier',shift?'SHIFT':'NORMAL',304,10,'secondary','xs','right');
  line(s,'slice-wave',Array.from({length:65},(_,i)=>[20+i*2.7,81-wave(i/64)*22]),'secondary',1.5);
  line(s,'start-bound',[[37,49],[37,114]],'blue',2);line(s,'end-bound',[[178,49],[178,114]],'green',2);
  label(s,'start-label','START',16,125,'blue');label(s,'end-label','END',181,125,'green','xs','right');
  label(s,'alternate-name',shift?'LEVEL':'MODE',263,44,'orange','xs','center');
  if(shift) {label(s,'alternate-value','-6',263,76,'orange','s','center');label(s,'alternate-unit','DB',263,113,'orange','xs','center');}
  else {line(s,'mode-shaft',[[235,86],[283,86]],'orange',2);line(s,'mode-head',[[272,76],[283,86],[272,96]],'orange',2);label(s,'mode-value','FWD',263,113,'orange','xs','center');}
  return s;
}
export function routeActivity(active=false) {
  const s=scene();
  [['RATE',60,'blue'],['AMOUNT',152,'green'],['DEST',258,'white']].forEach(([v,x,c],i)=>label(s,`name-${i}`,v,x,12,c,'xs','center'));
  box(s,'source-frame',28,53,64,40,'blue');
  vectorPath(s,'source-cycle',[['M',36,73],['C',44,53,50,53,58,73],['C',66,93,72,93,82,73]],'blue',1.5);
  line(s,'source-amount',[[93,73],[126,73]],'secondary',1.5);
  vectorPath(s,'source-arrow',[['M',119,69],['L',126,73],['L',119,77]],'secondary');
  vectorPath(s,'amount',[['M',133,52],['L',170,73],['L',133,94],['Z']],'green');
  line(s,'amount-target',[[171,73],[218,73]],'secondary',1.5);
  vectorPath(s,'target-arrow',[['M',210,69],['L',217,73],['L',210,77]],'secondary');
  box(s,'destination',225,53,77,40,'white');label(s,'destination-name','CUT',263.5,66,'white','xs','center');
  label(s,'rate-value','2 HZ',60,113,'blue','s','center');label(s,'amount-value','34%',152,113,'green','s','center');
  if(active)vectorPath(s,'activity',[['M',194,67],['L',200,73],['L',194,79],['L',188,73],['Z']],'white',1.5,'white');
  return s;
}
export function readoutFormats(changed=false) {
  const s=scene();label(s,'heading','READOUT STUDY',16,10);
  const rows=[['MODE','POLY','blue'],['OFFSET',changed?'+7 ST':'-7 ST','green'],['TIME',changed?'1.00 S':'999 MS','white'],['MIN:SEC',changed?'01:25':'01:24','orange']];
  rows.forEach(([name,value,tone],i)=>{const y=40+i*28;label(s,`name-${i}`,name,16,y,tone);label(s,`value-${i}`,value,304,y-20+tokens.type.browserRow.nominalHeight,tone,'s','right');});
  return s;
}

export const interactionPatterns=[
  {id:'context',title:'Context Beside Detail',task:'Keep the whole phrase visible while editing a selected span.',stockReference:'Synth sampler overview and magnified regions',states:[['context-first','First Span',()=>contextDetail(.2),{selection:[.2,.45]}],['context-next','Later Span',()=>contextDetail(.55),{selection:[.55,.8]}]],fixed:['Overview frame','Detail frame','Whole waveform'],changes:['Selected span','Detail waveform'],encoders:{blue:'start boundary',green:'end boundary'},checks:['Both views refer to the same sample interval','Markers remain visible at the interval limits']},
  {id:'focus',title:'Edit Focus And Playback',task:'Show where the next edit applies independently of playback.',stockReference:'Pattern live edit',states:[['focus-apart','Apart',()=>editPlayback(6),{edit:3,playback:6}],['focus-together','Coincident',()=>editPlayback(3),{edit:3,playback:3}]],fixed:['Stored notes','Edit outline at step 3'],changes:['Playback triangle'],encoders:{blue:'editing position'},checks:['Outline and triangle remain distinguishable at coincidence','Playback does not move editing focus']},
  {id:'browser',title:'Category And Choice',task:'Choose an item without losing category context.',stockReference:'Preset browser',states:[['browser-metal','Metal Bank',()=>browserChoice('METAL'),{category:'METAL',item:'BELL'}],['browser-wood','Wood Bank',()=>browserChoice('WOOD'),{category:'WOOD',item:'KNOCK'}]],fixed:['Two list regions','Blue bank and Green patch ownership'],changes:['Category choice','Available items','Item choice'],encoders:{blue:'bank',green:'patch'},checks:['The new category has an explicit valid item choice','Handle an empty category and long names without reducing text size'],fixtures:{emptyCategory:{category:'EMPTY',items:[],selected:null},longName:{value:'LONG RESONATOR VARIATION',policy:'Fixed-size scrolling name window or another detail page; no auto-shrink'}}},
  {id:'shift',title:'Alternate Presentation',task:'Reveal the function available while Shift is held.',stockReference:'Drum sampler alternate Orange readout',states:[['shift-normal','Normal',()=>shiftPresentation(false),{shift:false,mode:'FWD',levelDb:-6}],['shift-held','Held Shift',()=>shiftPresentation(true),{shift:true,mode:'FWD',levelDb:-6}]],fixed:['Waveform','Boundaries','Orange ownership','Both underlying parameter values'],changes:['Mode arrow becomes level number','Name and unit'],encoders:{orange:'playback mode',shiftOrange:'level in dB'},checks:['Releasing Shift returns to the normal scene without parameter changes']},
  {id:'route',title:'Configuration And Activity',task:'Explain a modulation route while showing independent signal activity.',stockReference:'Signal Flow and LFO route compositions',states:[['route-idle','Inactive',()=>routeActivity(false),{rateHz:2,amountPercent:34,destination:'CUT',active:false}],['route-active','Active',()=>routeActivity(true),{rateHz:2,amountPercent:34,destination:'CUT',active:true}]],fixed:['Configured route','Labels','Values','Destination'],changes:['Small activity diamond'],encoders:{blue:'rate in Hz',green:'amount in percent',white:'destination'},checks:['Activity is not a selection affordance','No selection action is implied for explanatory nodes']},
  {id:'formats',title:'Readout Formats',task:'Format categorical, signed, duration and position values deliberately.',stockReference:'Play Mode, Tempo and Clock reading tasks',states:[['formats-first','Before Transition',()=>readoutFormats(false),{offset:-7,time:'999 MS',position:'01:24'}],['formats-next','After Transition',()=>readoutFormats(true),{offset:7,time:'1.00 S',position:'01:25'}]],fixed:['Font profiles','Label positions','Right readout edges'],changes:['Sign','Duration unit','Position'],encoders:{blue:'mode',green:'offset',white:'time',orange:'position'},checks:['The widest intermediate string fits','Unit transitions preserve the right anchor','This is a readout study, not one proposed instrument']}
];

interactionPatterns.push({id:'motion',title:'Meaningful Event Response',task:'Show a struck membrane responding while controls and camera remain fixed.',stockReference:'Tombola demonstrates motion with musical consequences; this example uses original Membrane artwork',states:[['motion-rest','At Rest',()=>membraneScreen(),{state:'rest'}],['motion-strike','Strike',()=>membraneScreen({state:'strike'}),{state:'strike'}]],fixed:['Rim','Shell','Camera','Control values','Readout anchors'],changes:['Contact fills at the strike point','One local ripple on the skin'],encoders:{blue:'tension',green:'strike position',white:'damping',orange:'shell'},checks:['A real strike starts the response','Response settles back to rest','Test empty, stopped and rapidly retriggered states'],transition:['rest','strike','rest'],implementation:'Static poses only. No animation timing, native physics or CPU result is implied.'});
export const interactionExamples=interactionPatterns.flatMap(p=>p.states.map(([id,title,build,state])=>({id,title,build,pattern:p.id,state})));
