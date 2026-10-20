import importlib.util
import tempfile
import unittest
from pathlib import Path

SPEC = importlib.util.spec_from_file_location('svg_check', Path(__file__).resolve().parents[1] / 'tools/check_svg.py')
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)

class SvgChecks(unittest.TestCase):
    def check(self, body):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / 'case.svg'
            path.write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 160">' + body + '</svg>')
            return MODULE.check(path)[0]

    def test_explicit_commands(self):
        self.assertEqual(self.check('<path d="M 1,2 L 3,4 L 5,6" fill="none" stroke="#ffffff"/>'), [])
        self.assertTrue(self.check('<path d="M 1,2 L 3,4 5,6" fill="none" stroke="#ffffff"/>'))

    def test_browser_only_features_and_precision(self):
        for body in ['<text>OK</text>', '<g transform="translate(2,3)"/>',
                     '<circle cx="2.12345" cy="3" r="1" fill="none" stroke="#ffffff"/>',
                     '<path d="M 1,2 Q 3,4 5,6" fill="none" stroke="#ffffff"/>']:
            with self.subTest(body=body): self.assertTrue(self.check(body))

    def test_disconnected_fill_and_duplicate_ids(self):
        self.assertTrue(self.check('<path d="M 1,2 L 3,4 z M 5,6 L 7,8 z" fill="#ffffff" stroke="#ffffff"/>'))
        self.assertTrue(self.check('<path d="M 1,2 L 3,4 M 5,6 L 7,8" fill="none" stroke="#ffffff"/>'))
        self.assertTrue(self.check('<g id="same"/><g id="same"/>'))

if __name__ == '__main__': unittest.main()
