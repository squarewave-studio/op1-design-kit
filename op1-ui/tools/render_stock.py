#!/usr/bin/env python3
"""Render PNG examples with an owner's local font; no font or outlined SVG is saved."""
import argparse
import copy
import json
from pathlib import Path
import re
import shutil
import subprocess
import tempfile
import uuid
import xml.etree.ElementTree as ET

ROOT=Path(__file__).resolve().parents[2]
NS='http://www.w3.org/2000/svg'
SHAPES={'path','line','polyline','polygon','rect','circle','ellipse'}
ATTRS={'d','x','y','x1','y1','x2','y2','width','height','cx','cy','r','rx','ry','points'}
ET.register_namespace('',NS)

def element(tag,attrs=None): return ET.Element('{'+NS+'}'+tag,attrs or {})
def number(v): return f'{v:.6f}'.rstrip('0').rstrip('.') if isinstance(v,float) else str(v)
def node(command,**kwargs): return subprocess.run(command,check=True,capture_output=True,timeout=30,**kwargs).stdout

def load_font(path):
    if path.resolve().is_relative_to(ROOT): raise ValueError('Keep the stock font outside this repository')
    data=path.read_bytes()
    if b'<!ENTITY' in data.upper(): raise ValueError('Font entities are unsupported')
    data=re.sub(rb'<!DOCTYPE[^>\[\]]*>',b'',data)
    if b'<!DOCTYPE' in data.upper(): raise ValueError('Font DTD subsets are unsupported')
    root=ET.fromstring(data)
    if root.tag.rsplit('}',1)[-1]!='svg': raise ValueError('Expected an SVG font')
    if any('transform' in e.attrib for e in root.iter()): raise ValueError('Font transforms need a separate adapter')
    glyphs={}
    probe=element('svg',{'width':'4000','height':'4000','viewBox':'0 0 4000 4000'})
    for source in root:
        char=re.sub(r'_x([0-9a-fA-F]{2})_',lambda m:chr(int(m[1],16)),source.get('id',''))
        if len(char)!=1 or char.isupper(): continue
        group=element('g',{'id':f'glyph{ord(char)}'})
        def visit(e,stroke='#000000'):
            stroke=e.get('stroke',stroke)
            tag=e.tag.rsplit('}',1)[-1]
            if tag=='g':
                for child in e: visit(child,stroke)
            elif tag in SHAPES and stroke.lower() in {'black','#000','#000000'}:
                attrs={k:v for k,v in e.attrib.items() if k in ATTRS}
                for key,values in {'stroke-linecap':{'butt','round','square'},'stroke-linejoin':{'miter','round','bevel'}}.items():
                    if e.get(key) in values: attrs[key]=e.get(key)
                attrs.update(fill='none',stroke='#000000',**{'stroke-width':'0.00001'})
                group.append(element(tag,attrs))
        visit(source)
        if not len(group): continue
        if char in glyphs: raise ValueError('Duplicate font character')
        cell=next((e for e in source.iter() if e.tag.rsplit('}',1)[-1]=='rect' and e.get('stroke','').lower() in {'#ffff00','yellow'}),None)
        glyphs[char]={'geometry':group,'cell_top':float(cell.get('y','0')) if cell is not None else None}
        probe.append(copy.deepcopy(group))
    # A near-zero probe stroke measures the centreline to the query's precision.
    bounds=node(['inkscape',f'--app-id-tag=op1kit{uuid.uuid4().hex}','--batch-process','--pipe','--query-all'],input=ET.tostring(probe)).decode()
    for row in bounds.splitlines():
        fields=row.split(',')
        if len(fields)==5 and fields[0].startswith('glyph'):
            char=chr(int(fields[0][5:]));glyphs[char]['box']=tuple(map(float,fields[1:]))
    for char in 'abcdefghijklmnopqrstuvwxyz':
        if char not in glyphs or 'box' not in glyphs[char]: raise ValueError('Font lacks required Latin glyphs')
    return glyphs,max(glyphs[c]['box'][3] for c in 'abcdefghijklmnopqrstuvwxyz')

def layout(glyphs,cap,value,height):
    scale=height/cap;cursor=0;placed=[]
    for char in value.upper():
        if char==' ': cursor+=height*.48;continue
        key=char.lower() if 'A'<=char<='Z' else char
        if key not in glyphs or 'box' not in glyphs[key]: raise ValueError(f'Missing stock character {char!r}')
        glyph=glyphs[key];placed.append((glyph,cursor));cursor+=max(glyph['box'][2]*scale,height*.22)+height*.17
    ink_width=max((x+glyph['box'][2]*scale for glyph,x in placed),default=0)
    return placed,scale,ink_width

def render_scene(scene,glyphs,cap,tokens):
    measured=copy.deepcopy(scene)
    layouts={t['id']:layout(glyphs,cap,t['value'],tokens['type'][t['size']]['nominalHeight']) for t in scene['texts']}
    origins={t['id']:t['x']+(t['width']-layouts[t['id']][2])*({'left':0,'center':.5,'right':1}[t['align']]) for t in scene['texts']}
    for group in scene.get('readouts',[]):
        width=layouts[group['valueId']][2]+group['gap']+layouts[group['unitId']][2]
        if width>group['maxWidth']: raise ValueError(f"{group['valueId']}: stock value/unit group does not fit")
        left=group['x']-width*{'left':0,'center':.5,'right':1}[group['align']]
        origins[group['valueId']]=left;origins[group['unitId']]=left+layouts[group['valueId']][2]+group['gap']
    svg=element('svg',{'width':'320','height':'160','viewBox':'0 0 320 160'})
    svg.append(element('rect',{'width':'320','height':'160','fill':tokens['color']['background']}))
    for n in scene['nodes']:
        if n.get('textId'): continue
        commands=n.get('commands') or [[('M' if i==0 else 'L'),*p] for i,p in enumerate(n['points'])]
        d=' '.join(c[0]+' '+' '.join(map(number,c[1:])) for c in commands)
        svg.append(element('path',{'id':n['id'],'d':d,'fill':n.get('fill','none'),'stroke':n['color'],'stroke-width':number(n['width'])}))
    for t in measured['texts']:
        placed,scale,width=layouts[t['id']];height=tokens['type'][t['size']]['nominalHeight'];stroke=tokens['type'][t['size']]['strokeWidth']
        t['x']=origins[t['id']];t['width']=width
        if t.get('maxWidth') is not None and width>t['maxWidth']: raise ValueError(f"{t['id']}: stock text exceeds its width")
        if t['x']-stroke/2<8 or t['x']+width+stroke/2>312 or t['y']-stroke/2<8 or t['y']+height+stroke/2>140: raise ValueError(f"{t['id']}: stock text crosses the content guide")
        for glyph,x in placed:
            gx,gy,_,gh=glyph['box'];offset=(gy-glyph['cell_top'])*scale if glyph['cell_top'] is not None else height-min(height,gh*scale)
            group=element('g',{'transform':f'translate({number(t["x"]+x)} {number(t["y"]+offset)}) scale({number(scale)}) translate({number(-gx)} {number(-gy)})'})
            for original in glyph['geometry']:
                shape=copy.deepcopy(original);shape.set('stroke',tokens['color'][t['tone']]);shape.set('stroke-width',number(stroke/scale));group.append(shape)
            svg.append(group)
    return ET.tostring(svg),measured

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--font',required=True,type=Path)
    parser.add_argument('--output',type=Path,default=ROOT/'op1-ui/examples/renders')
    parser.add_argument('--scale',type=int,default=3,choices=[1,2,3,4])
    parser.add_argument('--og',type=Path)
    parser.add_argument('--only',nargs='+',help='Render only these named example states')
    args=parser.parse_args()
    glyphs,cap=load_font(args.font)
    scenes=json.loads(node(['node','--input-type=module','-e',"import {exampleScenes} from './op1-ui/src/example-scenes.mjs'; console.log(JSON.stringify(exampleScenes));"],cwd=ROOT))
    if args.only:
        missing=set(args.only)-set(scenes)
        if missing: raise ValueError('Unknown example states: '+', '.join(sorted(missing)))
        scenes={name:scenes[name] for name in args.only}
    tokens=json.loads((ROOT/'op1-ui/tokens/op1-ui.json').read_text());rendered={};measured={}
    for name,scene in scenes.items():
        try: rendered[name],measured[name]=render_scene(scene,glyphs,cap,tokens)
        except ValueError as error: raise ValueError(f'{name}: {error}') from error
    script="import fs from 'node:fs'; import {checkLayout} from './op1-ui/src/layout.mjs'; const scenes=JSON.parse(fs.readFileSync(0,'utf8')); let failed=false; for(const [id,scene] of Object.entries(scenes)){const issues=checkLayout(scene); if(issues.length){console.error(id+': '+issues.join('; '));failed=true;}} if(failed)process.exit(1);"
    check=subprocess.run(['node','--input-type=module','-e',script],input=json.dumps(measured).encode(),cwd=ROOT,capture_output=True)
    if check.returncode: raise ValueError(check.stderr.decode().strip())
    # Font-bearing SVG exists only in memory and travels directly to the rasterizer.
    with tempfile.TemporaryDirectory(prefix='op1-png-') as folder:
        staging=Path(folder)
        for name,svg in rendered.items():
            node(['rsvg-convert','-w',str(320*args.scale),'-h',str(160*args.scale),'-o',str(staging/(name+'.png'))],input=svg)
        if args.og: node(['rsvg-convert','-w','1200','-h','600','-o',str(staging/'og.png')],input=rendered['membrane-rest'])
        args.output.mkdir(parents=True,exist_ok=True)
        for name in rendered: shutil.copy2(staging/(name+'.png'),args.output/(name+'.png'))
        if args.og: shutil.copy2(staging/'og.png',args.og)
    print(f'Rendered {len(rendered)} stock-font PNGs at {320*args.scale}×{160*args.scale}; optical-v1 spacing. Font and vector glyph data were not saved.')

if __name__=='__main__':
    try: main()
    except (ValueError,ET.ParseError,subprocess.CalledProcessError,subprocess.TimeoutExpired,OSError) as error: raise SystemExit(str(error))
