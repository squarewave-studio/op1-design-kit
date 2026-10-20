# Contributing

Open an issue or pull request with the problem you want to solve, your proposed
change and what you tested. Design patterns, original examples, clearer guidance
and documented device observations are welcome. Use clear, plain English.

## What To Include

For a screen change, describe its purpose, encoder mapping and important states.
Include a render at its intended size. Keep names and values clearly separated,
including when they share a baseline. Say whether the image uses schematic or
locally loaded stock lettering and whether it was checked on hardware.
Link sources and preserve third-party licence notices. Original contributions
are offered under the repository’s [MIT licence](LICENSE).

## What Never To Add

Do not add firmware, TE code, `opfont.svg`, kerning databases, extracted glyph
geometry, font atlases, baked stock-font vector exports or reusable TE artwork.
The selected, attributed manual quotations are reference material, not component
assets; retain their notices. Any new quotation must sit beside specific analysis,
show only the screen area at the size needed, credit and link its manual source,
carry a notice excluding it from MIT and stay outside the skill, its references
and machine-readable rules. Use your own firmware locally; no firmware
resources are included or served here. Use invented
fixtures in tests. SDK adapters belong in an appropriately licensed project;
do not paste GPL SDK code into this MIT kit.

## Local Commit Checks

Use Node 22 or later, Python 3 and [gitleaks](https://github.com/gitleaks/gitleaks#installing).
Run `npm ci` once after cloning. Its `prepare` script installs the tracked
`.githooks/` dispatcher in Git's shared hooks directory.

Every commit checks staged files for private resources, scans staged changes
with gitleaks and checks whitespace. A missing gitleaks executable stops the commit.

The resource check reads Git's index, including files added with `git add -f`.
It rejects firmware and compiled binaries (`.op1`, `.op1p`, `.knl`, `.ldr`, `.elf`,
`.bin`, `.nand`, `.otp` and `.o`), stock font resources, private directories,
font atlases, SVG font data and symlinks. Filename checks are case-insensitive.
These checks catch common mistakes; they cannot identify every renamed firmware
blob or determine the rights to arbitrary artwork.

```sh
npm run precommit       # check the current staged changes
npm run check:assets    # check all tracked index entries
npm run check:secrets   # scan local Git history with redacted findings
npm run test:guards    # exercise the resource guard with invented fixtures
```

CI also checks all tracked assets. Keep firmware and
local font inputs outside the public checkout.

## Design And Checks

Read [Design](op1-ui/docs/DESIGN.md), [Patterns](op1-ui/docs/EXAMPLES.md),
[Fonts](op1-ui/docs/FONTS.md) and [Graphics](op1-ui/docs/GRAPHICS.md).
Keep `skills/op1-design/SKILL.md` as the short reference index. Edit detailed
guidance in its references, token values in `references/design-kit.json` and
visual source in `op1-ui/src/interaction-examples.mjs`, then run:

```sh
python3 op1-ui/tools/sync_tokens.py
python3 op1-ui/tools/sync_skill.py
node --test op1-ui/tests/*.test.mjs
python3 -m unittest discover -s op1-ui/tests
node op1-ui/tools/check_layout.mjs
node op1-ui/tools/export_examples.mjs
python3 op1-ui/tools/check_svg.py op1-ui/examples/*.svg
node skills/op1-design/scripts/check_scene.mjs skills/op1-design/references/visuals/formats-first.json
git diff --check
```

Inspect the preview at its intended size and enlarged. Check long values,
missing glyphs, unit changes and the states affected by your change. Report
native performance with relevant device measurements; smaller files or faster
host renders alone do not establish a device improvement.

For font checks and public example rendering, install the pinned Python
dependencies from `op1-ui/tools/requirements-preview.txt` in your environment.
Rebuild public PNGs with `python3 op1-ui/tools/render_preview.py`; it uses only
the bundled Iosevka font. Keep its OFL notice and profile with the font. Stock
lettering renders are private checking output and must not replace public PNGs.
