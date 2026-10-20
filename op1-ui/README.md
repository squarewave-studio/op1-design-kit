# OP-1 UI

A draft design kit for the **original OP-1**, made by SquareWave Studio based on
community sources and a review of the stock user interface.

Use the screen examples to work out what your instrument should show and how
its controls should feel. The kit covers stock-derived text sizes, encoder
colours, layout and practical graphics advice. Adapt it to your instrument and
share what you learn. Version **0.1.0 is a draft**; it is not a TE specification.

![Original Membrane instrument concept](examples/renders/membrane-rest.png)

*Original artwork rendered with a local stock OP-1 font. The font file and glyph vectors are not included. Host spacing is approximate.*

## Start Here

- [Design](docs/DESIGN.md): hierarchy, stock-derived typography profiles, colours and margins.
- [Layout And Grid](docs/DESIGN.md#layout-and-grid): flexible construction grid, spacing, alignment and fitting complete readouts.
- [Patterns And Screen Examples](docs/EXAMPLES.md): composition studies and original applications.
- [Screen Families](docs/STOCK.md): design language across the original OP-1.
- [Icons](docs/ICONS.md): stock symbol IDs, meanings, local loading and original icon design.
- [Fonts](docs/FONTS.md): where to get `opfont.svg`, stock IDs, glyph checks and host loading.
- [Graphics](docs/GRAPHICS.md): restricted SVG, named blocks, smooth edges and CPU cost.
- [Components](docs/COMPONENTS.md): APIs, layouts and runtime binding contracts.
- [Sources](docs/SOURCES.md): community links and licence notes.
- [Agent Skill](../skills/op1-design/SKILL.md): portable, self-contained instructions.

See the kit in a real instrument: [GIN](https://github.com/squarewave-studio/op1-mods/tree/main/mods/gin).

## Read The Kit

Start with the Spec, Font and Graphics guidance above. The Pages site presents
static component renders and the same rules as the portable skill. You do not
need a stock font to read or use the design guidance.

An optional local workbench is included for component developers:

```sh
python3 op1-ui/tools/preview.py
# Open http://127.0.0.1:8765/op1-ui/workbench.html
```

It starts in labelled schematic-font mode. If you need faithful typography,
choose your own `opfont.svg` with the file picker. The browser reads it on your
machine and uploads nothing. The kit does not serve TE assets.

The workbench's Play and Edit layouts demonstrate components.
They are not a synth backend. The main Pages site is static guidance.

## Use A Component

```js
import { scene, parameter, softKeys, renderSvg, validateScene } from './op1-ui/src/components.mjs';
const screen = scene();
parameter(screen, {
  id: 'attack', label: 'ATTACK', value: '145', unit: 'MS',
  lane: 1, x: 89, y: 82, size: 's'
});
softKeys(screen, ['EXIT', 'PREV', 'NEXT', 'NAME']);
console.log(validateScene(screen));
console.log(renderSvg(screen)); // Original schematic font only.
```

The JS implementation is a reference renderer. Use the same role names, control
maps and [JSON tokens](tokens/op1-ui.json) in Python, C or another host stack.
[C constants](include/op1_ui_tokens.h) have no SDK or firmware dependency.
See [Components](docs/COMPONENTS.md#implementation-details) for native integration details.

## Install The Skill

Install the skill in your firmware project:

```sh
npx skills add squarewave-studio/op1-design-kit
```

Select **op1-design** and your coding agent. The [Skills CLI](https://github.com/vercel-labs/skills)
supports Claude Code, Cursor, Pi and OpenCode. It pulls directly from this GitHub
repo, so a [skills.sh](https://skills.sh/) account or directory listing is not
required. See [Installation And Usage](docs/AGENT-SKILL.md).

Or copy the whole `skills/op1-design` folder into your
tool's skills directory. It follows the [Agent Skills format](https://agentskills.io/specification)
and includes its references and local font inspector. Ask it to design an
original OP-1 screen with your local stock font and stock-derived typography profiles.

[`SKILL.md`](../skills/op1-design/SKILL.md) indexes the portable references.
The maintained [Spec](../skills/op1-design/references/SPEC.md) and
[JSON rules](../skills/op1-design/references/design-kit.json) build the site
specification, public JSON and code constants. The
[creative prompts](../skills/op1-design/references/IDEATION.md) support exploring
original ideas with the user. The [verification guide](../skills/op1-design/references/VERIFICATION.md)
covers host screenshots, image inspection and the bundled font, SVG and scene
checkers. The [visual index](../skills/op1-design/references/VISUALS.md) links local image
pairs, editable schematic SVGs and state contracts. Load only the relevant files.

## Build The Site

The site uses the repo's default GitHub Pages path. Build a static preview with
Python and the pinned Markdown renderer:

```sh
python3 -m pip install Markdown==3.7
python3 op1-ui/tools/build_site.py
python3 op1-ui/tools/check_site.py
python3 op1-ui/tools/preview.py
# Open http://127.0.0.1:8765/out/pages/
```

The Pages Action tests and builds on pull requests and relevant pushes to `main`.
Deployment requires `ENABLE_DESIGN_KIT_PAGES=true`, Pages configured for GitHub
Actions and the `github-pages` environment. Manual runs default to build only.
See [Publishing](docs/PUBLISHING.md) for the setup, deployment and rollback steps.
The normal build has no private asset input. Seven credited, screen-only manual
quotations sit beside their analysis on the website, outside the portable skill. No analytics, cookies
or trackers are included.

## Check Changes

```sh
python3 op1-ui/tools/sync_tokens.py --check
python3 op1-ui/tools/sync_skill.py --check
node --test op1-ui/tests/*.test.mjs
python3 -m unittest discover -s op1-ui/tests
node op1-ui/tools/check_layout.mjs
node op1-ui/tools/export_interactions.mjs
node op1-ui/tools/export_examples.mjs
python3 op1-ui/tools/check_svg.py op1-ui/examples/*.svg
```

The SVG checker is deliberately conservative. Passing it does not qualify a
native parser, heap, screen binding, physical display or audio deadline. Public
path-text examples favour inspectability and exceed the suggested 8 KiB artwork
budget; native integrations should use their supported text service and measure
the resulting cost. No native speedup is claimed.

## Licence And Attribution

Original code, guidance, schematic alphabet and reference drawings are covered
by the repository's [MIT licence](../LICENSE). [Contributing](../CONTRIBUTING.md)
is welcome. [Third-party notices](../THIRD_PARTY.md) distinguish source references
from dependencies. No TE firmware, source code, stock font, font atlas, extracted
glyph geometry or extracted stock screen artwork is distributed in this kit.
Selected manual illustrations accompany design criticism and review, with
source notices and an explicit exclusion from MIT. OP-1 and
Teenage Engineering are their owners' trademarks; this is independent community work.
