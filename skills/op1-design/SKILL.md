---
name: op1-design
description: Brainstorm, design and review original OP-1 synth, effect and utility screens with stock-derived composition patterns, bundled Iosevka previews, private stock-font checks and supported SVG guidance. OP-1 Field and OP-XY need separate device profiles.
license: MIT
metadata:
  author: SquareWave Studio
  version: "0.2.0"
---

# OP-1 Design Kit

A draft kit for original OP-1 screens. Start with the musical relationship the
screen explains. Use original artwork and stock-derived patterns; the kit is
not a TE specification or a catalogue of replacement stock apps.

## Load Only What The Task Needs

Use this index to choose a reference. Do not load every document or image at
once. Read the matching visual contract, then open the relevant state pair.

| Task | Reference |
| --- | --- |
| Brainstorm an original visual direction with the user | [Develop An Original Screen Idea](references/IDEATION.md) |
| Choose a composition, visual metaphor or meaningful motion | [Patterns And Screen Examples](references/PATTERNS.md) |
| Apply overview/detail, browser, focus, Shift or routing patterns | [Stock Interaction Patterns](references/STOCK.md) |
| See original examples and their state contracts | [Visual Reference Index](references/VISUALS.md) |
| Set typography, encoder colours, alignment, margins or grid | [Design Specification](references/SPEC.md) |
| Use the bundled Iosevka preview font and exact variants | [Host Preview Font](references/PREVIEW-FONT.md) |
| Set up font tools or fix a missing render dependency | [Font Tools For Agents](references/FONT-TOOLS.md) |
| Locate the user’s firmware or explain how to obtain a local stock font | [Local Stock Resources](references/LOCAL-RESOURCES.md) |
| Check stock characters, spacing or private font loading | [Fonts And Previews](references/FONTS.md) |
| Choose stock symbol IDs or design an original icon | [Icons And Symbols](references/ICONS.md) |
| Author SVG blocks, smoothing or bounded graphical updates | [Graphics And CPU](references/GRAPHICS.md) |
| Check a design, capture host evidence and report limits | [Verification](references/VERIFICATION.md) |
| Read token values and machine-readable rules | [design-kit.json](references/design-kit.json) |
| Find more stock firmware or manual examples | [Finding More Stock Examples](references/STOCK.md#finding-more-stock-examples) |
| Check attribution, source scope or licences | [Sources](references/SOURCES.md) |

The Spec, JSON and shared technical references supply the website’s design
rules and code constants. Local Resources, Ideation and Verification contain
agent workflows; they are linked from this index rather than copied into the
web guides. Visual PNGs, schematic SVGs and state data live in
`references/visuals/`; their contracts explain what stays fixed and changes.
The version above is the kit version, not a firmware compatibility promise.

## Explore With The User

For an open design brief, use [Ideation](references/IDEATION.md) to explore
sound-related metaphors and distinct compositions with the user. Treat stock
patterns as a visual vocabulary, not templates to copy. Develop an existing
choice without restarting the exploration or imposing extra approval stages.

## Apply The Kit

1. Establish the actual framework, control map and reading task. Choose a
   pattern before arranging components; four encoder colours do not require
   four visual columns.
2. Choose the font mode. Use the bundled Iosevka size-matched profile for shareable
   host previews, following [Host Preview Font](references/PREVIEW-FONT.md).
   Apply the size mapping automatically: XS 400, S 300, M/L 200 and XL/XXL 100.
   Keep the same weight when scaling a capture; do not select it independently
   for each text role.
   For setup and missing dependencies, read [Font Tools](references/FONT-TOOLS.md);
   browser use needs no font package, while the Python renderer also needs Node.
   Use the stock text route in the emulator or on hardware with the owner’s
   firmware. Keep any explicit local stock-font research private; never bundle
   `content/display/opfont.svg` in host previews or public assets. Use [Local Stock Resources](references/LOCAL-RESOURCES.md) to locate it or
   explain unpacking. Read Fonts for glyph IDs and spacing limits. Schematic lettering cannot qualify stock typography.
3. Use the matching visual example as a relationship to adapt. Preserve
   encoder ownership, stable text anchors and room for complete values and
   moving artwork. Do not copy a stock drawing or infer a control from art.
4. Check all relevant states, long values, sign/unit transitions, Shift release
   and overlapping activity. Inspect at intended size. Host renders establish
   design only; native behaviour, hardware legibility and cost need separate checks.
   Follow [Verification](references/VERIFICATION.md) for host screenshots and
   the portable font, SVG and scene checks. Inspect the captures and fix
   problems before reporting a design as checked.

## Find More Stock Examples

When the bundled examples do not cover the design question, inspect the
owner’s existing original OP-1 firmware locally, starting with `content/display/`,
or consult [TE’s official original OP-1 manual](https://teenage.engineering/guides/op-1/original).
Open only the relevant screen family or manual section. See
[Finding More Stock Examples](references/STOCK.md#finding-more-stock-examples)
for what to inspect and how to distinguish artwork from running behaviour.
These are external references; no firmware resources or manual images are
bundled with this skill.

## Font And Asset Boundary

Never include TE firmware, code, opfont.svg, glyph vectors, atlases, kerning
files or extracted stock artwork in public files. Keep font loading local.
Latin text maps to lowercase SVG IDs; uppercase IDs are icons. Reject missing
characters explicitly. Run the bundled inspector when checking a local font:

```sh
python3 scripts/inspect_font.py /absolute/private/path/opfont.svg --text 'ALL LABELS'
```

The bundled visual PNGs use original artwork and the openly licensed Iosevka
placeholder. The four font weights, their licence and selected-variant profile are bundled
in `assets/fonts/`. Editable SVGs use the kit's original schematic alphabet. No stock font file or stock glyph geometry is included. The scene files linked from
`references/visuals/examples.json` preserve text sizes and anchors for re-rendering.
Link to the official manual when further reference is useful. Keep its images
and text outside the skill package; study the design relationships and create
original examples rather than copying TE artwork.
