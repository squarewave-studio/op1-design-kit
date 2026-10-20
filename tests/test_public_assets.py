"""Exercise the staged boundary with disposable Git repositories and invented bytes."""
import os
from pathlib import Path
import subprocess
import tempfile
import unittest

CHECK = Path(__file__).resolve().parents[1] / 'tools/check_public_assets.py'


class PublicAssetsTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.git('init', '-q')

    def git(self, *args):
        return subprocess.check_output(['git', *args], cwd=self.root)

    def stage(self, name, data=b'original public content'):
        path = self.root / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)
        self.git('add', '-f', '--', name)
        return path

    def check(self, *args):
        return subprocess.run(['python3', str(CHECK), *args], cwd=self.root, capture_output=True)

    def test_original_sources_and_documentation_pass(self):
        self.stage('docs/firmware.md', b'Do not distribute opfont.svg or firmware.op1')
        self.stage('examples/screen.svg', b'<svg><path d="M 1 2 L 3 4"/></svg>')
        self.assertEqual(self.check().returncode, 0)

    def test_case_and_unusual_paths_cannot_bypass_guard(self):
        for name in ['build/Update.OP1', 'one\n two.op1p', 'OPFONT.SVG', 'nested/AGENTS.md', 'firmware/readme.txt', 'dump.nand', 'atlas-font-atlas.png']:
            with self.subTest(name=name):
                self.stage(name)
                self.assertNotEqual(self.check().returncode, 0)
                self.git('rm', '--cached', '-f', '--', name)

    def test_forced_ignored_file_is_checked(self):
        self.stage('.gitignore', b'*.op1\n')
        self.stage('update.op1')
        self.assertNotEqual(self.check().returncode, 0)

    def test_staged_bytes_are_used_instead_of_working_tree(self):
        path = self.stage('renamed.dat', b'\x7fELF invented fixture')
        path.write_bytes(b'harmless unstaged replacement')
        self.assertNotEqual(self.check().returncode, 0)

    def test_svg_font_and_symlink_are_rejected(self):
        self.stage('renamed.svg', b'<svg><font id="invented"/></svg>')
        self.assertNotEqual(self.check().returncode, 0)
        self.git('rm', '--cached', '-f', 'renamed.svg')
        os.symlink('/nonexistent/private/input', self.root / 'external')
        self.git('add', 'external')
        self.assertNotEqual(self.check().returncode, 0)

    def test_all_checks_already_committed_files_and_deletion_is_allowed(self):
        self.stage('legacy.op1')
        self.git('-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', '-c', 'core.hooksPath=/dev/null', 'commit', '-qm', 'fixture')
        self.assertEqual(self.check().returncode, 0)
        self.assertNotEqual(self.check('--all').returncode, 0)
        self.git('rm', 'legacy.op1')
        self.assertEqual(self.check().returncode, 0)
