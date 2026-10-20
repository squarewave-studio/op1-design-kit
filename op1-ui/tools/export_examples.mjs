import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderSvg, validateScene } from '../src/components.mjs';
import { exampleScenes as examples } from '../src/example-scenes.mjs';
import { screenExamples } from '../src/patterns.mjs';
import { interactionExamples } from '../src/interaction-examples.mjs';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(process.argv[2] || resolve(root, 'examples'));
await mkdir(output, { recursive: true });
for (const [name, scene] of Object.entries(examples)) {
  // Portable interaction sources are exported by export_interactions.mjs.
  if (interactionExamples.some(p=>p.id===name)) continue;
  const errors = validateScene(scene);
  if (errors.length) throw new Error(errors.join('\n'));
  // Metadata is useful in the browser; omit it for the conservative native profile.
  const svg = renderSvg(scene, { title: `${name} reference` }).replace(/<title>.*?<\/title>/, '');
  await writeFile(resolve(output, `${name}.svg`), svg + '\n');
  console.log(`${name}: ${scene.nodes.length} paths, ${Buffer.byteLength(svg)} bytes`);
}

const catalogue = screenExamples.map(({id,title,lesson}) => ({id,title,lesson}));
await writeFile(resolve(output, 'catalogue.json'), JSON.stringify(catalogue,null,2)+'\n');
