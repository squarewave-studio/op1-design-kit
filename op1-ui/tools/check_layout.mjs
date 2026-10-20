import { screenExamples } from '../src/patterns.mjs';
import { playScreen, editorScreen } from '../src/screens.mjs';
import { checkLayout } from '../src/layout.mjs';
import { interactionExamples } from '../src/interaction-examples.mjs';

const scenes=[...screenExamples.map(p=>({id:p.id,scene:p.build()})),...interactionExamples.map(p=>({id:p.id,scene:p.build()})),{id:'play',scene:playScreen()},{id:'editor',scene:editorScreen()}];
let failures=0;
for(const {id,scene} of scenes) {const issues=checkLayout(scene);if(issues.length){failures++;console.error(id,issues);}else console.log(`PASS ${id}: text/artwork clearance`);}
if(failures)process.exitCode=1;
