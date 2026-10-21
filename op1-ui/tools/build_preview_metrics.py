#!/usr/bin/env python3
"""Measure the bundled open-font weights for the browser preview adapter."""
import argparse
import json
from pathlib import Path
import sys

ROOT=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ROOT/'skills/op1-design/scripts'))
from preview_font import ASSETS, PreviewFont


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check',action='store_true')
    args=parser.parse_args()
    font=PreviewFont()
    result={'profile':font.profile['id'],'weights':{}}
    for weight,face in font.faces.items():
        if face.font['OS/2'].usWeightClass!=weight: raise ValueError('Font weight does not match profile')
        if face.font['OS/2'].sCapHeight!=font.profile['capHeight']: raise ValueError('Font cap height does not match profile')
        glyphs={}
        for char in font.profile['textCharacters']:
            name,bounds,_,advance=face.glyph(char)
            glyphs[char]={'name':name,'bounds':list(bounds) if bounds else None,'advance':advance}
        result['weights'][str(weight)]={'fontSHA256':font.profile['fonts'][str(weight)]['sha256'],'glyphs':glyphs}
    body=json.dumps(result,indent=2)+'\n'
    path=ASSETS/'metrics.json'
    if args.check:
        if path.read_text()!=body: parser.exit(1,'Stale preview font metrics\n')
        print('All four weight metrics match the bundled fonts')
    else:
        path.write_text(body)
        print('Measured all four bundled Iosevka weights')


if __name__=='__main__':main()
