import { scene, text, renderSvg, validateScene, tokens } from './src/components.mjs';
import { playScreen, editorScreen } from './src/screens.mjs';
import { loadStockFont, applyStockFont } from './src/stock-font.mjs';
import {loadPreviewFont,applyPreviewFont} from '../skills/op1-design/assets/fonts/preview-font.mjs';
import { exampleScenes } from './src/example-scenes.mjs';

const $ = id => document.getElementById(id);
let previewFont=null;
let view = 'play', values = [40, 40, 40, 40], font = null;
const keyLabels = { play: ['EDIT', 'ENV', 'FX', 'LFO'], editor: ['EXIT', 'PREV', 'NEXT', 'NAME'] };
function draw() {
  const s = view === 'play' ? playScreen({ values, shift: $('shift').checked }) : editorScreen({ attack: values[1] * 4, decay: values[2] * 4 });
  $('screen').innerHTML = renderSvg(s, { guides: $('guides').checked });
  const issues = validateScene(s);
  if (font) { try { issues.push(...applyStockFont($('screen').querySelector('svg'), s, font)); } catch (error) { issues.push(error.message); } }
  else if(previewFont) {try {issues.push(...applyPreviewFont($('screen').querySelector('svg'),s,previewFont));}catch(error){issues.push(error.message);}}
  $('validation').textContent = issues.join(' / ');
  $('screen').style.width = `${320 * Number($('zoom').value)}px`;
  $('screen').style.height = `${160 * Number($('zoom').value)}px`;
  const keys = keyLabels[view];
  keys.forEach((label, i) => { $(`key${i + 1}`).textContent = `T${i + 1} · ${label || '—'}`; });
  document.querySelectorAll('[data-view]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.view === view)));
  const names = view === 'editor' ? ['MORPH', 'ATTACK', 'DECAY', 'UNASSIGNED'] : $('shift').checked ? ['MORPH', 'MOD', 'NOISE', 'CUTOFF'] : ['MORPH', 'PITCH', 'DECAY', 'BALANCE'];
  names.forEach((name, i) => { $(`name${i}`).textContent = `${tokens.encoderOrder[i].toUpperCase()} / ${name}`; });
  $('screen-caption').textContent = view === 'play' ? 'Typography specimen. Values are normalised 0–100 positions; this is not a complete instrument UI.' : 'Editor typography specimen. Host preview; device rendering and case clearance require native checks.';
  const spec = exampleScenes['type-scale'];
  $('type-specimen').innerHTML = renderSvg(spec);
  if (font) applyStockFont($('type-specimen').querySelector('svg'), spec, font);
  else if(previewFont) applyPreviewFont($('type-specimen').querySelector('svg'),spec,previewFont);
}
for (let i = 0; i < 4; i++) {
  const label = document.createElement('label');
  label.innerHTML = `<span class="slider-label"><span id="name${i}"></span><output id="value${i}">40</output></span><input id="slider${i}" type="range" min="0" max="100" value="40">`;
  label.querySelector('input').style.accentColor = tokens.color[tokens.encoderOrder[i]];
  label.querySelector('input').addEventListener('input', e => { values[i] = Number(e.target.value); $(`value${i}`).textContent = values[i]; draw(); });
  $('sliders').append(label);
}
document.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => { view = b.dataset.view; draw(); }));
for (const id of ['zoom', 'guides', 'shift']) $(id).addEventListener('change', draw);
$('key1').addEventListener('click', () => { view = view === 'play' ? 'editor' : 'play'; draw(); });
$('key2').addEventListener('click', () => { $('validation').textContent = view === 'play' ? 'T2 keeps the native envelope route; no envelope engine is simulated here.' : 'Previous-page action is an integration contract; this reference shows one editor page.'; });
$('key3').addEventListener('click', () => { $('validation').textContent = 'Native FX / next-page route must come from your plugin contract.'; });
$('key4').addEventListener('click', () => { $('validation').textContent = 'The plugin integration supplies the native LFO / name-entry route.'; });
async function setFont(source) {
  font = await loadStockFont(source);
  $('font-status').textContent = `Local stock geometry loaded. SHA-256 ${font.sha256}. Optical-spacing host profile; native kerning not reproduced.`;
  $('glyphs').textContent = `Text IDs: ${font.ids.join(' ')}\nLatin A–Z use IDs a–z. Uppercase source IDs are icons. Space is a layout advance.`;
  draw();
}
$('font-file').addEventListener('change', async e => { try { if (e.target.files[0]) await setFont(await e.target.files[0].text()); } catch (error) { $('font-status').textContent = error.message; } });
$('clear-font').addEventListener('click', () => { font = null; $('font-file').value = ''; $('font-status').textContent = 'Iosevka size-matched preview. Stock lettering needs a separate local check.'; $('glyphs').textContent = 'Iosevka preview set: A–Z, 0–9 and the punctuation documented in Fonts. Stock icons remain separate.'; draw(); });
draw();
loadPreviewFont().then(loaded=>{previewFont=loaded;if(!font){$('font-status').textContent='Iosevka size-matched preview. Stock lettering needs a separate local check.';draw();}}).catch(error=>{$('font-status').textContent=`Iosevka unavailable: ${error.message}. Schematic lettering shown.`;});
