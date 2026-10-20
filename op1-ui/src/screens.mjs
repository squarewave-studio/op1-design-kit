import { scene, line, text, parameter, header, softKeys, envelope } from './components.mjs';

// Original playing and editor layouts. Controls are illustrative.
export function playScreen({ values = [40, 40, 40, 40], shift = false } = {}) {
  const s = scene();
  const labels = shift ? ['MORPH', 'MOD', 'NOISE', 'CUTOFF'] : ['MORPH', 'PITCH', 'DECAY', 'BALANCE'];
  [0, 1, 2, 3].forEach(i => parameter(s, { id: `p${i}`, label: labels[i], value: String(values[i]), lane: i, x: i < 2 ? 9 : 311, align: i < 2 ? 'left' : 'right', y: i % 2 ? 75 : 9, size: 'clockNumber', width: 100 }));
  // A typography specimen: no decorative instrument or implied sound model.
  text(s, { id: 'study-name', value: 'TYPE STUDY', x: 160, y: 55, align: 'center', tone: 'secondary' });
  text(s, { id: 'study-range', value: '0-100', x: 160, y: 80, size: 'parameterValue', align: 'center', tone: 'secondary' });
  return s;
}

export function editorScreen({ attack = 145, decay = 158, side = 'A' } = {}) {
  const s = scene();
  header(s, { title: 'DRY SNARE', context: `EDIT ${side}`, right: 'TONE ENV' });
  envelope(s, { attack: Math.min(1, attack / 400), decay: Math.min(1, decay / 400) });
  parameter(s, { id: 'morph', label: 'MORPH', value: '40', lane: 0, x: 9, y: 82 });
  parameter(s, { id: 'attack', label: 'ATTACK', value: String(attack), unit: 'MS', lane: 1, x: 89, y: 82 });
  parameter(s, { id: 'decay', label: 'DECAY', value: String(decay), unit: 'MS', lane: 2, x: 169, y: 82 });
  softKeys(s, ['EXIT', 'PREV', 'NEXT', 'NAME']);
  return s;
}
