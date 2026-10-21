# Fonts And Previews

Use the bundled **Iosevka** placeholder for shareable host previews. The
kit’s example PNGs already use it, so no stock font setup is needed to read the
guide. [Host Preview Font](PREVIEW-FONT.md) gives the files, exact numeral
variants, sizing, character set and rendering helpers. The font keeps its own
SIL Open Font License 1.1. Its weight follows the selected logical text size:
XS 400, S 300, M/L 200 and XL/XXL 100.

Use Iosevka for ordinary host-generated previews and shared screenshots. On
the emulator or hardware, use the platform’s stock text route with your own
firmware. The optional local stock-font tools below are for private typography
research; they do not make the font or its exports redistributable.

For a separate stock-lettering check, choose `opfont.svg` from your own firmware
files. It stays on your machine. Nothing is uploaded, included or served here.
Use a native capture to check device legibility and exact spacing.

## Find Your Stock Font

The vector UI font is part of the **original OP-1 firmware**. After unpacking
it locally, you will find the font at **`content/display/opfont.svg`** within
the unpacked package. It is not a web font or a file normally visible on the
OP-1’s USB sounds/tape disk. The boot/console bitmap text uses a different
font system.

If you already have an unpacked copy of your firmware, look for that path.
You can also search your private working folder by filename:

```sh
rg --files --hidden --no-ignore /absolute/private/firmware-work \
  -g opfont.svg -g kerntable.db
```

Replace `/absolute/private/firmware-work` with the folder containing your
unpacked firmware.

If you have not unpacked your firmware, download your own original OP-1
firmware from [TE’s official downloads](https://teenage.engineering/downloads/op-1).
Then follow [op1repacker’s setup and unpacking instructions](https://github.com/op1hacks/op1repacker#usage).
That guide explains which tools you need, the commands to run and where to
find the unpacked files. The kit does not unpack firmware for you. Source
checkouts and the standalone Kennel SDK do not supply the stock font.

Keep the firmware, unpacked files and any derived font data in a private folder
outside this public repository. Use that folder when loading or inspecting
the font; do not download somebody else’s extracted copy. In the command
examples below, `OP1_FONT_PATH` means the full path to your local `opfont.svg`,
not a fixed installation folder or web address.

## Preview With Your Font

Open the optional local workbench (`op1-ui/workbench.html` via the local preview server) and choose your own `opfont.svg`
with **Load opfont.svg**. The browser reads the file into memory. Nothing is
uploaded. The kit never serves the font or fetches one from a CDN. There is no
font cache or font-bearing export button. Reloading clears the loaded font.
`OP1_FONT_PATH` is a suggested local variable for the metadata inspector, not
an HTTP route or hosting configuration.

The following adapter is part of the repository checkout. The installed skill
includes the metadata inspector, guidance and examples, but no stock-font
browser loader. Its Iosevka preview loader is separate. In a separate project, use its existing loader or
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

Check each step separately: the glyph is present in the SVG, the adapter
accepts it, the native text route draws it and it is readable at the selected size. GIN's working subset
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
shrink overflowing text. Use native captures to check the final spacing and legibility.
Preserve a fixed-size editable-name window and visible cursor rather than
scaling a long name. Handle unsupported characters explicitly.

## Public-source boundary

Commit loaders, tests with invented glyphs, schema and metadata-only notes.
Do not commit `opfont.svg`, `kerntable.db`, extracted geometry, generated
`font.private.inc`, font atlases, baked stock-lettering SVGs or firmware.
The kit’s public example images use the bundled Iosevka placeholder. The
editable SVG sources keep the original schematic alphabet. The MIT licence
covers the kit’s original adapters; Iosevka retains OFL and MIT grants no
rights to stock assets.

## Render Example Images

Use the bundled open font for public examples. See [Host Preview Font](PREVIEW-FONT.md)
for the reproducible renderer and exact settings.

`op1-ui/tools/render_stock.py` remains a private checking tool. Its default
output is `out/stock-font-preview`, which is ignored. Keep its stock-lettering
captures local and do not use them as public kit images. The adapter uses
stock geometry with approximate optical-v1 host spacing; a host render does
not establish native text layout or OLED legibility.
