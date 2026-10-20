import test from 'node:test';
import assert from 'node:assert/strict';
import { scene, text, line, parameter, validateScene, renderSvg, tokens } from '../src/components.mjs';
import { playScreen, editorScreen } from '../src/screens.mjs';
import { screenExamples } from '../src/patterns.mjs';

test('all reference states and boundary values fit including stroke extents', () => {
  const states = [playScreen(), playScreen({ values: [0, 100, 0, 100], shift: true }),
    editorScreen({ attack: 0, decay: 999 }), editorScreen({ side: 'B' }),
    ...screenExamples.map(p => p.build())];
  for (const s of states) assert.deepEqual(validateScene(s), []);
});
test('no hidden size fallback; long text and missing glyphs are explicit errors', () => {
  assert.throws(() => text(scene(), { id: 'long', value: 'TOO LONG', x: 9, y: 9, maxWidth: 10 }), /shorten/);
  assert.throws(() => text(scene(), { id: 'tiny', value: 'OK', x: 9, y: 9, size: 'tiny' }), /Unknown stock-reference text profile/);
  assert.throws(() => text(scene(), { id: 'unicode', value: 'SNÄRE', x: 9, y: 9 }), /Unsupported glyph/);
  assert.throws(() => parameter(scene(), { id: 'units', label: 'TIME', value: '12345', unit: 'MS', lane: 0, x: 9, y: 9, width: 60 }), /fit/);
});
test('each encoder maps to its own colour without lane reordering', () => {
  for (let lane = 0; lane < 4; lane++) {
    const s = scene(); parameter(s, { id: 'p', label: 'TIME', value: '1', lane, x: 9, y: 9 });
    assert(s.nodes.every(n => n.color === tokens.color[tokens.encoderOrder[lane]]));
  }
});
test('stable IDs, finite geometry and safe-area validator expose invalid drawings', () => {
  const s = scene(); line(s, 'edge', [[8, 9], [12, 9]], 'white', 1);
  assert.equal(validateScene(s).length, 1);
  assert.throws(() => line(s, 'edge', [[10, 10], [20, 20]]), /duplicate/);
  assert.throws(() => line(s, 'nan', [[NaN, 10], [20, 20]]), /finite/);
});
test('exported SVG is self-contained paths with explicit commands and escaped metadata', () => {
  const svg = renderSvg(playScreen(), { title: '<script> & "test"' });
  assert(!svg.includes('<script>'));
  assert(svg.includes('&lt;script&gt;'));
  assert(!/<text|<use|<image|style=|transform=|https?:\/\/(?!www.w3.org)/.test(svg));
});
test('screen examples keep all stroked ink inside the critical-content guide', () => {
  for (const p of screenExamples) for (const node of p.build().nodes) for (const [x,y] of node.points) {
    assert(y+node.width/2 <= tokens.safeArea.criticalContentBottom, `${p.id}/${node.id}`);
  }
});
test('Play names and values share their edge anchors; editor preserves encoder columns', () => {
  const s = playScreen({ values: [0, 100, 100, 0] });
  for (let lane = 0; lane < 4; lane++) {
    const label = s.texts.find(t => t.id === `p${lane}-label`), value = s.texts.find(t => t.id === `p${lane}-value`);
    if (lane < 2) assert.equal(label.x, value.x);
    else assert.equal(label.x + label.width, value.x + value.width);
  }
  const editor = editorScreen();
  assert.deepEqual(['morph', 'attack', 'decay'].map(id => editor.texts.find(t => t.id === `${id}-label`).x), [9, 89, 169]);
  for (const id of ['attack', 'decay']) {
    const value = editor.texts.find(t => t.id === `${id}-value`), unit = editor.texts.find(t => t.id === `${id}-unit`);
    assert.equal(unit.x, value.x + value.width + 4);
    assert.equal(unit.y + tokens.type.browserRow.nominalHeight, value.y + tokens.type.parameterValue.nominalHeight);
  }
});

test('felt coverage stays opaque while tension geometry remains fixed', async () => {
  const { membraneScreen }=await import('../src/patterns.mjs');
  const rest=membraneScreen(), damp=membraneScreen({state:'damping'});
  const tension=s=>s.nodes.filter(n=>n.id.startsWith('tension-') || n.id.startsWith('lug-'));
  assert.deepEqual(tension(rest),tension(damp));
  assert.equal(damp.nodes.find(n=>n.id==='damping-contact').fill,tokens.color.background);
});

test('size aliases preserve stock profile dimensions and clearance metadata', () => {
  for (const [alias,profile] of Object.entries(tokens.typeAliases)) {
    const a=scene(),b=scene();
    text(a,{id:'sample',value:'120',x:16,y:16,size:alias});
    text(b,{id:'sample',value:'120',x:16,y:16,size:profile});
    assert.deepEqual(a,b);
  }
  const s=scene();
  parameter(s,{id:'gain',label:'GAIN',value:'20',lane:0,x:16,y:16,size:'s'});
  assert.equal(s.texts.find(t=>t.id==='gain-value').size,'parameterValue');
});
