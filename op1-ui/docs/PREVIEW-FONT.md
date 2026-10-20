# Iosevka Host Preview Font

The kit bundles **Iosevka Thin 34.9.0**, upright and normal width, for public
example renders and host previews. It is an openly licensed placeholder.
It does not reproduce the stock OP-1 font’s outlines, spacing, icons or native
text behaviour. The typography roles and sizes still come from the stock
interface; changing the preview font does not change those references.

## Bundled Font Files

The files are in `skills/op1-design/` in this repository. If you installed the
skill separately, use its `op1-design/` folder instead. Paths below start there:

| File | Use |
| --- | --- |
| `assets/fonts/Iosevka-Thin.woff2` | Unmodified, bundled font. No download or system installation needed for browser use. |
| `assets/fonts/Iosevka-OFL.md` | Copyright and SIL Open Font License 1.1. Keep this with redistributed font files. |
| `assets/fonts/profile.json` | Version, checksum, source, weight, character set and exact OpenType variants. |
| `assets/fonts/metrics.json` | Bounds and advances for the selected Iosevka glyphs. These are open-font metrics, not stock metrics. |
| `assets/fonts/preview-font.mjs` | Browser loader and adapter for the kit scene format. |
| `scripts/preview_font.py` | Open-font SVG renderer and measurements for the same scene format. |

Source: [Iosevka by Renzhi Li](https://github.com/be5invis/Iosevka/tree/v34.9.0).
The font keeps its own OFL licence; the kit’s original adapters are MIT.

## Use The Selected Variants

Loading the family name alone gives different digits. Apply the profile’s
features in browsers and other shaping engines:

```css
font-family: Iosevka;
font-weight: 100;
font-style: normal;
font-feature-settings:
  "cv01" 1, "cv02" 1, "cv03" 1, "cv04" 1, "cv05" 1,
  "cv06" 1, "cv07" 1, "cv08" 2, "cv09" 3, "cv10" 1,
  "cv19" 1;
```

This selects a plain 1, straight-neck 2, flat-top 3, closed 4, upright 5,
rounded closed-contour 6, straight 7, two-circle 8, straight diagonal-tail 9,
unslashed 0 and serifless capital I. These are built-in font variants.
Do not substitute a character from another font or stretch the glyphs.
Consult the [versioned variant reference](https://github.com/be5invis/Iosevka/blob/v34.9.0/doc/character-variants.md)
when changing the profile.

## Size And Align The Visible Lettering

The font has 1,000 units per em and a 735-unit cap height. A kit profile’s
`nominalHeight` describes a stock centreline reference. To approximate its
full visible height, include the profile’s stroke width:

```text
scale = (nominalHeight + strokeWidth) / 735
CSS font size = scale * 1000
baseline = top-of-cap-cell + nominalHeight + strokeWidth / 2
```

Use the font’s own advances between characters. Anchor the completed string
by its visible ink bounds, not the last cursor advance. This matters for a
final 1 or I. Lay out a value and unit together, preserving their ink gap and
shared anchor. Measure again after changing a string; do not use schematic
or stock widths with Iosevka.

The slash extends above and below the capital cell. Check actual ink bounds
for `1/3`, signs, underscores and other punctuation, particularly near the
bottom guide. Keep complete strings inside their field and clear of artwork.
Reflow or move a field when needed; do not silently shrink it.

## Browser Use

Serve the installed skill folder as local static files, or copy the font,
notice, profile, metrics, adapter and its `scripts/lib/` imports into your
host’s asset tree while preserving the relative paths. Use localhost or HTTPS
for the adapter’s checksum verification. It loads local bundled assets and
uses no font CDN.

```js
import {loadPreviewFont, applyPreviewFont} from './path/to/op1-design/assets/fonts/preview-font.mjs';
const font = await loadPreviewFont();
// Insert your kit-format SVG in the document before applying the adapter.
const issues = applyPreviewFont(svg, scene, font);
```

The SVG renderer uses the selected glyph metrics. It leaves the original
artwork in place and checks text widths, content guides and artwork clearance.
This produces a host SVG with SVG text; it is not firmware SVG source.

## Static Renders

The portable Python helper needs `fonttools[woff]==4.67.0`. In the repository,
`op1-ui/tools/requirements-preview.txt` pins its dependencies. After installing
these in your project’s Python environment:

```sh
python3 scripts/preview_font.py screen.json --svg preview.svg
```

The scene format is in [Verification](../../skills/op1-design/references/VERIFICATION.md). Use a browser or your
SVG rasteriser to capture pixels. In the repository, run
`python3 op1-ui/tools/render_preview.py` to rebuild every public example and
the Open Graph image. It uses the bundled font and needs no firmware.
`--output out/preview-review` writes a review set without replacing the public
images. Keep captures labelled **Iosevka preview** and inspect them at 320 × 160
as well as enlarged.

## Characters And Limits

The profile exposes uppercase A–Z, 0–9, space and the punctuation listed in
`textCharacters`. Missing characters fail explicitly. Iosevka has a much larger
character set, but that does not establish support on an OP-1. The stock icon
IDs are a separate namespace and are not Iosevka characters.

The rounded 6 and diagonal 9 follow the intended construction, while the 9’s
loop, several bowls, proportions and spacing remain visibly different from
stock. A clear Iosevka preview establishes composition under that font only.
For stock lettering, load your own stock font locally as described in
[Fonts And Previews](FONTS.md), then check native captures separately. Never
publish the private font, its geometry or a stock-lettering export from that
check.
