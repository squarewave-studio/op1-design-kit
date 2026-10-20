#!/usr/bin/env python3
"""Inventory a developer's local opfont.svg. Emits no glyph geometry or font data."""
import argparse
import hashlib
import json
import re
import xml.etree.ElementTree as ET
from pathlib import Path

def inventory(path):
    data = Path(path).read_bytes()
    if b'<!ENTITY' in data.upper(): raise ValueError('Entity declarations unsupported')
    cleaned = re.sub(br'<!DOCTYPE[^>\[\]]*>', b'', data, flags=re.I)
    if b'<!DOCTYPE' in cleaned.upper(): raise ValueError('DTD internal subsets unsupported')
    root = ET.fromstring(cleaned)
    ids = [node.get('id') for node in root if node.get('id')]
    decoded = {name: re.sub(r'_x([0-9a-fA-F]{2})_', lambda m: chr(int(m[1], 16)), name) for name in ids}
    return {'sha256': hashlib.sha256(data).hexdigest(),
            'text_letters': ''.join(c.upper() for c in 'abcdefghijklmnopqrstuvwxyz' if c in ids),
            'digits': ''.join(c for c in '0123456789' if c in decoded.values()),
            'punctuation': sorted(c for c in decoded.values() if len(c) == 1 and not c.isalnum()),
            'icon_ids_not_text': [c for c in decoded.values() if len(c) == 1 and c.isupper()],
            'other_ids': [name for name, c in decoded.items() if len(c) != 1],
            'transforms_present': any('transform' in n.attrib for n in root.iter())}

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('font', type=Path)
    parser.add_argument('--text', default='')
    args = parser.parse_args(); result = inventory(args.font)
    available = set(result['text_letters'] + result['digits'] + ''.join(result['punctuation']) + ' ')
    result['missing_for_text'] = sorted(set(args.text.upper()) - available)
    print(json.dumps(result, indent=2))
    if result['missing_for_text']: parser.exit(1)

if __name__ == '__main__': main()
