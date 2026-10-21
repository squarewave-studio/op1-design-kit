#!/usr/bin/env python3
"""Build human-facing guides from shared technical references and sync portable tools."""
import argparse
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

def outputs():
    skill = ROOT / 'skills/op1-design'
    result = {}
    result[ROOT / 'op1-ui/tools/requirements-preview.txt'] = (skill / 'scripts/requirements-preview.txt').read_text()
    # Share design guidance only. LOCAL-RESOURCES, IDEATION and VERIFICATION
    # remain agent workflows, linked through SKILL.md rather than made into pages.
    for name in ('PREVIEW-FONT', 'FONTS', 'ICONS', 'GRAPHICS', 'SOURCES', 'STOCK'):
        body=(skill / f'references/{name}.md').read_text()
        body=body.replace('(visuals/', '(../../skills/op1-design/references/visuals/')
        for reference in ('VISUALS','IDEATION','VERIFICATION','PREVIEW-FONT'):
            body=body.replace(f'({reference}.md)', f'(../../skills/op1-design/references/{reference}.md)')
            body=body.replace(f'({reference}.md#', f'(../../skills/op1-design/references/{reference}.md#')
        if name=='SOURCES':
            body+='\n'+(ROOT/'op1-ui/references/manual/CREDITS.md').read_text()+'\n'+(ROOT/'op1-ui/references/COMMUNITY.md').read_text()
        result[ROOT / f'op1-ui/docs/{name}.md'] = body
    result[ROOT / 'op1-ui/docs/EXAMPLES.md'] = (skill / 'references/PATTERNS.md').read_text().replace('https://squarewave-studio.github.io/op1-design-kit/examples/', '../examples/')
    for name in ('inspect_font.py','check_svg.py'):
        result[skill / 'scripts' / name] = (ROOT / 'op1-ui/tools' / name).read_text()
    result[skill / 'scripts/check_scene.mjs'] = (ROOT / 'op1-ui/tools/check_scene.mjs').read_text().replace("'../src/","'./lib/")
    for name in ('layout.mjs','tokens.mjs'):
        result[skill / 'scripts/lib' / name] = (ROOT / 'op1-ui/src' / name).read_text()
    return result

def main():
    parser = argparse.ArgumentParser(description=__doc__); parser.add_argument('--check', action='store_true'); args = parser.parse_args()
    stale = []
    for path, body in outputs().items():
        if args.check:
            if not path.exists() or path.read_text() != body: stale.append(str(path.relative_to(ROOT)))
        else: path.parent.mkdir(parents=True, exist_ok=True); path.write_text(body)
    if stale: parser.exit(1, 'Stale derived files: ' + ', '.join(stale) + '\n')
    print('Derived documentation matches the skill' if args.check else 'Built site references and portable checkers')

if __name__ == '__main__': main()
