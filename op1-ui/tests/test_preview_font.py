"""Check the licensed preview profile, ink alignment and private-output boundary."""
import importlib.util
import json
import shutil
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

ROOT=Path(__file__).resolve().parents[2]
SPEC=importlib.util.spec_from_file_location('preview_font',ROOT/'skills/op1-design/scripts/preview_font.py')
MODULE=importlib.util.module_from_spec(SPEC);SPEC.loader.exec_module(MODULE)

class PreviewFontTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.font=MODULE.PreviewFont()
        cls.tokens=json.loads((ROOT/'design-kit.json').read_text())['tokens']

    def test_profile_and_browser_metrics_match_the_bundled_font(self):
        font=self.font
        metrics=json.loads((MODULE.ASSETS/'metrics.json').read_text())
        self.assertEqual(metrics['profile'],font.profile['id'])
        self.assertEqual(set(metrics['weights']),set(font.profile['fonts']))
        for weight,face in font.faces.items():
            measured=metrics['weights'][str(weight)]
            self.assertEqual(measured['fontSHA256'],font.profile['fonts'][str(weight)]['sha256'])
            self.assertEqual(set(measured['glyphs']),set(font.profile['textCharacters']))
            for char,glyph in measured['glyphs'].items():
                name,bounds,_,advance=face.glyph(char)
                self.assertEqual(glyph,{'name':name,'bounds':list(bounds) if bounds else None,'advance':advance},(weight,char))
            self.assertEqual(face.font['OS/2'].usWeightClass,weight)
            self.assertEqual(face.font['head'].unitsPerEm,font.profile['unitsPerEm'])
            self.assertEqual(face.font['OS/2'].sCapHeight,font.profile['capHeight'])
            for char in '169I':
                self.assertIn(face.cmap[ord(char)],face.selected)
                self.assertEqual(face.glyph(char)[0],face.selected[face.cmap[ord(char)]])

    def test_size_mapping_preserves_preview_weights_when_scaling_output(self):
        expected={'xs':400,'s':300,'m':200,'l':200,'xl':100,'xxl':100}
        for alias,weight in expected.items():
            profile=self.tokens['typeAliases'][alias]
            self.assertEqual(self.font.weight_for_size(alias),weight)
            self.assertEqual(self.font.weight_for_size(profile),weight)
            self.assertEqual(self.font.layout('169I',alias)['weight'],weight)
        with self.assertRaisesRegex(ValueError,'Unknown preview text size'):
            self.font.weight_for_size('invented')

    def test_narrow_last_character_uses_ink_instead_of_full_advance(self):
        style=self.tokens['type']['browserRow']
        for char in '1I':
            _,bounds,_,advance=self.font.faces[400].glyph(char)
            measured=self.font.layout(char,style)
            self.assertAlmostEqual(measured['width'],(bounds[2]-bounds[0])*measured['scale'])
            self.assertLess(measured['width'],advance*measured['scale'])
        with self.assertRaisesRegex(ValueError,'outside the kit preview set'):
            self.font.layout('é',style)

    def test_readout_retains_ink_gap_and_shared_right_anchor(self):
        style=self.tokens['type']['browserRow']
        def field(id,value):
            return dict(id=id,value=value,x=50,y=40,width=20,size='browserRow',align='right',tone='white',maxWidth=80)
        scene=dict(nodes=[],texts=[field('value','11'),field('unit','S')],readouts=[dict(valueId='value',unitId='unit',gap=4,maxWidth=80,x=200,align='right')])
        _,measured=self.font.render(scene,self.tokens)
        a,b=measured['texts']
        self.assertAlmostEqual(b['x']+b['width'],200)
        self.assertAlmostEqual(b['x']-a['x']-a['width'],4)
        scene['readouts'][0]['maxWidth']=1
        with self.assertRaisesRegex(ValueError,'complete readout exceeds'):
            self.font.render(scene,self.tokens)

    def test_portable_renderer_checks_artwork_before_writing(self):
        with tempfile.TemporaryDirectory() as folder:
            installed=Path(folder)/'installed-skill'
            shutil.copytree(ROOT/'skills/op1-design',installed,ignore=shutil.ignore_patterns('__pycache__'))
            source=json.loads((installed/'references/visuals/formats-first.json').read_text())
            target=Path(folder)/'preview.svg';scene=Path(folder)/'scene.json'
            scene.write_text(json.dumps(source))
            command=[sys.executable,str(installed/'scripts/preview_font.py'),str(scene),'--svg',str(target)]
            result=subprocess.run(command,text=True,capture_output=True)
            self.assertEqual(result.returncode,0,result.stderr)
            self.assertTrue(target.exists());target.unlink()
            t=source['texts'][0]
            source['nodes'].append(dict(id='bad-line',points=[[t['x'],t['y']+3],[t['x']+30,t['y']+3]],width=1,color='#FFFFFF'))
            scene.write_text(json.dumps(source))
            result=subprocess.run(command,text=True,capture_output=True)
            self.assertNotEqual(result.returncode,0,result.stderr)
            self.assertFalse(target.exists())

    def test_descender_overlap_is_rejected_by_portable_renderer(self):
        with tempfile.TemporaryDirectory() as folder:
            scene=dict(width=320,height=160,nodes=[dict(id='line',points=[[78,58],[90,58]],width=1,color='#FFFFFF')],texts=[dict(id='punctuation',value=';',x=80,y=40,width=8,size='browserRow',align='left',tone='white',maxWidth=30)],readouts=[])
            source=Path(folder)/'scene.json';target=Path(folder)/'preview.svg'
            source.write_text(json.dumps(scene))
            result=subprocess.run([sys.executable,str(ROOT/'skills/op1-design/scripts/preview_font.py'),str(source),'--svg',str(target)],text=True,capture_output=True)
            self.assertNotEqual(result.returncode,0)
            self.assertIn('too close to artwork line',result.stderr)
            self.assertFalse(target.exists())

    def test_private_renderer_rejects_public_destination_before_reading_font(self):
        result=subprocess.run([sys.executable,str(ROOT/'op1-ui/tools/render_stock.py'),'--font','/nonexistent/opfont.svg','--output',str(ROOT/'op1-ui/examples/renders')],text=True,capture_output=True)
        self.assertNotEqual(result.returncode,0)
        self.assertIn('must stay in ignored output',result.stderr)
        self.assertNotIn('No such file',result.stderr)
