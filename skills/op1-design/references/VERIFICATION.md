# Verify A Screen On The Host

Use the project’s actual preview and the agent tools available in the current
session. The portable checks below help find geometry and asset problems;
they do not replace looking at the rendered screen. Fix observed problems and
repeat the affected states before reporting the design as checked.

## Choose The Relevant States

Cover the states that can change the composition: rest and active response,
minimum and maximum values, longest labels, signs and decimal/unit transitions.
Include Shift, page changes, selection versus playback, bypass and empty or
unavailable content where the actual instrument supports them. For movement,
inspect the widest pose and any point where artwork approaches text. A clean
rest image does not establish clearance throughout the motion.

Keep the font, values, renderer and scale explicit. For shareable previews, use
the bundled [Iosevka profile](PREVIEW-FONT.md) and label the result. Check
that the logical size selects the prescribed weight, including when a whole
capture is enlarged: XS 400, S 300, M/L 200 and XL/XXL 100. A pass under
that placeholder cannot establish stock text fit. Use the actual local stock
font for a stock-lettering claim. Schematic captures remain useful for early
composition, but label them as schematic and check stock text again later.

## Run The Portable Checks

For measured Iosevka renders, use [Font Tools](FONT-TOOLS.md) to choose the
browser or Python route and check its dependencies. The lightweight checks
below have different requirements from the open-font renderer.

From the installed `op1-design` skill folder:

```sh
python3 scripts/inspect_font.py /absolute/private/path/opfont.svg --text 'TUNE -7 ST 01:25'
python3 scripts/check_svg.py /path/to/original-screen.svg
node scripts/check_scene.mjs --font-mode schematic /path/to/scene.json
```

The font inspector checks character IDs without exporting geometry. The SVG
checker tests the conservative native source profile, including explicit paint,
path syntax and IDs. Its file-size warning is a design target, not a firmware
loader limit. The scene checker tests the kit’s 320×160 scene format: supplied
text bounds, stroke clearance, text/art intersections and value/unit grouping.
All three run locally; Python and Node are required, with no package install.

For a measured stock scene, use `--font-mode stock-local` only after replacing
its text positions and widths with the actual local font measurements. That
option labels the supplied measurements; it does not load or measure a font.
A scene exporter in another framework must provide the same fields, or use
that project’s own bounds checks instead. Do not call arbitrary JSON a checked
kit scene. See [the input format](#scene-input-format).

The scene checker conservatively bounds curve control points and samples
curves for stroke intersections. It is not a pixel-visibility test or an exact
native renderer. It cannot tell whether a fill hides text, a metaphor makes
sense or a changing font string was omitted from the test cases.

## Capture The Real Preview

Use the project’s documented preview command and render path. For a browser
preview, use your available browser automation or screenshot tool to open the
local URL, set the required control state and capture the instrument area.
Confirm that the intended font is loaded and the requested state is visible
before capturing. Prefer an observable readiness signal from the preview, such
as font-loaded status or an actual readout change, to an arbitrary delay.
For a native host preview, use its capture command or the session’s desktop
capture tool. Prefer the project’s existing tooling over adding another stack.
Do not assume that a particular browser, Playwright, desktop app or display
server exists. If only a static SVG/PNG render is available, inspect it and
report that narrower scope rather than claiming an interactive host check.

Save a screen-only PNG at the intended output scale and inspect the complete
320×160 logical composition. Also capture an enlarged view when needed for
strokes, punctuation or spacing, and a view with host context if controls or
clipping are part of the question. When cropping, check whether the capture
tool expects document or viewport coordinates and account for scrolling. Open
the saved crop to confirm that it contains the whole instrument. Preserve aspect ratio. A 320×160 logical scene
scaled to a 400×200 host image is not a native 400×198 capture. For a documentation website,
check its page layout separately at phone and desktop widths.

Use clear filenames such as `resonator-rest-stock-local.png` and
`resonator-max-decay-stock-local.png`. Save captures in the project’s ignored
output folder. Record the source revision, any uncommitted changes and the
state inputs alongside the capture, so an old render cannot verify newer code. Capture pixels when stock lettering is loaded; do not export
live SVG/DOM containing proprietary glyph outlines. Serve only the intended
preview output, keeping private firmware, font files and kerning databases
outside a web server’s public directory.

## Open And Inspect The Captures

Open the saved images with the agent’s image-viewing tool. Successful capture,
file existence or a passing bounds checker is not visual inspection. Examine:

- The name, value and unit gaps, including narrow `1`/`I`, minus versus
  underscore, colon, decimal points and the longest expected string.
- Text against moving geometry, filled shapes, outlines and the bottom guide.
  Check the whole swept area, plus the intended paint order and opaque parts.
- Reading order, empty space and control ownership. Selection, playback,
  activity and unavailable states should remain distinguishable without
  relying only on colour. Look at dim text at intended size too.
- Curve continuity, line ends and smoothing at final size. A large screenshot
  can hide small-screen legibility problems and magnify harmless antialiasing.
- Real state changes: a parameter alters the intended part; a strike settles;
  releasing Shift restores the normal presentation; unrelated anchors stay fixed.

Use interaction recordings or representative frames when a static capture
cannot establish the behaviour. Compare before and after under the same font,
values and output scale. If a tool or font is unavailable, name that missing
check and continue useful checks that do not depend on it. Do not invent a pass.

## Report What Was Checked

Give the user the relevant images and a short account of the renderer, font
mode, output size, states inspected and checks run. Identify any remaining
uncertainty. Keep private asset paths and extracted glyph data out of public
reports. Fix issues within the task’s scope before handing the work back.

Host evidence can establish composition, rendered spacing and simulated state
transitions. Native text layout, actual SDK visibility/lifetime behaviour,
physical window clearance, OLED legibility and peak GUI/audio cost need their
own target checks. Do not describe a host screenshot as proof of those results.

## Scene Input Format

The bundled [visual state contracts](visuals/examples.json) link complete
examples. A minimal schematic scene has this shape. Its width is illustrative; export
measured widths from your renderer for real checks:

```json
{
  "width": 320,
  "height": 160,
  "nodes": [
    {"id":"guide","points":[[20,70],[140,70]],"width":1.5,"color":"#ffffff"}
  ],
  "texts": [
    {"id":"name","value":"TUNE","x":20,"y":20,"width":48,"size":"browserRow"}
  ],
  "readouts": []
}
```

Use profile names from [design-kit.json](design-kit.json). `x` and `y` locate
the text’s cap-cell top; `width` is its supplied visible width before stroke.
Optional `maxWidth` constrains a text field; omitted or `null` means no
additional width limit. Nodes may supply explicit
`commands` using one `M` contour and `L`, `C`, `Z` operations, with their
coordinate pairs also exposed as `points`. Curve control points are included
in the conservative content-guide check. Optional readout groups declare
`valueId`, `unitId`, `gap` and `maxWidth`; text positions must already reflect
the chosen font’s layout. Nodes describe foreground geometry; the full-canvas background is separate
from the content-guide check. If a generated glyph node carries `textId`, it
must reference an existing semantic text record; use that field only for text
geometry, never to exempt instrument artwork from clearance checks. These
records contain no stock glyph outlines.
