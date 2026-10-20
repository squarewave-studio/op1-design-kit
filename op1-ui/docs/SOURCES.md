# Sources And Credits

This kit builds on the OP-1 community’s published work. These links explain
where its design guidance and implementation advice come from. Teenage
Engineering makes the OP-1; this kit is independent community work.

| Source | What The Kit Learned |
| --- | --- |
| [TE’s official original OP-1 manual](https://teenage.engineering/guides/op-1/original) | External reference for stock screen composition and documented controls. Consult the relevant section; no manual pages or images are bundled with the skill. |
| [op1hacks](https://github.com/op1hacks/docs) | SVG conventions, font and symbol IDs, and the distinction between vector glyphs and kerning. |
| [op1repacker](https://github.com/op1hacks/op1repacker#usage) | How owners can unpack their own firmware locally to obtain the font. No firmware is mirrored here. |
| [op1r, pcppcp (popcorp) and contributors](https://github.com/pcppcp/op1r-src) | Screen and plugin separation, retained nodes, visibility and host previews. Its SDK is GPL with additional firmware terms; no SDK code is copied into this MIT kit. |
| [Hundekraft](https://hundekraft.github.io/op1-workshop/) and [developer reference](https://hundekraft.github.io/op1-workshop/llms.txt) | Practical screen-art restrictions, readable controls, framework offsets and optional caching. Check the installed core’s capabilities. |
| [Maiko](https://maikopruett.com/op-1) | Clear feedback for tape, naming, undo and sampler interactions. |
| [GIN](https://github.com/squarewave-studio/op1-mods/tree/main/mods/gin) | Playing versus editing hierarchy, encoder ownership and explicit edit A/B state. |
| [maxaw’s layout notes](https://op-forums.com/t/custom-firmware-on-the-op-1/4283/1371) | The suggested 8-unit grid, safe margins and a report of lower-screen visibility. |
| [popcorp’s graphics notes](https://op-forums.com/t/custom-firmware-on-the-op-1/4283/1373) | Practical SVG, text-update, raster-order and fixed-point advice, plus the cautious y≈140 guide. These are community reports, not universal hardware limits. |
| [Instant_Fidelity’s playing example](https://op-forums.com/uploads/default/original/2X/e/e7fb7c193a878b2a7e11d16c2b51cad877e0eaa3.png) and [editing example](https://op-forums.com/uploads/default/original/2X/a/a8abb2d7f132b6eee717f22fba9b090fa0a2dce4.png) | The initial typography proposal and a consistent anchor for each name, value and unit. |
| [Oblique Strategies by ultralazr](https://github.com/ultralazr/op1-oblique-strategies) | Prior art for local vector-font loading, also credited by op1r’s font loader. The kit’s loader is independently written. |
| [SVG rendering hints](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/shape-rendering) | Browser antialiasing choices; browser settings do not establish native smoothing. |
| [Agent Skills specification](https://agentskills.io/specification) | The portable skill format and its supporting references. |

The kit includes original code, diagrams and schematic lettering under
[MIT](https://github.com/squarewave-studio/op1-design-kit/blob/main/LICENSE).
Third-party projects retain their own licences. Use your own firmware locally;
no firmware resources are included or served here. See the repository’s
[third-party notices](https://github.com/squarewave-studio/op1-design-kit/blob/main/THIRD_PARTY.md).

## Documentation References

| Source | What The Kit Learned |
| --- | --- |
| [Every Layout, by Heydon Pickering and Andy Bell](https://every-layout.dev/layouts/stack/) | Explain the problem, pattern and use before implementation. |
| [Pico CSS documentation](https://picocss.com/docs/nav) | Consistent navigation, local contents and examples beside practical guidance. |
| [Utopia](https://utopia.fyi/) | Focused destinations for type, space and layout. OP-1 screen geometry remains fixed rather than fluid. |
| [Open Props](https://open-props.style/) | Named tokens with visible specimens and incremental adoption. |

These inform the documentation’s organisation. Their code and visual assets are
not dependencies of the kit.

## Web Typography

[Inter](https://rsms.me/inter/), by The Inter Project Authors, is used for the
documentation shell under the SIL Open Font License 1.1. The font and its
[licence](https://squarewave-studio.github.io/op1-design-kit/assets/fonts/Inter-OFL.txt)
are hosted with the site. It is separate from OP-1 screen lettering.

[Archivo](https://www.omnibus-type.com/fonts/archivo/), by The Archivo Project
Authors, supplies the home page hero under the SIL Open Font
License 1.1. Its variable Latin font and [licence](https://squarewave-studio.github.io/op1-design-kit/assets/fonts/Archivo-OFL.txt)
are hosted locally with the documentation.

## Host Preview Font

[Iosevka](https://github.com/be5invis/Iosevka/tree/v34.9.0), by Renzhi Li, supplies
the Thin host placeholder under the SIL Open Font License 1.1. Its unmodified
font file, notice and selected-variant profile are included in the skill.
[Host Preview Font](../../skills/op1-design/references/PREVIEW-FONT.md) explains the settings and limits. Iosevka
is not the OP-1 font and does not supply its stock icons.

## TE Reference Illustrations

The [original synthesizer guide](https://teenage.engineering/guides/op-1/original/synthesizer-mode),
[sequencer guide](https://teenage.engineering/guides/op-1/original/sequencers),
[Shift reference](https://teenage.engineering/guides/op-1/original/shift-key)
and [main-mode guide](https://teenage.engineering/guides/op-1/original/main-modes)
explain the controls behind the interaction patterns. Static artwork alone
does not establish their running behaviour.

The FM, String and Digital diagrams are referenced from **OP-1 Manual 1.2**,
§17.1, PDF pages 42, 41 and 41 respectively. The DBOX, synth-envelope, Mixer
and Tempo references are on PDF pages 16, 12, 25 and 27. All are
© Teenage Engineering AB. They support the adjacent analysis of composition, typography and
control ownership. The site includes seven screen-only quotations beside their analysis. These
are reference illustrations, not new hardware captures, and are excluded from
the portable skill and machine-readable design rules.
See the [official original OP-1 guide](https://teenage.engineering/guides/op-1/original).

These illustrations retain their original copyright and are **excluded from the MIT
licence**. Their inclusion for discussion does not grant permission to reuse TE
artwork in a plugin or another library. See the [reference-image notice](https://squarewave-studio.github.io/op1-design-kit/references/manual/NOTICE.md).

## Contributors

- [Joseph Holland (Instant_Fidelity)](https://github.com/joseph-holland), kit design, code and guidance.

See the [repository contributors](https://github.com/squarewave-studio/op1-design-kit/graphs/contributors) for the contribution history. The community sources above are credited for their published work.

## More From SquareWave Studio

I also make [OP-PatchStudio for the OP-1 Field and OP-XY](https://squarewave.studio/op-patchstudio?utm_source=op1-design-kit&utm_medium=referral&utm_campaign=op1-design-kit).
