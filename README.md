# OP-1 Design Kit

A draft design kit for the **original OP-1**, made by SquareWave Studio based on
community sources and a review of the stock user interface.

Use the kit to design synth, effect and utility screens that feel at home on the
instrument. It covers typography, encoder colours, layout, icons, graphics and
CPU considerations, with original examples and a portable agent skill.

[Read The Design Kit](https://squarewave-studio.github.io/op1-design-kit/) ·
[Start Building](op1-ui/README.md) · [Patterns And Screen Examples](op1-ui/docs/EXAMPLES.md)

![Original Membrane instrument concept](op1-ui/examples/renders/membrane-rest.png)

*Original artwork rendered with the bundled Iosevka Thin placeholder.
Stock lettering and native spacing need a separate local check.*

## Install The Skill

From your firmware project:

```sh
npx skills add squarewave-studio/op1-design-kit
```

Choose **op1-design** and your coding agent. The CLI pulls directly from this
repo; a skills.sh account or listing is not required. The skill includes local
visual references, font guidance and portable checking tools.
[Installation And Usage](op1-ui/docs/AGENT-SKILL.md).

## Use The Kit

- [Spec](op1-ui/docs/DESIGN.md): stock-derived text sizes, colours, layout and grid guidance.
- [Screen Families](op1-ui/docs/STOCK.md): design and interaction patterns from the original interface.
- [Fonts](op1-ui/docs/FONTS.md) and [Icons](op1-ui/docs/ICONS.md): the bundled Iosevka placeholder, private stock resources and character IDs.
- [Graphics And CPU](op1-ui/docs/GRAPHICS.md): SVG blocks, visibility, smoothing and bounded live work.
- [Components](op1-ui/docs/COMPONENTS.md): reference helpers and target integration.
- [Sources And Credits](op1-ui/docs/SOURCES.md): community work behind the guidance.

The guide needs no font setup. Iosevka Thin, its OFL licence and the selected
variant profile are bundled in the skill. See [Host Preview Font](op1-ui/docs/PREVIEW-FONT.md). For stock-lettering checks, use your own firmware
locally; no firmware resources are included or served here.

See the kit in a real instrument: [GIN](https://github.com/squarewave-studio/op1-mods/tree/main/mods/gin).
[OP-1 Mods](https://github.com/squarewave-studio/op1-mods) hosts the instruments
and firmware-mod projects separately.

## Develop And Contribute

Use Node 22 or later, Python 3 and gitleaks. `npm ci` installs the tracked
maintainer pre-commit hook. See [Contributing](CONTRIBUTING.md) for the checks and
[local setup](op1-ui/README.md) for preview and build commands.
The site builds with GitHub Actions. Maintainer-only
[Publishing](op1-ui/docs/PUBLISHING.md) notes stay in the repo.

## Licence

Original kit code and guidance use the [MIT licence](LICENSE), copyright
Photon Consulting Limited, trading as SquareWave Studio. Web fonts and the
website’s seven attributed manual quotations keep their own rights and notices.
Manual images are excluded from MIT and from the portable skill. See
[THIRD_PARTY.md](THIRD_PARTY.md).

Maintained by [SquareWave Studio](https://squarewave.studio/?utm_source=op1-design-kit&utm_medium=referral&utm_campaign=op1-design-kit)
with the OP-1 community.

Unofficial. Not affiliated with, authorised by or endorsed by Teenage Engineering AB.
