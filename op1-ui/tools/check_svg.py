#!/usr/bin/env python3
"""Conservative source check for the kit's native SVG profile, not device qualification."""
import argparse
import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

TAGS = {'svg', 'g', 'path', 'rect', 'line', 'circle', 'polyline'}
ATTRS = {'id', 'version', 'width', 'height', 'viewBox', 'x', 'y', 'x1', 'y1', 'x2', 'y2',
         'cx', 'cy', 'r', 'd', 'points', 'fill', 'stroke', 'stroke-width'}
NUM = r'-?(?:\d+(?:\.\d+)?|\.\d+)'
NUMERIC = {'width', 'height', 'viewBox', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'cx', 'cy', 'r', 'stroke-width', 'points', 'd'}

def check(path):
    raw = Path(path).read_bytes()
    errors, warnings, ids = [], [], set()
    if b'<!DOCTYPE' in raw.upper() or b'<!ENTITY' in raw.upper(): return ['DTD/entities are outside this profile'], []
    try: root = ET.fromstring(raw)
    except ET.ParseError as exc: return [f'Invalid XML: {exc}'], []
    if root.tag != '{http://www.w3.org/2000/svg}svg': errors.append('Expected an SVG-namespace root')
    if root.get('viewBox') != '0 0 320 160': errors.append('Expected viewBox="0 0 320 160"')
    for node in root.iter():
        tag = node.tag.removeprefix('{http://www.w3.org/2000/svg}')
        if tag not in TAGS: errors.append(f'Unsupported element: {tag}')
        for attr, value in node.attrib.items():
            if attr not in ATTRS: errors.append(f'{tag}: unsupported attribute {attr}; flatten transforms and paint')
            if attr in NUMERIC:
                for number in re.findall(NUM, value):
                    if '.' in number and len(number.split('.')[1]) > 4: errors.append(f'{tag}.{attr}: more than four decimals')
                # Commands M/L/C/z only; exponent e/E is consequently rejected too.
                allowed = NUM + (r'|[MLCzZ\s,]' if attr == 'd' else r'|[\s,]')
                if re.sub(allowed, '', value): errors.append(f'{tag}.{attr}: unsupported numeric/path syntax')
            if attr in {'stroke', 'fill'} and value != 'none' and not re.fullmatch(r'#[0-9a-fA-F]{6}', value):
                errors.append(f'{tag}.{attr}: use explicit #rrggbb or none')
        if node.get('id'):
            if node.get('id') in ids: errors.append('Duplicate ID: ' + node.get('id'))
            ids.add(node.get('id'))
        if tag not in {'svg', 'g'}:
            if 'fill' not in node.attrib: errors.append(f'{tag}: explicit fill required')
            if tag != 'rect' and 'stroke' not in node.attrib: errors.append(f'{tag}: explicit stroke required')
        if tag == 'path':
            d = node.get('d', '')
            commands = list(re.finditer(r'([MLCzZ])([^MLCzZ]*)', d))
            if not commands or commands[0].group(1) != 'M': errors.append('Path must start with explicit M')
            for command in commands:
                op, numbers = command.group(1), re.findall(NUM, command.group(2))
                expected = {'M': 2, 'L': 2, 'C': 6, 'z': 0, 'Z': 0}[op]
                if len(numbers) != expected: errors.append(f'Path {op}: needs exactly {expected} coordinates; repeat command letters')
            if sum(c.group(1) == 'M' for c in commands) > 1:
                errors.append('Split disconnected contours into separate paths')
    if len(raw) > 8192: warnings.append(f'{len(raw)} bytes exceeds the 8 KiB artwork target; measure native cost (not a loader limit)')
    return sorted(set(errors)), warnings

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('files', nargs='+', type=Path)
    args = parser.parse_args(); failures = 0
    for path in args.files:
        errors, warnings = check(path)
        for message in errors: print(f'ERROR {path}: {message}', file=sys.stderr)
        for message in warnings: print(f'NOTE {path}: {message}')
        if not errors: print(f'PASS {path}: conservative source profile only')
        failures += bool(errors)
    return bool(failures)

if __name__ == '__main__': sys.exit(main())
