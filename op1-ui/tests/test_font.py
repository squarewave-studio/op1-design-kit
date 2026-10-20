import importlib.util
from pathlib import Path
import tempfile
import unittest

SPEC = importlib.util.spec_from_file_location('font_inspect', Path(__file__).resolve().parents[1] / 'tools/inspect_font.py')
MODULE = importlib.util.module_from_spec(SPEC); SPEC.loader.exec_module(MODULE)

class FontInventory(unittest.TestCase):
    def test_ids_only_without_geometry_or_external_dtd(self):
        # Entirely invented fixture. External declaration must not be resolved.
        fixture = '<!DOCTYPE svg SYSTEM "https://invalid.example/font.dtd"><svg xmlns="http://www.w3.org/2000/svg"><g id="a"/><g id="D"/><g id="_x23_"/><g id="_x30_"/></svg>'
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / 'invented.svg'; path.write_text(fixture)
            result = MODULE.inventory(path)
        self.assertEqual(result['text_letters'], 'A')
        self.assertEqual(result['icon_ids_not_text'], ['D'])
        self.assertEqual(result['punctuation'], ['#'])
        self.assertEqual(result['digits'], '0')
        self.assertNotIn('geometry', result)

if __name__ == '__main__': unittest.main()
