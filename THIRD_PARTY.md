# Third-party code and assets

The MIT licence covers SquareWave Studio's original work in this repository.
It does not relicense someone else's code, sound design, fonts or trademarks.

## OP-1 UI references and local fonts

The OP-1 UI kit's components, guidance, schematic alphabet, loaders and test
fixtures are original SquareWave work under [MIT](LICENSE). The
[sources and credits](op1-ui/docs/SOURCES.md) links to op1hacks,
op1repacker, pcppcp/op1r, Hundekraft, Maiko and the other references, with a short explanation of what the kit learned. Those projects retain their own licences and
copyrights. Reference does not imply endorsement.

No third-party UI code, SDK headers, firmware drawings or stock font assets
are bundled with the kit. Seven screen-only manual quotations accompany analysis on the site and are
excluded from MIT and from the portable skill. Its independently written host loader accepts a user-supplied
local `opfont.svg` in memory; neither the MIT licence nor that capability grants
redistribution rights to the font, kerning database or derived glyph data.
The editable SVG examples retain the original schematic alphabet. The example
PNGs use the bundled Iosevka placeholder under its included OFL licence.
No stock font file or reusable stock glyph vectors are included. Native code examples elsewhere in the ecosystem can
carry GPL and additional firmware terms; their APIs are cited, not copied here.

## op1r

[op1r-src](https://github.com/pcppcp/op1r-src) is by pcppcp (popcorp) and
contributors, under GPL-3.0-or-later with its additional OP-1 firmware permission.
No op1r source, SDK headers or GPL host adapters are included here.

## Independence And Trademarks

This kit is independently maintained by SquareWave Studio with the OP-1 community.
OP-1 is used descriptively to identify the instrument. Teenage Engineering’s
firmware, font assets and trademarks remain theirs; MIT grants no rights to them.
No firmware, extracted font resource or reusable stock artwork is distributed here.

Unofficial. Not affiliated with, authorised by or endorsed by Teenage Engineering AB.

The kit credits maxaw’s [layout observations](https://op-forums.com/t/custom-firmware-on-the-op-1/4283/1371)
and popcorp’s [graphics notes](https://op-forums.com/t/custom-firmware-on-the-op-1/4283/1373).
Its [screen-family guidance](op1-ui/docs/STOCK.md) discusses visual and musical
relationships. Original example drawings contain no extracted stock geometry.

## Documentation References

[Every Layout](https://every-layout.dev/layouts/stack/),
[Pico CSS](https://picocss.com/docs/nav), [Utopia](https://utopia.fyi/) and
[Open Props](https://open-props.style/) inform the documentation’s organisation
and presentation. No code or visual assets from these projects are included.

## TE Manual Reference Quotations

The selected FM, String and Digital references come from **OP-1 Manual 1.2**,
§17.1, PDF pages 42, 41 and 41. DBOX, synth-envelope, Mixer and Tempo appear on
PDF pages 16, 12, 25 and 27. All are © Teenage Engineering AB.
They accompany specific criticism and review of composition, hierarchy and
control ownership. They are not reusable kit artwork and are excluded from MIT. The website keeps these quotations beside their analysis and outside the
portable skill and machine-readable rules.
The PDF lists Tobias von Hofsten in its author metadata; individual illustrators
are not separately identified on the cited pages. See the
[reference notice](op1-ui/references/manual/NOTICE.md) and
[official original guide](https://teenage.engineering/guides/op-1/original).

## Inter Web Font

The documentation shell uses Inter, Copyright 2016 The Inter Project Authors
(https://github.com/rsms/inter), under the SIL Open Font License 1.1. The
unmodified Latin variable WOFF2 comes from @fontsource-variable/inter. Its
[licence](op1-ui/assets/fonts/Inter-OFL.txt) is included. This web font is separate
from the OP-1's locally supplied stock font.

### Archivo

The home page hero and share image use Archivo by The Archivo Project
Authors under the SIL Open Font License 1.1. The local font is in
`op1-ui/assets/fonts/archivo-latin-standard-normal.woff2`; its notice is
`op1-ui/assets/fonts/Archivo-OFL.txt`. It is separate from OP-1 screen lettering.

## Iosevka Host Preview Font

Public example PNGs and the optional workbench use **Iosevka 34.9.0**,
Copyright (c) 2015–2026 Renzhi Li, under the SIL Open Font License 1.1. The
unmodified Thin, ExtraLight, Light and Regular fonts and their [licence](skills/op1-design/assets/fonts/Iosevka-OFL.md)
are included in the portable skill, beside the versioned variant profile.
[Iosevka source](https://github.com/be5invis/Iosevka/tree/v34.9.0). Original kit
adapters remain MIT; the font retains OFL. It is a host placeholder and does
not supply stock OP-1 lettering or icons.
