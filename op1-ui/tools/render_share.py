#!/usr/bin/env python3
"""Render the kit's share card from original geometry and the bundled OFL Archivo font."""
import base64
from pathlib import Path
import subprocess
import xml.etree.ElementTree as ET
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen

ROOT=Path(__file__).resolve().parents[1]
NS='http://www.w3.org/2000/svg'
ET.register_namespace('',NS)

def element(name,**attrs):
    return ET.Element('{'+NS+'}'+name,{k.replace('_','-'):str(v) for k,v in attrs.items()})

def render_share():
    font=TTFont(ROOT/'assets/fonts/archivo-latin-standard-normal.woff2')
    cmap=font.getBestCmap();upm=font['head'].unitsPerEm
    svg=element('svg',width=1200,height=630,viewBox='0 0 1200 630',role='img')
    title=element('title');title.text='OP-1 Design Kit by SquareWave Studio';svg.append(title)
    svg.append(element('rect',width=1200,height=630,fill='#0b1015'))
    def lettering(value,centre,baseline,size,weight=800,width=100,fill='#f1f5f9'):
        glyphs=font.getGlyphSet(location={'wght':weight,'wdth':width})
        cursor=0;paths=[];boxes=[]
        for char in value:
            glyph=glyphs[cmap[ord(char)]]
            bounds=BoundsPen(glyphs);glyph.draw(bounds)
            pen=SVGPathPen(glyphs);glyph.draw(pen)
            if bounds.bounds:
                boxes.append((cursor+bounds.bounds[0],cursor+bounds.bounds[2]))
                paths.append((cursor,pen.getCommands()))
            cursor+=glyph.width
        scale=size/upm;left=min(b[0] for b in boxes);right=max(b[1] for b in boxes)
        origin=centre-(right-left)*scale/2-left*scale
        for cursor,path in paths:
            svg.append(element('path',d=path,fill=fill,transform=f'translate({origin+cursor*scale:.4f} {baseline}) scale({scale:.6f} {-scale:.6f})'))
    # Central identity survives both a wide card and a centre-cropped square.
    lettering('SquareWave Studio',628,82,27,650)
    mark=base64.b64encode((ROOT/'assets/squarewave-mark.svg').read_bytes()).decode()
    svg.append(element('image',x=436,y=49,width=40,height=40,href='data:image/svg+xml;base64,'+mark))
    lettering('OP-1',600,285,218,800,118)
    lettering('Design Kit',600,382,88,750,110)
    for x,colour in zip((432,544,656,768),('#698eff','#00ed95','#ffffff','#ff423f')):
        svg.append(element('circle',cx=x,cy=485,r=42,fill=colour))
    lettering('Guidance for original OP-1 screens',600,581,24,500,100,'#aab8c7')
    output=ROOT/'assets/share';output.mkdir(parents=True,exist_ok=True)
    data=ET.tostring(svg,encoding='utf-8',xml_declaration=True)
    (output/'design-kit.svg').write_bytes(data)
    result=subprocess.run(['rsvg-convert','-w','1200','-h','630'],input=data,capture_output=True,check=True)
    for name in ('og-design-kit.png','og.png'):(ROOT/name).write_bytes(result.stdout)
    print('Rendered 1200×630 share image from bundled Archivo and original encoder geometry.')

if __name__=='__main__':render_share()
