import { scene, text } from './components.mjs';
import { playScreen, editorScreen } from './screens.mjs';
import { screenExamples } from './patterns.mjs';
import { interactionExamples } from './interaction-examples.mjs';
const typeScale=scene();
text(typeScale,{id:'browser-row',value:'BROWSER ROW',x:16,y:10});
text(typeScale,{id:'parameter-value',value:'READOUT',x:16,y:39,size:'parameterValue'});
text(typeScale,{id:'clock-caption',value:'CLOCK',x:16,y:73});
text(typeScale,{id:'clock-number',value:'40',x:16,y:96,size:'clockNumber'});
text(typeScale,{id:'mixer-caption',value:'LEVEL',x:210,y:58});
text(typeScale,{id:'mixer-level',value:'53',x:210,y:84,size:'mixerLevel'});
const tempoTypes=scene();
text(tempoTypes,{id:'compact-caption',value:'COMPACT',x:16,y:16});
text(tempoTypes,{id:'medium-caption',value:'INTERMEDIATE',x:175,y:16});
text(tempoTypes,{id:'compact-number',value:'120',x:16,y:52,size:'tempoCompact'});
text(tempoTypes,{id:'medium-number',value:'120',x:175,y:49,size:'tempoMedium'});
text(tempoTypes,{id:'compact-unit',value:'BPM',x:16,y:106});
text(tempoTypes,{id:'medium-unit',value:'BPM',x:175,y:106});
export const exampleScenes={play:playScreen(),editor:editorScreen(),'type-scale':typeScale,
  'type-tempo':tempoTypes,
  ...Object.fromEntries(screenExamples.map(p=>[p.id,p.build()])),
  ...Object.fromEntries(interactionExamples.map(p=>[p.id,p.build()]))};
