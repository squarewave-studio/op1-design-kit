#!/usr/bin/env python3
"""Render all public examples with the bundled Iosevka placeholder, without firmware."""
import argparse
import json
from pathlib import Path
import subprocess
import sys
import tempfile

ROOT=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ROOT/'skills/op1-design/scripts'))
from preview_font import PreviewFont

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output',type=Path,help='Write a local review set instead of replacing public PNGs')
    parser.add_argument('--check',action='store_true',help='Check every scene without rasterising or writing files')
    args=parser.parse_args()
    scenes=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {exampleScenes} from './op1-ui/src/example-scenes.mjs'; console.log(JSON.stringify(exampleScenes));"],cwd=ROOT))
    tokens=json.loads((ROOT/'op1-ui/tokens/op1-ui.json').read_text())
    font=PreviewFont(); rendered={};measured={}
    for name,scene in scenes.items():
        try: rendered[name],measured[name]=font.render(scene,tokens)
        except ValueError as error: raise ValueError(f'{name}: {error}') from error
    # The existing centreline checker adds conservative text padding as well as
    # testing real artwork curves. Exact ink bounds are retained in the report.
    check="import fs from 'node:fs'; import {checkLayout} from './op1-ui/src/layout.mjs'; let failed=false; for(const [id,s]of Object.entries(JSON.parse(fs.readFileSync(0,'utf8')))){const issues=checkLayout(s); if(issues.length){console.error(id+': '+issues.join('; '));failed=true;}}if(failed)process.exit(1);"
    result=subprocess.run(['node','--input-type=module','-e',check],input=json.dumps(measured).encode(),cwd=ROOT,capture_output=True)
    if result.returncode: raise ValueError(result.stderr.decode())
    if args.check:
        print(f'Checked {len(rendered)} Iosevka scenes: bounds, readouts and artwork clearance pass.');return
    with tempfile.TemporaryDirectory(prefix='op1-open-font-') as folder:
        staging=Path(folder)
        for name,svg in rendered.items():
            subprocess.run(['rsvg-convert','-w','960','-h','480','-o',str(staging/(name+'.png'))],input=svg,check=True)
        if args.output:
            args.output.mkdir(parents=True,exist_ok=True)
            for name in rendered:(args.output/(name+'.png')).write_bytes((staging/(name+'.png')).read_bytes())
            (args.output/'measurements.json').write_text(json.dumps(measured,indent=2)+'\n')
        else:
            for name in rendered:
                target=ROOT/'op1-ui/examples/renders'/(name+'.png')
                if not target.exists():target=ROOT/'skills/op1-design/references/visuals'/(name+'.png')
                target.write_bytes((staging/(name+'.png')).read_bytes())
            subprocess.run(['rsvg-convert','-w','1200','-h','600','-o',str(ROOT/'op1-ui/og.png')],input=rendered['membrane-rest'],check=True)
    print(f'Rendered {len(rendered)} Iosevka preview PNGs. Bounds, readout groups and artwork clearance passed. No private input used.')

if __name__=='__main__':main()
