#!/usr/bin/env python3
"""Build the static design kit. Requires Markdown 3.7; no private asset inputs."""
import argparse
import html
import json
from pathlib import Path
import re
import shutil
import markdown

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'op1-ui'
BASE = 'https://squarewave-studio.github.io/op1-design-kit/'
REPO = 'https://github.com/squarewave-studio/op1-design-kit/blob/main/'
MANUAL = 'https://teenage.engineering/_img/54b7f9bf8681400300255cab_original.pdf'
MANUAL_REFERENCES = {'fm':('FM',42),'string':('String',41),'digital':('Digital',41),'dbox':('DBOX',16),'envelope':('Synth Envelope',12),'mixer':('Mixer',25),'tempo':('Tempo',27)}
SHARE_IMAGE = 'og-design-kit.png'
SHARE_ALT = 'OP-1 Design Kit by SquareWave Studio, with Blue, Green, White and Orange encoder marks.'

def share_metadata():
    return f'<meta property="og:image" content="{BASE}{SHARE_IMAGE}"><meta property="og:image:type" content="image/png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="{SHARE_ALT}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="{BASE}{SHARE_IMAGE}"><meta name="twitter:image:alt" content="{SHARE_ALT}">'

DISCLAIMER = 'Unofficial. Not affiliated with, authorised by or endorsed by Teenage Engineering AB.'
FOOTER = f'''<footer><p>Maintained by <a href="https://squarewave.studio/?utm_source=op1-design-kit&amp;utm_medium=referral&amp;utm_campaign=op1-design-kit">SquareWave Studio</a> with the OP-1 community.</p><p>{DISCLAIMER}</p><p><a href="licence.html">MIT Licence</a> · <a href="contributing.html">Contributing</a> · <a href="https://github.com/squarewave-studio/op1-design-kit">GitHub</a></p></footer>'''

PAGES = {'start.html': ('Start Building', SOURCE / 'README.md'),
         'spec.html': ('Spec', SOURCE / 'docs/DESIGN.md'),
         'fonts.html': ('Fonts And Previews', SOURCE / 'docs/FONTS.md'),
         'preview-font.html': ('Host Preview Font', SOURCE / 'docs/PREVIEW-FONT.md'),
         'icons.html': ('Icons And Symbols', SOURCE / 'docs/ICONS.md'),
         'graphics.html': ('Graphics And CPU', SOURCE / 'docs/GRAPHICS.md'),
         'components.html': ('Components', SOURCE / 'docs/COMPONENTS.md'),
         'stock.html': ('Stock Screen Families', SOURCE / 'docs/STOCK.md'),
         'examples.html': ('Patterns And Screen Examples', SOURCE / 'docs/EXAMPLES.md'),
         'agents.html': ('For Agents', SOURCE / 'docs/AGENT-SKILL.md'),
         'credits.html': ('Sources And Credits', SOURCE / 'docs/SOURCES.md'),
         'contributing.html': ('Contributing', ROOT / 'CONTRIBUTING.md'),
         'licence.html': ('MIT Licence', ROOT / 'LICENSE')}

DOC_GROUPS = [
    ('Start', [('start.html','Start Building')]),
    ('Foundations', [('spec.html','Spec'),('spec.html#typography-from-the-original-op-1','Typography'),('spec.html#four-encoder-lanes','Encoder Colours'),('spec.html#coordinates-and-the-window','Canvas And Clearance'),('spec.html#layout-and-grid','Layout And Grid')]),
    ('Patterns', [('stock.html','Stock Screen Families'),('examples.html','Patterns And Screen Examples')]),
    ('Components', [('components.html','Component Reference')]),
    ('Integration', [('fonts.html','Fonts And Previews'),('preview-font.html','Host Preview Font'),('icons.html','Icons And Symbols'),('graphics.html','Graphics And CPU'),('agents.html','For Agents')]),
    ('Sources', [('credits.html','Credits'),('contributing.html','Contributing'),('licence.html','MIT Licence')])]
READING_ORDER = ['start.html','stock.html','examples.html','spec.html','components.html','fonts.html','preview-font.html','icons.html','graphics.html','agents.html','credits.html','contributing.html','licence.html']
DESCRIPTIONS = {
    'Start Building': 'Use the OP-1 Design Kit to build readable synth, effect and utility screens with original graphics.',
    'Spec': 'Text roles, encoder colours, layout clearances and alignment rules for original OP-1 screens.',
    'Patterns And Screen Examples': 'Learn OP-1 design language through composition studies and original instrument examples in several states.',
    'Fonts And Previews': 'Use the bundled Iosevka preview font and check stock lettering privately with your own local OP-1 font.',
    'Host Preview Font': 'Load the bundled Iosevka fonts, apply its digit variants and measure text in host previews.',
    'Icons And Symbols': 'Stock symbol IDs, icon loading and clear original icon design for original OP-1 interfaces.',
    'Graphics And CPU': 'Use expressive vector graphics, retained blocks and meaningful motion within an instrument’s graphics budget.',
    'Components': 'Use the kit’s layout, text and vector helpers with clear native integration contracts.',
    'Stock Screen Families': 'Explore the design relationships behind OP-1 instruments, effects, sequencers and utility screens.',
    'Sources And Credits': 'Community sources behind the kit’s typography, graphics and design guidance, with licence notes.',
    'Contributing': 'Suggest a pattern, improve an example or contribute a tested change to the OP-1 Design Kit.',
    'MIT Licence': 'MIT licence for the original code and guidance by Photon Consulting Limited, trading as SquareWave Studio.',
    'For Agents': 'Install the portable op1-design skill and use the shared rules and design-kit.json in your project.'
}
def masthead():
    return '<header class="masthead"><div class="kit-identity"><a class="kit-title" href="index.html">OP-1 Design Kit</a><a class="kit-maintainer" href="https://squarewave.studio/?utm_source=op1-design-kit&amp;utm_medium=referral&amp;utm_campaign=op1-design-kit"><span>by</span><img src="assets/squarewave-mark.svg" width="18" height="18" alt=""><span>SquareWave Studio</span></a></div><nav class="masthead-actions" aria-label="Project"><span class="kit-version">v0.2 · DRAFT</span><a href="contributing.html">Contribute</a><span class="github-links"><a href="https://github.com/squarewave-studio/op1-design-kit">GitHub ↗</a><a class="github-stars" data-github-stars href="https://github.com/squarewave-studio/op1-design-kit/stargazers" aria-label="View GitHub Stargazers"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z"/></svg><span data-star-count>Star</span></a></span><button class="theme-toggle" data-theme-toggle type="button" aria-label="Switch To Light Mode" title="Switch To Light Mode" hidden><svg class="theme-sun" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5"/></svg><svg class="theme-moon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M20.5 14A9 9 0 0 1 10 3.5 9 9 0 1 0 20.5 14Z"/></svg></button></nav></header>'

def edit_link(current):
    source=PAGES[current][1].relative_to(ROOT) if current in PAGES else Path('skills/op1-design/SKILL.md')
    reference={'DESIGN':'SPEC','EXAMPLES':'PATTERNS','FONTS':'FONTS','PREVIEW-FONT':'PREVIEW-FONT','ICONS':'ICONS','GRAPHICS':'GRAPHICS','STOCK':'STOCK','SOURCES':'SOURCES'}.get(source.stem)
    if reference: source=Path('skills/op1-design/references')/(reference+'.md')
    return f'<p class="edit-link"><a href="https://github.com/squarewave-studio/op1-design-kit/edit/main/{source}">Edit this page on GitHub</a></p>'

def documentation_navigation(current):
    groups=[]
    for label,items in DOC_GROUPS:
        links=''.join(f'<a href="{url}"'+(' aria-current="page"' if current==url else '')+f'>{html.escape(text)}</a>' for url,text in items)
        groups.append(f'<section><h2>{label}</h2>{links}</section>')
    return '<nav class="kit-nav" aria-label="Design Kit Contents">'+''.join(groups)+'</nav>'

def page_contents(body):
    headings=re.findall(r'<h2 id="([^"]+)">(.*?)</h2>',body,re.S)
    if len(headings)<3: return ''
    links=''.join(f'<li><a href="#{id}">{html.escape(re.sub("<[^>]*>","",title))}</a></li>' for id,title in headings)
    return f'<nav class="page-contents" aria-label="On This Page"><p>On This Page</p><ul>{links}</ul></nav>'

def reading_links(current):
    i=READING_ORDER.index(current)
    names={name:title for name,(title,_) in PAGES.items()};names['agents.html']='For Agents'
    prev=READING_ORDER[i-1] if i else None
    next=READING_ORDER[i+1] if i+1<len(READING_ORDER) else None
    return '<nav class="reading-links" aria-label="Continue Reading">'+(f'<a href="{prev}"><span>Previous</span>{names[prev]}</a>' if prev else '<span></span>')+(f'<a href="{next}"><span>Next</span>{names[next]}</a>' if next else '')+'</nav>'

def render_page(title, body, current):
    description = DESCRIPTIONS[title]
    nav=documentation_navigation(current)
    # Keep the opening text together before the local contents list.
    body=re.sub(r'(</h1>(?:\s*<p>(?!<img).*?</p>)+)',lambda m:m[1]+page_contents(body),body,count=1,flags=re.S)
    return f'''<!doctype html><html lang="en" data-theme="dark"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{html.escape(title)} · OP-1 Design Kit</title><meta name="description" content="{html.escape(description)}"><meta property="og:title" content="{html.escape(title)} · OP-1 Design Kit"><meta property="og:description" content="{html.escape(description)}">{share_metadata()}<meta property="og:type" content="website"><script src="theme-init.js"></script><link rel="stylesheet" href="preview.css"><script src="header.js" defer></script></head><body class="docs"><a class="skip-link" href="#content">Skip To Content</a>{masthead()}<details class="mobile-contents"><summary>Kit Contents</summary>{nav}</details><div class="docs-layout"><aside class="docs-sidebar">{nav}</aside><main class="document" id="content">{body}{edit_link(current)}{reading_links(current)}</main></div>{FOOTER}</body></html>'''

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, default=ROOT / 'out/pages')
    parser.add_argument('--manual-reference-dir', type=Path, help='Optional local replacements for the seven separately noticed manual quotations')
    args = parser.parse_args(); out = args.output.resolve()
    if not out.is_relative_to(ROOT / 'out') or out == ROOT / 'out':
        parser.error('Build output must be a dedicated directory below out/')
    if out.exists(): shutil.rmtree(out)
    out.mkdir(parents=True, exist_ok=True)
    for folder in ('src', 'examples', 'references', 'assets'):
        shutil.copytree(SOURCE / folder, out / folder, dirs_exist_ok=True)
    if args.manual_reference_dir:
        inputs=args.manual_reference_dir.resolve()
        if inputs.is_relative_to(ROOT): parser.error('Keep manual excerpt inputs outside the repository')
        for key in MANUAL_REFERENCES:
            shutil.copy2(inputs / (key+'.png'), out / 'references/manual' / (key+'.png'))
    for name in ('preview.css', 'index.html', 'llms.txt', 'theme-init.js', 'header.js'):
        shutil.copy2(SOURCE / name, out / name)
    home=(out / 'index.html').read_text()
    home=re.sub(r'<meta property="og:image"[^>]*>',share_metadata(),home,count=1)
    home=re.sub(r'<header class="masthead">.*?</header>',masthead(),home,flags=re.S)
    home=re.sub(r'<nav class="links".*?</nav>', '', home, flags=re.S)
    home=re.sub(r'<footer>.*?</footer>', FOOTER, home, flags=re.S)
    home=home.replace('</header>', '</header><details class="mobile-contents"><summary>Kit Contents</summary>'+documentation_navigation('index.html')+'</details>',1)
    (out / 'index.html').write_text(home)
    # Published index uses URLs relative to the Pages root, not the source folder.
    (out / 'llms.txt').write_text('''# OP-1 Design Kit\n\nDraft guidance for the original OP-1.\n\n- skills/op1-design/SKILL.md: portable skill and reference index\n- start.html: getting started\n- spec.html: typography, colours, layout and grid\n- stock.html: screen families and interaction patterns\n- examples.html: original screen studies\n- fonts.html: preview fonts and private stock-font setup\n- preview-font.html: bundled Iosevka font and host adapters\n- icons.html: symbol IDs and loading\n- graphics.html: SVG, smoothing and CPU\n- agents.html: skill installation\n- design-kit.json: machine-readable rules\n- credits.html: sources and notices\n- contributing.html: contributing and checks\n- licence.html: MIT and third-party exclusions\n\nNo firmware or stock font files are served. Iosevka is bundled under OFL.\n''')
    shutil.copy2(ROOT / 'design-kit.json', out / 'design-kit.json')
    for name in ('og.png', SHARE_IMAGE):
        shutil.copy2(SOURCE / name, out / name)
    shutil.copytree(ROOT / 'skills/op1-design', out / 'skills/op1-design', dirs_exist_ok=True, ignore=shutil.ignore_patterns('__pycache__', '*.pyc', '*.pyo'))
    page_by_source = {p.resolve(): name for name, (_, p) in PAGES.items()}
    for filename, (_, source) in PAGES.items():
        ref={'DESIGN':'SPEC','EXAMPLES':'PATTERNS'}.get(source.stem,source.stem)
        page_by_source[(ROOT/'skills/op1-design/references'/(ref+'.md')).resolve()]=filename
    def rewrite(body, source):
        quotations=json.loads((SOURCE / 'references/manual/quotations.json').read_text())
        for label,quote in quotations.items():
            caption=f"TE reference illustration, © Teenage Engineering AB. OP-1 Manual 1.2, {quote['section']}, PDF page {quote['page']}. Reference artwork is outside the kit’s MIT licence."
            replacement=f"![TE {quote['name']} reference illustration](references/manual/{quote['file']})\n\n*[{caption}]({quote['url']})*"
            body=body.replace(label,replacement)
        def link(match):
            label, target = match[1], match[2]
            if target.startswith(BASE): return f'[{label}]({target[len(BASE):]})'
            if '://' in target or target.startswith('#') or target in {'credits.html','references/manual/NOTICE.md'} or target.startswith('references/manual/'): return match[0]
            path, _, fragment = target.partition('#')
            absolute = (source.parent / path).resolve()
            if absolute == ROOT / 'design-kit.json': replacement = 'design-kit.json'
            elif absolute in page_by_source: replacement = page_by_source[absolute]
            elif absolute.is_relative_to(ROOT / 'skills/op1-design'): replacement = str(absolute.relative_to(ROOT))
            elif absolute.is_relative_to(SOURCE / 'examples'): replacement = 'examples/' + str(absolute.relative_to(SOURCE / 'examples'))
            else:
                try: replacement = REPO + str(absolute.relative_to(ROOT))
                except ValueError: replacement = target
            return f'[{label}]({replacement}' + ('#' + fragment if fragment else '') + ')'
        return re.sub(r'\[([^\]]+)\]\(([^)]+)\)', link, body)
    for filename, (title, source) in PAGES.items():
        body = source.read_text()
        if source.name == 'LICENSE': body = '# MIT Licence\n\nThe MIT licence covers original kit code and guidance. TE manual reference illustrations and the Iosevka, Inter and Archivo fonts retain their own rights and notices. See [Credits](credits.html) and the [reference notice](references/manual/NOTICE.md).\n\n```text\n' + body + '\n```'
        body = rewrite(body, source)
        result = markdown.markdown(body, extensions=['tables', 'fenced_code', 'toc'])
        result=re.sub(r'(<table>.*?</table>)',r'<div class="table-scroll" tabindex="0" role="region" aria-label="Scrollable table">\1</div>',result,flags=re.S)
        (out / filename).write_text(render_page(title, result, filename))
    # Only the allowlisted kit is copied, never the repository's .git or private inputs.
    forbidden = [p for p in out.rglob('*') if p.name.lower() in {'opfont.svg', 'kerntable.db', 'colors.svg', 'agents.md', 'claude.md'} or p.suffix.lower() in {'.op1', '.op1p', '.knl', '.elf', '.pyc', '.pyo'}]
    if forbidden: raise SystemExit('Forbidden build inputs: ' + ', '.join(str(p.relative_to(out)) for p in forbidden))
    for page in out.glob('*.html'):
        text = page.read_text()
        if DISCLAIMER not in text or 'og:image' not in text or 'name="description"' not in text: raise SystemExit(f'Missing page metadata/footer: {page}')
    print(f'Built {len(list(out.glob("*.html")))} pages in {out}')

if __name__ == '__main__': main()
