// Match the SVG coordinate precision across host math-library implementations.
export function serializeScene(scene) {
  return JSON.stringify(scene, (key,value)=> {
    if(typeof value!=='number') return value;
    if(key==='maxWidth' && value===Infinity) return null; // Unbounded text field.
    if(!Number.isFinite(value)) throw new Error('Scene export requires finite numbers');
    return Number(value.toFixed(4));
  });
}
