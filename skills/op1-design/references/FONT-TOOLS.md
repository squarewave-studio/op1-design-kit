# Font Tools For Agents

Read this when preparing an Iosevka preview or diagnosing a missing font tool.
Resolve paths from the installed skill folder, not from the kit repository.
Use the project’s existing tools when they already cover the task. Install only
what the chosen render route needs, within the session’s permissions.

## Choose A Render Route

| Output | Tools needed | Extra packages |
| --- | --- | --- |
| Browser preview | A modern browser, a local HTTP server and the bundled browser adapter | No font packages or system font installation. Use the existing preview server. |
| Measured host SVG | Python 3.11 or later, a virtual environment and Node.js with ES module support | The pinned Python packages in `scripts/requirements-preview.txt`. Node runs the bundled layout check; no npm packages are needed. |
| PNG from that SVG | The measured SVG route plus a browser capture tool or `rsvg-convert` | `rsvg-convert` is optional unless using the repository’s batch PNG renderer. |
| Local stock-font inspection | Python and the owner’s private font files | The inspector uses the standard library. Iosevka packages are not required for this separate check. |

The skill includes four WOFF2 weights, their licence, the size/variant profile,
per-weight metrics and adapters. Use XS 400, S 300, M/L 200 and XL/XXL 100 for
host previews. Keep that mapping at every output scale; native emulator and
hardware lettering uses the platform’s stock text route.
There is no need to download Iosevka again, build it from source, install it as
a system font or obtain TE firmware for the Iosevka route. Keep the font’s OFL
notice with any copied font files.

## Browser Preview

Read [Host Preview Font](PREVIEW-FONT.md#browser-use) for the loader and selected
OpenType variants. Serve only the intended public preview assets. If copying the
adapter into a project, preserve its `assets/fonts/` and `scripts/lib/` relative
paths. Keep private firmware and stock font files outside the served directory.

Use a localhost URL or HTTPS: the loader verifies its bundled font with Web
Crypto. A plain HTTP LAN address may not provide that API. For phone testing,
use a suitable HTTPS preview or pre-rendered images rather than removing the
checksum check. Await `loadPreviewFont()` and apply the returned profile before
capturing. Inspect the issues returned by `applyPreviewFont()` and fix them.
Do not accept a screenshot of fallback lettering as a font-loaded preview.

## Measured SVG Setup

Check `python3 --version` and `node --version` first. Choose an available Python
3.11 or later and a maintained Node.js release. The Python helper invokes
`node` from PATH for its layout check, so Python packages alone are insufficient.

From the project’s working directory, set `SKILL_DIR` to the actual installed
folder. Create an ignored local virtual environment or reuse a compatible project
environment. The following POSIX-shell example does not modify system Python:

```sh
SKILL_DIR=/absolute/path/to/installed/op1-design
python3 -m venv .venv-op1-preview
.venv-op1-preview/bin/python -m pip install -r "$SKILL_DIR/scripts/requirements-preview.txt"
.venv-op1-preview/bin/python -c 'import fontTools, brotli, zopfli; print(fontTools.__version__)'
node --version
mkdir -p out/op1-preview
.venv-op1-preview/bin/python "$SKILL_DIR/scripts/preview_font.py" \
  "$SKILL_DIR/references/visuals/formats-first.json" \
  --svg out/op1-preview/font-smoke.svg
```

On Windows, use the virtual environment’s `Scripts/python.exe` and equivalent
shell path syntax. Keep the environment and generated output out of Git.
The requirements file travels with the installed skill; a full repository
checkout is not needed. It pins FontTools and the WOFF compression dependencies.
Use the same interpreter for installation and rendering.

After the smoke render passes, replace the sample scene path with the project’s
scene JSON. The helper checks the font checksum, selects the configured glyph
variants and checks measured text/artwork clearance before writing the SVG.
See [Verification](VERIFICATION.md#scene-input-format) for the scene format.
The output contains Iosevka outlines for host use; it is not native OP-1 SVG.

## Capture Pixels And Inspect Them

Use the project’s browser screenshot tool to capture the SVG, or check whether
`rsvg-convert --version` succeeds and rasterise it:

```sh
rsvg-convert -w 320 -h 160 -o out/op1-preview/font-smoke.png out/op1-preview/font-smoke.svg
```

The Python output already contains open-font outlines, so this rasteriser does
not need Iosevka installed through the operating system. If `rsvg-convert` is
missing, use a browser capture or install librsvg through the platform’s normal
package manager when permitted. Do not add another rendering stack just for an
optional capture. The repository’s `op1-ui/tools/render_preview.py` batch route
requires `rsvg-convert`; that batch script is not part of the portable skill.

Open the saved PNG with the available image-viewing tool. Check the whole screen
at 320 × 160 and an enlarged view, including `1`, `I`, `6`, `9`, punctuation,
complete value/unit strings and artwork clearance. Label captures **Iosevka
preview**. A passing process alone does not establish visual quality or native
font fit. Follow [Verification](VERIFICATION.md) for the relevant states.

## If Setup Fails

- `No module named fontTools`, `brotli` or `zopfli`: install the pinned requirements
  with the interpreter that will run the helper; confirm its virtual environment.
- `node` not found: make the project’s Node runtime available on PATH before
  running the Python helper, or use the browser route and its layout checks.
- Missing WOFF2 support: check the pinned compression packages in that same
  environment. The helper reads the bundled WOFF2 directly; conversion is unnecessary.
- Checksum or configured-variant failure: check that the font, profile, metrics
  and adapter came from the same skill version. Restore a complete installation;
  do not bypass verification, stretch glyphs or silently substitute a font.
- Browser load or Web Crypto failure: check asset URLs, HTTP responses and the
  localhost/HTTPS requirement before capturing.
- Bounds or artwork-clearance failure: fix the scene’s fields and composition;
  installing a different font is not a layout fix.

If installation or capture is unavailable, report the missing dependency and
which check remains unverified. Continue independent geometry checks; do not
claim the intended font was rendered. Package installation may need network
access; it does not require uploading project assets or private firmware.

Tool references: [FontTools installation](https://fonttools.readthedocs.io/en/latest/)
and [librsvg](https://gitlab.gnome.org/GNOME/librsvg).
