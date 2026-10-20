import json
from pathlib import Path
import re
import shutil
import subprocess
import tempfile
import unittest

ROOT=Path(__file__).resolve().parents[2]/'skills/op1-design'

class PortableSkillTests(unittest.TestCase):
    def test_local_reference_links_resolve_inside_package(self):
        for path in ROOT.rglob('*.md'):
            for link in re.findall(r'\]\(([^)]+)\)',path.read_text()):
                if '://' in link or link.startswith('#'): continue
                target=(path.parent/link.split('#')[0]).resolve()
                self.assertTrue(target.is_relative_to(ROOT.resolve()),(path,link))
                self.assertTrue(target.exists(),(path,link))

    def test_visual_contracts_have_complete_local_state_pairs(self):
        root=ROOT/'references/visuals'
        data=json.loads((root/'examples.json').read_text())
        seen=set()
        for pattern in data['patterns']:
            self.assertTrue(pattern['fixed'] and pattern['changes'] and pattern['checks'])
            self.assertGreaterEqual(len(pattern['states']),2)
            for state in pattern['states']:
                self.assertNotIn(state['id'],seen);seen.add(state['id'])
                for field in ('png','svg'): self.assertTrue((root/state[field]).is_file())
                self.assertEqual((root/state['png']).read_bytes()[:8],b'\x89PNG\r\n\x1a\n')
                self.assertFalse(re.search(r'<(?:text|use|image)\b',(root/state['svg']).read_text()))

    def test_manual_quotations_are_not_packaged_with_skill(self):
        for path in ROOT.rglob('*'):
            if path.is_file():
                self.assertNotIn(path.name, {'fm.png','string.png','digital.png','dbox.png','envelope.png','mixer.png','tempo.png'})
        for path in ROOT.rglob('*.md'):
            self.assertNotRegex(path.read_text(), r'!\[[^\]]*\]\([^)]*(?:manual/|teenage\.engineering)')

    def test_installed_tools_run_without_the_repository(self):
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder)/'installed-skill'
            shutil.copytree(ROOT,root)
            scene=root/'references/visuals/formats-first.json'
            svg=root/'references/visuals/motion-rest.svg'
            font=Path(folder)/'invented-font.svg'
            font.write_text('<svg xmlns="http://www.w3.org/2000/svg"><g id="a"/><g id="_x30_"/><g id="_x23_"/></svg>')
            commands=[['node',str(root/'scripts/check_scene.mjs'),str(scene)],
                      ['python3',str(root/'scripts/check_svg.py'),str(svg)],
                      ['python3',str(root/'scripts/inspect_font.py'),str(font),'--text','A0#']]
            for command in commands:
                result=subprocess.run(command,cwd=folder,capture_output=True,text=True)
                self.assertEqual(result.returncode,0,result.stderr)
            module=json.dumps((root/'scripts/check_scene.mjs').as_uri())
            result=subprocess.run(['node','--input-type=module','-'],input=f'import {{checkScene}} from {module}; console.log(checkScene({{width:320,height:160,nodes:[],texts:[]}}));',cwd=folder,capture_output=True,text=True)
            self.assertEqual(result.returncode,0,result.stderr)
            bad=Path(folder)/'bad.json'
            bad.write_text('{"width":320,"height":160,"nodes":[],"texts":[{"id":"wrong","value":"TUNE","x":310,"y":20,"width":20,"size":"browserRow"}]}')
            result=subprocess.run(['node',str(root/'scripts/check_scene.mjs'),str(bad)],cwd=folder,capture_output=True,text=True)
            self.assertNotEqual(result.returncode,0)
            self.assertIn('content guide',result.stderr)
