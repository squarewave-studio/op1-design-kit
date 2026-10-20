# Find The User’s Local Stock Resources

Use this workflow when the task needs a stock-font check or more stock design
references. For shareable host previews, use the bundled
[Iosevka profile](PREVIEW-FONT.md); no firmware location is needed.

## Locate Existing Files

Start with an existing local unpacked copy of the user’s original OP-1
firmware. Use a location already supplied in the project or conversation. If
stock resources are needed and the location is unknown, ask the user where
their private firmware folder is. Do not assume a machine-specific path or
search unrelated folders.

Look for package-relative `content/display/opfont.svg` and
`content/kerntable.db`. Within the supplied folder, for example:

```sh
rg --files --hidden --no-ignore /absolute/private/firmware-work \
  -g opfont.svg -g kerntable.db
```

Check filenames locally rather than downloading somebody’s extracted font.
Keep the source files and derived font data outside the public repository and
the preview server’s public directory.

## When No Unpacked Copy Is Available

Explain that the user can obtain their own original OP-1 firmware from
[TE’s official downloads](https://teenage.engineering/downloads/op-1) and follow
[op1repacker’s documented setup and unpack procedure](https://github.com/op1hacks/op1repacker#usage).
Use that project’s instructions for prerequisites, commands and output paths;
do not invent an unpack command or treat this reference as authorisation to
install tools or operate a device.

If the stock check cannot be completed, state that limit and continue the
parts of the task that can use Iosevka. Do not require a stock font just to
explore a composition, and do not label a placeholder render as stock lettering.

## Inspect The Relevant Resource

Read [Fonts And Previews](FONTS.md) for text IDs, punctuation, spacing and local
inspection commands, or [Icons And Symbols](ICONS.md) for the symbol namespace.
Those technical guides are shared with the human-facing documentation. Treat
references to local firmware or a private font as the user’s resources.

For additional design examples, establish the firmware version and inspect
only the relevant screen family, text templates and named groups. Consult
[Finding More Stock Examples](STOCK.md#finding-more-stock-examples) or the
[official original OP-1 manual](https://teenage.engineering/guides/op-1/original)
when useful. Distinguish a static resource from observed runtime behaviour.
Do not copy stock artwork, font geometry or manual images into the output.
