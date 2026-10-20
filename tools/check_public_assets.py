#!/usr/bin/env python3
"""Reject private resources from Git's index, including forced ignored files."""
import argparse
from pathlib import PurePosixPath
import subprocess
import sys

FORBIDDEN_NAMES = {'opfont.svg', 'kerntable.db', 'colors.svg', 'agents.md', 'claude.md'}
FORBIDDEN_SUFFIXES = {'.op1', '.op1p', '.knl', '.ldr', '.elf', '.o', '.bin', '.nand', '.otp', '.op1font.json', '.private.inc'}
FORBIDDEN_DIRS = {'firmware', '.private', '.work', 'node_modules'}


def git(*args):
    return subprocess.check_output(['git', *args])


def reason(path, data, mode):
    name = path.name.lower()
    if name in FORBIDDEN_NAMES or any(name.endswith(s) for s in FORBIDDEN_SUFFIXES):
        return 'private resource or compiled binary filename'
    if any(p.lower() in FORBIDDEN_DIRS for p in path.parts[:-1]) or 'font-atlas' in name:
        return 'private resource directory or font atlas'
    if mode == '120000':
        return 'symlink (keep public assets self-contained)'
    if data.startswith(b'\x7fELF'):
        return 'ELF binary, regardless of filename'
    if path.suffix.lower() == '.svg' and b'<font' in data.lower():
        return 'SVG font data (font resources must remain local)'
    return None


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--all', action='store_true', help='check every tracked index entry, not only staged changes')
    args = parser.parse_args()
    selected = None if args.all else set(git('diff', '--cached', '--name-only', '--diff-filter=ACMRT', '-z').split(b'\0'))
    errors = []
    for entry in git('ls-files', '--stage', '-z').split(b'\0'):
        if not entry:
            continue
        meta, raw_path = entry.split(b'\t', 1)
        mode, oid, stage = meta.decode().split()
        if selected is not None and raw_path not in selected:
            continue
        path = PurePosixPath(raw_path.decode('utf-8', 'surrogateescape'))
        if stage != '0':
            errors.append(f'{str(path)!r}: unresolved merge')
            continue
        problem = reason(path, git('cat-file', 'blob', oid), mode)
        if problem:
            errors.append(f'{str(path)!r}: {problem}')
    for error in errors:
        print(f'Public asset check: {error}', file=sys.stderr)
    if errors:
        return 1
    print('Public asset check passed (Git index).')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
