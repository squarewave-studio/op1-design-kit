# Icons And Symbol IDs

Use an icon to identify a familiar module or action, then add a short label
where its meaning could be ambiguous. Keep module identity distinct from
selection, activity and bypass state. Colour alone should not carry the meaning.

## Stock Symbol Catalogue

The local `content/display/opfont.svg` contains a symbol namespace as well as
letters. The IDs below are the documented stock mappings. Check them in the
local font with the bundled inspector before using a symbol. The catalogue lists
names and meanings; the symbol artwork stays in your local font.

| SVG ID | Meaning | Documented Appearance |
| --- | --- | --- |
| `D` | Drum module | Drum symbol |
| `Q` | Sequencer | Sequencer symbol |
| `S` | Synth module | Blue |
| `T` | Tape | Red/orange |
| `M` | Mixer | Grey |
| `X` | Synth effect | Blue FX symbol |
| `H` | Drum effect | Green FX symbol |
| `A` | Synth envelope | Blue |
| `E` | Drum envelope | Green |
| `L` | Synth LFO | Blue |
| `F` | Drum LFO | Green |
| `Y` | Musical keyboard | Blue |
| `I` | Effect blend | Blue blend symbol with FX lettering |
| `J` | Blend | Blue overlapping-circle symbol without FX lettering |
| `Z` | Equaliser | Blue |

The multi-character ID `_x34_by4` is separate from ordinary single-character
text. Treat it as a named resource; do not assume it is a string the text API
can render. The local inspector reports its presence without exporting it.

These names follow the community’s published font mapping, cross-checked for
ID presence in the local stock font. They do not establish every native text
API’s ability to draw symbols. Source credit: [op1hacks](https://github.com/op1hacks/docs#font--symbols).

## Load A Symbol Deliberately

1. Find your local font using [Fonts And Previews](FONTS.md). Keep it outside
   the repository and inspect its actual IDs.
2. Use the matching SDK’s documented symbol service or named-node binding.
   Preserve the exact uppercase symbol ID. Do not pass it through a helper
   that lowercases IDs for Latin text.
3. Check that API’s colour, bounds, ownership and lifetime rules. An icon can
   have several coloured parts; recolouring one style need not recolour all.
4. Measure its visible bounds and strokes in the actual renderer. Align it
   optically with its label, leave clearance and test selected/bypassed states.

For example, ordinary text `DRUM` maps to lowercase letter IDs `d r u m`.
The drum symbol instead requests exact ID `D`. Those are different operations.
The kit’s host text loader deliberately excludes uppercase symbol IDs; it does
not silently draw an icon when asked for a capital letter.

## Original Icons For New Functions

For an unfamiliar function, use a simple original symbol or a short readable
label. Follow the [SVG and stroke guidance](GRAPHICS.md): explicit geometry,
one contour per path, checked IDs and bounded visible strokes. Keep any new
icon’s name, meaning, states and control action in its component contract.
An arrow should explain direction or an available action, not imply a button
or editable node where no such interaction exists.

Do not add a tiny icon when a normal-size label would be clearer. Inspect the
symbol at intended output size, including dim and active states. Preserve a
stable silhouette and check that it remains readable at screen size.

Stock symbol shapes, atlases and extracted glyph vectors are not distributed
here. Builders obtain them from their own local resources; the library includes
the mapping, loading rules and original example artwork.
