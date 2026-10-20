# Fonts And Previews

Use the bundled **Iosevka Thin** placeholder for shareable host previews. The
kit’s example PNGs already use it, so no stock font setup is needed to read the
guide. [Host Preview Font](PREVIEW-FONT.md) gives the files, exact numeral
variants, sizing, character set and rendering helpers. The font keeps its own
SIL Open Font License 1.1.

For a separate stock-lettering check, choose `opfont.svg` from your own firmware
files. It stays on your machine. Nothing is uploaded, included or served here.
Check a native capture before claiming device legibility or exact spacing.

## Where `opfont.svg` comes from

The vector UI font is a resource in the owner's **locally unpacked original
OP-1 firmware**, at package-relative **`content/display/opfont.svg`**. It is not
a downloadable web font or a file normally visible in the OP-1's USB sounds/tape
disk. Source checkouts and the standalone Kennel SDK are not a reliable source
of the proprietary font. The boot/console bitmap text is a different font system.

Prefer an existing lawful local unpacked tree. Ask the user for its location if
it is not known. Check filenames locally rather than downloading somebody's
extracted font. For example:

```sh
rg --files --hidden --no-ignore /absolute/private/firmware-work \
  -g opfont.svg -g kerntable.db
```

If the user has no unpacked tree, explain the supported route: obtain their own
original OP-1 firmware from [TE's official downloads](https://teenage.engineering/downloads/op-1)
and follow [op1repacker's documented setup and unpack procedure](https://github.com/op1hacks/op1repacker#usage).
Use the unpacker’s own documentation for setup, commands and the output path.
Keep the unpacked tree outside this repository. The kit does not download,
unpack or repack firmware, install tools or operate a device.

Keep the font and its derived data outside the public repository. Use a private
absolute path. `OP1_FONT_PATH` is the portable configuration name, not a fixed
machine-specific installation location. `.gitignore` is a backstop, not a licence.

## Preview With Your Font

Open the optional local workbench (`op1-ui/workbench.html` via the local preview server) and choose your own `opfont.svg`
with **Load opfont.svg**. The browser reads the file into memory. Nothing is
uploaded. The kit never serves the font or fetches one from a CDN. There is no
font cache or font-bearing export button. Reloading clears the loaded font.
`OP1_FONT_PATH` is a suggested local variable for the metadata inspector, not
an HTTP route or hosting configuration.

The following adapter is part of the repository checkout. The installed skill
includes the metadata inspector, guidance and examples, but no browser font
loader or preview runtime. In a separate project, use its existing loader or
write an adapter following the safety and spacing rules below.

For another browser host working from a repository checkout:

```js
import { loadStockFont, applyStockFont } from './src/stock-font.mjs';
const font = await loadStockFont(await chosenFile.text());
// svg is the DOM root returned from the reference screen's renderSvg output.
const issues = applyStockFont(svg, screenScene, font);
```

The loader strips a simple external DOCTYPE declaration without resolving it,
rejects entity declarations/internal DTDs and transforms, and rebuilds only
supported geometric elements with allowed geometry attributes. It does not
insert scripts, links, images, CSS or external references from the source.
Lowercase text glyphs are selected by ID, rather than loading the coloured icon
namespace into text. Unsupported revisions require an explicit adapter.

## Icons And Symbols

The local [icon reference](ICONS.md) lists every documented stock symbol ID,
its meaning and how to keep symbol loading separate from ordinary text. It
also covers icon bounds, multicolour shapes and original symbols for new functions.

## Implementation Details

### Check Your Labels

From the installed skill folder, use its bundled inspector. In a repository
checkout, the equivalent is `op1-ui/tools/inspect_font.py`.

```sh
python3 scripts/inspect_font.py "$OP1_FONT_PATH" \
  --text 'ATTACK 145 MS / EDIT A'
```

The tool prints a checksum, so you know which font file you checked, plus letters, digits, punctuation, icon IDs,
non-character IDs, transform presence and missing requested characters. It emits
no geometry. Missing characters cause a nonzero exit code. Re-run for the actual
labels, units, name character set, errors and confirmations in your screen.

Stock ID rules are documented by [op1hacks](https://github.com/op1hacks/docs#font--symbols):

- Text IDs `a`–`z` draw capital Latin letters. User text `ATTACK` maps to IDs
  `a t t a c k`; do not uppercase the SVG IDs.
- Uppercase IDs are UI symbols. For example `D` is the drum symbol and `Q` the
  sequencer symbol. They are a separate icon namespace, not capital-letter glyphs.
- Escaped IDs encode punctuation/digits: `_x23_` is `#`, `_x30_` is `0`,
  `_x3C_` is `<`. Decode the escape before measuring or validating characters.
- Some IDs name multi-character symbols; do not treat them as ordinary text.
- Space is normally a layout advance, not an outlined glyph. Native spacing
  involves `content/kerntable.db`; mere glyph presence does not supply kerning.

The common original OP-1 font provides A–Z,
0–9 and punctuation `! " # % * + , - . / : ; < = > ? _`, plus uppercase icon IDs
`D Q X A L H E F S T M Y I J Z` and non-character ID `_x34_by4`.
Check your local font rather than assuming every firmware has the same set. Apostrophes, parentheses, brackets, degree signs,
µ and accented characters were not ordinary single-character text IDs in that
inventory. Never infer their presence from a renderer that draws replacements.
Use `US` if that is the chosen understandable unit label; label a custom glyph
adapter and its licence separately when a symbol is genuinely needed.

Report these independently: present in SVG → accepted by the adapter → drawn
by the native text route → readable at the selected size. GIN's working subset
and fallback punctuation are not a complete stock character catalogue.

### Metrics Across Hosts

Use the purpose-named profiles in the Spec, such as `browserRow` and
`parameterValue`, with top-of-cap-cell y coordinates and logical 320×160 units.
The profiles come from representative stock text-template geometry, with no
fixed limit on the number of sizes. Record these separately:

| Field | Meaning |
| --- | --- |
| Font checksum | Identify which local font file you checked |
| Font mode | `open-font-preview`, `stock-local` or `schematic`; label the mode |
| Nominal height | Selected stock-reference geometry target, not a native constructor parameter |
| Ink bounds | Geometry bounds plus stroke/overhang, after placement |
| Advance | Cursor movement, which may be narrower than visible ink |
| Spacing profile | Native `kerntable.db`, qualified adapter, or named host approximation |
| Renderer/output | Browser/Cairo/native; logical canvas, scale, clipping and antialiasing |

This browser adapter uses a shared cap-cell height from the locally measured
alphabet, independent glyph widths, a minimum narrow-glyph advance of 0.22h,
inter-letter gap of 0.17h and space advance of 0.48h. It is called
**`stock-local / optical-v1`**. The adapter preserves the local glyph’s authored line caps and joins. Where
the asset supplies a guide cell, punctuation retains its vertical bearing
inside that cell: a hyphen stays at mid-height and an underscore stays low.
Guide rectangles are not rendered. Alignment uses visible ink bounds, separately from
spacing advance. A narrow final 1 or I must not acquire a false margin simply
because its cursor advance is wider than its outline. Full-height letters and digits without
guide cells use the common cap cell. Check punctuation as well as letters.
The geometry is stock; spacing is an explicit
host approximation inspired by GIN's published adapter. It does not read the
native kerning database or claim pixel identity with a native Text object.
If exact stock spacing is required, use a qualified native renderer or an
adapter for that local kerning resource and verify captured bounds. Do not
silently feed these nominal heights to a native size constructor.

Use actual stock measurement to re-check layout; schematic fixed-width checks
are insufficient. The workbench reports stock overflow separately. It does not
shrink overflowing text. A faithful native report still needs native captures.
Preserve a fixed-size editable-name window and visible cursor rather than
scaling a long name. Handle unsupported characters explicitly.

## Public-source boundary

Commit loaders, tests with invented glyphs, schema and metadata-only notes.
Do not commit `opfont.svg`, `kerntable.db`, extracted geometry, generated
`font.private.inc`, font atlases, baked stock-lettering SVGs or firmware.
The kit’s public example images use the bundled Iosevka placeholder. The
editable SVG sources keep the original schematic alphabet. The MIT licence
covers the kit’s original adapters; Iosevka retains OFL and MIT grants no
rights to the owner’s stock assets.

## Render Example Images

Use the bundled open font for public examples. See [Host Preview Font](PREVIEW-FONT.md)
for the reproducible renderer and exact settings.

`op1-ui/tools/render_stock.py` remains a private checking tool. Its default
output is `out/stock-font-preview`, which is ignored. Keep its stock-lettering
captures local and do not use them as public kit images. The adapter uses
stock geometry with approximate optical-v1 host spacing; a host render does
not establish native text layout or OLED legibility.
