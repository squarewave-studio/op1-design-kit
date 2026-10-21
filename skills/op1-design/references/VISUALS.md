# Visual Reference Index

Original static examples for seven stock-derived relationships. Choose a row,
read its contract, then open its images. Each state is a complete 320×160
logical screen. The site shows the same pairs beside the guidance.

PNG: open-font-preview / iosevka-op1-preview-v2 lettering with its own advances. SVG: original
schematic alphabet. Neither is a native rendering or performance result.
Stock font files and reusable stock glyph geometry are not included.

| Pattern | State Pair |
| --- | --- |
| [Context Beside Detail](#context) | [First Span](visuals/context-first.png) · [Later Span](visuals/context-next.png) |
| [Edit Focus And Playback](#focus) | [Apart](visuals/focus-apart.png) · [Coincident](visuals/focus-together.png) |
| [Category And Choice](#browser) | [Metal Bank](visuals/browser-metal.png) · [Wood Bank](visuals/browser-wood.png) |
| [Alternate Presentation](#shift) | [Normal](visuals/shift-normal.png) · [Held Shift](visuals/shift-held.png) |
| [Configuration And Activity](#route) | [Inactive](visuals/route-idle.png) · [Active](visuals/route-active.png) |
| [Readout Formats](#formats) | [Before Transition](visuals/formats-first.png) · [After Transition](visuals/formats-next.png) |
| [Meaningful Event Response](#motion) | [At Rest](visuals/motion-rest.png) · [Strike](visuals/motion-strike.png) |

[examples.json](visuals/examples.json) stores the same contracts and links a
small scene JSON for each state. Those scene files contain semantic text records
and original artwork geometry. Use the relevant scene when adapting coordinates
or regenerating a screen; the manifest contains no embedded geometry. Measure
stock text again in the actual font.

When adapting a pair, add the actual [input and navigation contract](SPEC.md#input-and-navigation-contract)
beside its states: available inputs, detail/return routes, retained state and
how the player discovers an unlabelled function. The visual examples do not
implement those framework bindings.

<a id="context"></a>

## Context Beside Detail

Keep the whole phrase visible while editing a selected span.

**Stock relationship:** Synth sampler overview and magnified regions.

**Keep fixed:** Overview frame, Detail frame, Whole waveform.

**Change:** Selected span, Detail waveform.

**Proposed encoder map:** blue = start boundary, green = end boundary.

- First Span: [PNG](visuals/context-first.png) · [Schematic SVG](visuals/context-first.svg).

- Later Span: [PNG](visuals/context-next.png) · [Schematic SVG](visuals/context-next.svg).

**Check:** Both views refer to the same sample interval; Markers remain visible at the interval limits.
<a id="focus"></a>

## Edit Focus And Playback

Show where the next edit applies independently of playback.

**Stock relationship:** Pattern live edit.

**Keep fixed:** Stored notes, Edit outline at step 3.

**Change:** Playback triangle.

**Proposed encoder map:** blue = editing position.

- Apart: [PNG](visuals/focus-apart.png) · [Schematic SVG](visuals/focus-apart.svg).

- Coincident: [PNG](visuals/focus-together.png) · [Schematic SVG](visuals/focus-together.svg).

**Check:** Outline and triangle remain distinguishable at coincidence; Playback does not move editing focus.
<a id="browser"></a>

## Category And Choice

Choose an item without losing category context.

**Stock relationship:** Preset browser.

**Keep fixed:** Two list regions, Blue bank and Green patch ownership.

**Change:** Category choice, Available items, Item choice.

**Proposed encoder map:** blue = bank, green = patch.

- Metal Bank: [PNG](visuals/browser-metal.png) · [Schematic SVG](visuals/browser-metal.svg).

- Wood Bank: [PNG](visuals/browser-wood.png) · [Schematic SVG](visuals/browser-wood.svg).

**Check:** The new category has an explicit valid item choice; Handle an empty category and long names without reducing text size.

**Additional fixtures:** an empty category has no selection; a long name uses a fixed-size scrolling window or a detail page, never auto-shrinking.
<a id="shift"></a>

## Alternate Presentation

Reveal the function available while Shift is held.

**Stock relationship:** Drum sampler alternate Orange readout.

**Keep fixed:** Waveform, Boundaries, Orange ownership, Both underlying parameter values.

**Change:** Mode arrow becomes level number, Name and unit.

**Proposed encoder map:** orange = playback mode, shiftOrange = level in dB.

- Normal: [PNG](visuals/shift-normal.png) · [Schematic SVG](visuals/shift-normal.svg).

- Held Shift: [PNG](visuals/shift-held.png) · [Schematic SVG](visuals/shift-held.svg).

**Check:** Releasing Shift returns to the normal scene without parameter changes.
<a id="route"></a>

## Configuration And Activity

Explain a modulation route while showing independent signal activity.

**Stock relationship:** Signal Flow and LFO route compositions.

**Keep fixed:** Configured route, Labels, Values, Destination.

**Change:** Small activity diamond.

**Proposed encoder map:** blue = rate, green = amount in percent, white = destination.

- Inactive: [PNG](visuals/route-idle.png) · [Schematic SVG](visuals/route-idle.svg).

- Active: [PNG](visuals/route-active.png) · [Schematic SVG](visuals/route-active.svg).

**Check:** Activity is not a selection affordance; No selection action is implied for explanatory nodes.
<a id="formats"></a>

## Readout Formats

Format categorical, signed, duration and position values deliberately.

**Stock relationship:** Play Mode, Tempo and Clock reading tasks.

**Keep fixed:** Font profiles, Label positions, Right readout edges.

**Change:** Sign, Duration unit, Position.

**Proposed encoder map:** blue = mode, green = offset in semitones, white = duration, orange = position in minutes:seconds.

- Before Transition: [PNG](visuals/formats-first.png) · [Schematic SVG](visuals/formats-first.svg).

- After Transition: [PNG](visuals/formats-next.png) · [Schematic SVG](visuals/formats-next.svg).

**Check:** The widest intermediate string fits; Unit transitions preserve the right anchor; This is a readout study, not one proposed instrument.
<a id="motion"></a>

## Meaningful Event Response

Show a struck membrane responding while controls and camera remain fixed.

**Stock relationship:** Tombola demonstrates motion with musical consequences; this example uses original Membrane artwork.

**Keep fixed:** Rim, Shell, Camera, Control values, Readout anchors.

**Change:** The contact fills and one local ripple appears on the skin.

**Proposed encoder map:** blue = tension, green = strike position, white = damping, orange = shell.

- At Rest: [PNG](visuals/motion-rest.png) · [Schematic SVG](visuals/motion-rest.svg).

- Strike: [PNG](visuals/motion-strike.png) · [Schematic SVG](visuals/motion-strike.svg).

**Check:** A real strike starts the response; Response settles back to rest; Test empty, stopped and rapidly retriggered states.

**Transition:** rest → strike → rest.

## Typography Size And Weight

These original code renders show the bundled Iosevka mapping in context.
They are static typography studies, not stock captures or interaction demos.
Open the relevant image and its scene data rather than the whole set.

| Study | Image | Scene Data | What To Check |
| --- | --- | --- | --- |
| Labels and values | [Readout PNG](visuals/typography-readouts.png) | [Scene](visuals/typography-readouts.json) | XS/400 names, S/300 values, sign and unit gaps |
| Mixed sizes | [Scale PNG](visuals/typography-scale.png) | [Scene](visuals/typography-scale.json) | XS/400, S/300, L/200 and XXL/100 together |
| Rate layouts | [Tempo PNG](visuals/typography-tempo.png) | [Scene](visuals/typography-tempo.json) | M/200 and XL/100 with stable labels |

Use the same weight mapping in the browser and Python adapters. Inspect at
320 × 160 as well as enlarged. See [Host Preview Font](PREVIEW-FONT.md).
