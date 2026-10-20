#!/usr/bin/env python3
"""Check built local links, page metadata and the public asset boundary."""
import argparse
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit, urljoin

class Links(HTMLParser):
    def __init__(self): super().__init__(); self.links = []; self.ids = set(); self.descriptions = []
    def handle_starttag(self, tag, attrs):
        data = dict(attrs)
        if data.get('id'): self.ids.add(data['id'])
        if tag == 'meta' and data.get('name') == 'description': self.descriptions.append(data.get('content', ''))
        for name, value in attrs:
            if name in {'href', 'src'} and value: self.links.append(value)

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('folder', type=Path, nargs='?', default=Path('out/pages'))
    parser.add_argument('--local-manual-references', action='store_true', help=argparse.SUPPRESS)
    args = parser.parse_args()
    root = args.folder.resolve(); errors = []
    for path in root.rglob('*'):
        if path.is_file() and (path.name.lower() in {'opfont.svg', 'kerntable.db', 'colors.svg', 'agents.md', 'claude.md'} or path.name.endswith('.private.inc') or path.suffix.lower() in {'.pyc','.pyo'}):
            errors.append(f'Forbidden asset: {path.relative_to(root)}')
        if path.is_file() and path.suffix.lower() in {'.png','.jpg','.svg'} and path.is_relative_to(root/'skills') and path.name in {'fm.png','string.png','digital.png','dbox.png','envelope.png','mixer.png','tempo.png'}:
            errors.append(f'Manual quotation must stay outside skill: {path.relative_to(root)}')
    # Quotations are website-only and limited to the reviewed screen excerpts.
    import json, struct
    quotes=json.loads((root/'references/manual/quotations.json').read_text())
    names={q['file'] for q in quotes.values()}
    for path in (root/'references/manual').glob('*.png'):
        if path.name not in names or struct.unpack('>II',path.read_bytes()[16:24])[0]>802:
            errors.append(f'Unexpected or oversized manual quotation: {path.name}')
    descriptions = set(); navigation = None
    for path in root.glob('*.html'):
        body = path.read_text(); links = Links(); links.feed(body)
        for link in links.links:
            url = urlsplit(link)
            published=urlsplit(urljoin('https://squarewave-studio.github.io/op1-design-kit/'+path.name,link))
            if published.netloc!='squarewave-studio.github.io': continue
            if not published.path.startswith('/op1-design-kit/'):
                errors.append(f'{path.name}: link escapes Pages base path: {link}'); continue
            target=(root/unquote(published.path.removeprefix('/op1-design-kit/'))).resolve()
            url=published
            if not target.is_relative_to(root) or not target.exists(): errors.append(f'{path.name}: missing local link {link}')
            elif url.fragment and target.suffix == '.html':
                target_links = Links(); target_links.feed(target.read_text())
                if unquote(url.fragment) not in target_links.ids: errors.append(f'{path.name}: missing anchor {link}')
        if len(links.descriptions) != 1 or links.descriptions[0] in descriptions: errors.append(f'{path.name}: missing or repeated meta description')
        descriptions.update(links.descriptions)
        import re
        is_home=path.name=='index.html'
        nav = re.search(r'<nav class="'+('masthead-actions' if is_home else 'kit-nav')+r'"[^>]*>(.*?)</nav>', body, re.S)
        if not nav: errors.append(f'{path.name}: missing shared navigation')
        elif not is_home:
            normalised=re.sub(r' aria-current="page"','',nav[1])
            if navigation is None: navigation=normalised
            elif normalised!=navigation: errors.append(f'{path.name}: inconsistent navigation')
            if body.count('aria-current="page"')!=2: errors.append(f'{path.name}: missing current-page state')
        manual_images=[link for link in links.links if link.startswith('references/manual/') and link.endswith('.png')]
        if manual_images and (path.name not in {'examples.html','spec.html'} or 'op-patchstudio' in body or 'buy.squarewave.studio' in body):
            errors.append(f'{path.name}: quotation outside analysis-only pages')
        for marker in ('Edit this page on GitHub', 'Maintained by', '<title>', 'name="description"', 'og:image', 'MIT Licence', 'Contributing', 'Unofficial. Not affiliated with, authorised by or endorsed by Teenage Engineering AB.'):
            if marker not in body: errors.append(f'{path.name}: missing {marker}')
    if errors: parser.exit(1, '\n'.join(errors) + '\n')
    print('Site links, metadata, footer and asset boundary pass')

if __name__ == '__main__': main()
