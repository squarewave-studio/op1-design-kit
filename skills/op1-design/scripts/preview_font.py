#!/usr/bin/env python3
"""Render the bundled open preview font. Requires fonttools[woff], never firmware."""
import argparse
import copy
import hashlib
import json
import subprocess
from pathlib import Path
import xml.etree.ElementTree as ET
from fontTools.ttLib import TTFont
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen

ASSETS = Path(__file__).resolve().parents[1] / 'assets/fonts'
NS = 'http://www.w3.org/2000/svg'
ET.register_namespace('', NS)

def element(name, attrs):
    return ET.Element('{'+NS+'}'+name, {k:str(v) for k,v in attrs.items()})

def number(value):
    return f'{value:.6f}'.rstrip('0').rstrip('.') if isinstance(value,float) else str(value)

class PreviewFace:
    def __init__(self, profile, asset):
        self.profile = profile
        path=ASSETS/asset['file']
        if hashlib.sha256(path.read_bytes()).hexdigest()!=asset['sha256']:
            raise ValueError('Preview font checksum mismatch')
        self.font=TTFont(path)
        self.glyphs=self.font.getGlyphSet()
        self.cmap=self.font.getBestCmap()
        self.selected={}
        seen=set()
        for record in self.font['GSUB'].table.FeatureList.FeatureRecord:
            index=self.profile['features'].get(record.FeatureTag)
            if not index: continue
            seen.add(record.FeatureTag)
            for lookup in record.Feature.LookupListIndex:
                for raw in self.font['GSUB'].table.LookupList.Lookup[lookup].SubTable:
                    table=getattr(raw,'ExtSubTable',raw)
                    for source,choices in getattr(table,'alternates',{}).items():
                        if index>len(choices): raise ValueError('Missing configured font variant')
                        self.selected[source]=choices[index-1]
        if set(self.profile['features'])-seen: raise ValueError('Missing configured OpenType features')
        self.cache={}

    def glyph(self,char):
        if char not in self.profile['textCharacters']: raise ValueError(f'Character outside the kit preview set: {char!r}')
        if ord(char) not in self.cmap: raise ValueError(f'Unsupported preview character: {char!r}')
        source=self.cmap[ord(char)];name=self.selected.get(source,source)
        if name not in self.cache:
            glyph=self.glyphs[name]
            bounds=BoundsPen(self.glyphs);glyph.draw(bounds)
            path=SVGPathPen(self.glyphs);glyph.draw(path)
            self.cache[name]=(name,bounds.bounds,path.getCommands(),self.font['hmtx'][name][0])
        return self.cache[name]

    def layout(self,value,style):
        # Stock profiles describe a centreline height plus stroke. Match their
        # total ink cap height using this font's own outlines and advances.
        scale=(style['nominalHeight']+style['strokeWidth'])/self.profile['capHeight']
        cursor=0;placed=[];boxes=[]
        for char in value:
            name,bounds,path,advance=self.glyph(char)
            if bounds:
                boxes.append((cursor+bounds[0],bounds[1],cursor+bounds[2],bounds[3]))
                placed.append((cursor,path))
            cursor+=advance
        if not boxes: return {'width':0,'left':0,'top':0,'bottom':0,'scale':scale,'placed':[]}
        left=min(b[0] for b in boxes);right=max(b[2] for b in boxes)
        return {'width':(right-left)*scale,'left':left,'top':max(b[3] for b in boxes)*scale,
                'bottom':min(b[1] for b in boxes)*scale,'scale':scale,'placed':placed}

    def render(self,scene,tokens):
        layouts={t['id']:self.layout(t['value'],tokens['type'][t['size']]) for t in scene['texts']}
        origins={t['id']:t['x']+(t['width']-layouts[t['id']]['width'])*{'left':0,'center':.5,'right':1}[t['align']] for t in scene['texts']}
        for group in scene.get('readouts',[]):
            a,b=layouts[group['valueId']],layouts[group['unitId']]
            width=a['width']+group['gap']+b['width']
            if width>group['maxWidth']: raise ValueError(f"{group['valueId']}: complete readout exceeds its field")
            left=group['x']-width*{'left':0,'center':.5,'right':1}[group['align']]
            origins[group['valueId']]=left;origins[group['unitId']]=left+a['width']+group['gap']
        svg=element('svg',{'width':320,'height':160,'viewBox':'0 0 320 160'})
        svg.append(element('rect',{'width':320,'height':160,'fill':tokens['color']['background']}))
        for node in scene['nodes']:
            if node.get('textId'): continue
            commands=node.get('commands') or [[('L' if i else 'M'),*p] for i,p in enumerate(node['points'])]
            svg.append(element('path',{'id':node['id'],'d':' '.join(c[0]+' '+' '.join(map(number,c[1:])) for c in commands),
                'fill':node.get('fill','none'),'stroke':node['color'],'stroke-width':number(node['width'])}))
        measured=copy.deepcopy(scene)
        for t in measured['texts']:
            m=layouts[t['id']];style=tokens['type'][t['size']];x=origins[t['id']]
            baseline=t['y']+style['nominalHeight']+style['strokeWidth']/2
            ink={'x':x,'y':baseline-m['top'],'width':m['width'],'height':m['top']-m['bottom']}
            if t.get('maxWidth') is not None and m['width']>t['maxWidth']:
                raise ValueError(f"{t['id']}: {t['value']!r} exceeds its field")
            if m['placed'] and (x<8 or ink['y']<8 or x+m['width']>312 or ink['y']+ink['height']>140):
                raise ValueError(f"{t['id']}: preview ink crosses the content guide")
            for cursor,path in m['placed']:
                svg.append(element('path',{'d':path,'fill':tokens['color'][t['tone']],
                    'transform':f'translate({number(x+(cursor-m["left"])*m["scale"])} {number(baseline)}) scale({number(m["scale"])} {number(-m["scale"])})'}))
            t.update(x=x,width=m['width'],inkBounds=ink,previewWeight=m['weight'])
        return ET.tostring(svg),measured


class PreviewFont(PreviewFace):
    def __init__(self):
        self.profile=json.loads((ASSETS/'profile.json').read_text())
        self.tokens=json.loads((ASSETS.parents[1]/'references/design-kit.json').read_text())['tokens']
        self.faces={int(weight):PreviewFace(self.profile,asset) for weight,asset in self.profile['fonts'].items()}

    def weight_for_size(self,size):
        alias=size if size in self.tokens['typeAliases'] else next((a for a,name in self.tokens['typeAliases'].items() if name==size),None)
        if alias not in self.profile['weightsBySize']: raise ValueError(f'Unknown preview text size: {size}')
        return self.profile['weightsBySize'][alias]

    def layout(self,value,style):
        if isinstance(style,str):
            size=style
            style=self.tokens['type'][self.tokens['typeAliases'].get(size,size)]
        else:
            size=next((name for name,item in self.tokens['type'].items() if item['nominalHeight']==style['nominalHeight'] and item['strokeWidth']==style['strokeWidth']),None)
            if size is None: raise ValueError('Use a named kit text size for preview lettering')
        weight=self.weight_for_size(size)
        return {**self.faces[weight].layout(value,style),'weight':weight}

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('scene',type=Path);parser.add_argument('--svg',required=True,type=Path)
    args=parser.parse_args()
    tokens=json.loads((ASSETS.parents[1]/'references/design-kit.json').read_text())['tokens']
    svg,measured=PreviewFont().render(json.loads(args.scene.read_text()),tokens)
    checker=(ASSETS.parents[1]/'scripts/lib/layout.mjs').as_uri()
    program="import fs from 'node:fs'; import {checkLayout} from "+json.dumps(checker)+"; const issues=checkLayout(JSON.parse(fs.readFileSync(0,'utf8'))); if(issues.length){console.error(issues.join('\\n'));process.exit(1);}"
    checked=subprocess.run(['node','--input-type=module','-e',program],input=json.dumps(measured),text=True,capture_output=True,check=False)
    if checked.returncode: parser.error(checked.stderr.strip())
    args.svg.write_bytes(svg)
    print('Open-font host SVG written. Keep its OFL notice with the asset; this is not native SVG source.')

if __name__=='__main__': main()
