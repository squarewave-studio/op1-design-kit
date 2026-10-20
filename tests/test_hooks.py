"""The tracked hook installer must work in clones and linked worktrees."""
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest

SOURCE = Path(__file__).resolve().parents[1] / '.githooks'


class HookInstallTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name) / 'repo'
        self.root.mkdir()
        self.run_at(self.root, 'git', 'init', '-q')
        hooks = self.root / '.githooks'
        (hooks / 'checks').mkdir(parents=True)
        for name in ['install.mjs', 'pre-commit']:
            shutil.copy2(SOURCE / name, hooks / name)
        (hooks / 'checks/pre-commit').write_text('echo own >> hook.log\n')

    def run_at(self, root, *args, check=True):
        env = {**os.environ, 'GIT_CONFIG_NOSYSTEM': '1', 'GIT_CONFIG_GLOBAL': os.devnull}
        result = subprocess.run(args, cwd=root, env=env, capture_output=True, text=True)
        if check:
            self.assertEqual(result.returncode, 0, result.stderr + result.stdout)
        return result

    def install(self, root=None):
        return self.run_at(root or self.root, 'node', '.githooks/install.mjs')

    def commit(self, root=None):
        return self.run_at(root or self.root, 'git', '-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '--allow-empty', '-qm', 'fixture')

    def test_migrates_husky_and_installs_idempotently(self):
        self.run_at(self.root, 'git', 'config', 'core.hooksPath', '.husky/_')
        self.install()
        self.install()
        self.assertEqual(self.run_at(self.root, 'git', 'config', '--get', 'core.hooksPath', check=False).returncode, 1)
        self.commit()
        self.assertEqual((self.root / 'hook.log').read_text(), 'own\n')

    def test_preserves_and_runs_an_existing_hook(self):
        hook = self.root / '.git/hooks/pre-commit'
        hook.write_text('#!/usr/bin/env python3\nfrom pathlib import Path\nwith Path("hook.log").open("a") as f: f.write("foreign\\n")\n')
        hook.chmod(0o755)
        self.install()
        self.install()
        self.assertIn('foreign', hook.with_suffix('.local').read_text())
        self.commit()
        self.assertEqual((self.root / 'hook.log').read_text(), 'own\nforeign\n')

    def test_leaves_an_unrelated_hooks_configuration_intact(self):
        self.run_at(self.root, 'git', 'config', 'core.hooksPath', '.other-hooks')
        result = self.run_at(self.root, 'node', '.githooks/install.mjs', check=False)
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(self.run_at(self.root, 'git', 'config', '--get', 'core.hooksPath').stdout.strip(), '.other-hooks')

    def test_shared_dispatcher_runs_the_linked_worktrees_checks(self):
        self.install()
        self.run_at(self.root, 'git', 'add', '--', '.githooks')
        self.commit()
        linked = self.root.parent / 'linked'
        self.run_at(self.root, 'git', 'worktree', 'add', '-qb', 'linked', str(linked))
        (linked / '.githooks/checks/pre-commit').write_text('echo linked >> hook.log\n')
        self.install(linked)
        self.commit(linked)
        self.assertEqual((linked / 'hook.log').read_text(), 'linked\n')
        self.assertEqual((self.root / 'hook.log').read_text(), 'own\n')

    def test_legacy_branch_checks_still_run_after_migration(self):
        self.install()
        self.run_at(self.root, 'git', 'add', '--', '.githooks')
        self.commit()
        linked = self.root.parent / 'legacy'
        self.run_at(self.root, 'git', 'worktree', 'add', '-qb', 'legacy', str(linked))
        (linked / '.githooks/checks/pre-commit').unlink()
        (linked / '.githooks/pre-commit').write_text('#!/bin/sh\necho legacy >> hook.log\n')
        self.commit(linked)
        self.assertEqual((linked / 'hook.log').read_text(), 'legacy\n')

    def test_missing_checks_fail_closed(self):
        self.install()
        (self.root / '.githooks/checks/pre-commit').unlink()
        result = self.run_at(self.root, 'git', '-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '--allow-empty', '-qm', 'blocked', check=False)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('no supported checks', result.stderr)

    def test_non_executable_foreign_hook_stays_ignored(self):
        hook = self.root / '.git/hooks/pre-commit'
        hook.write_text('#!/bin/sh\nexit 1\n')
        hook.chmod(0o644)
        self.install()
        self.commit()
        self.assertEqual((self.root / 'hook.log').read_text(), 'own\n')
