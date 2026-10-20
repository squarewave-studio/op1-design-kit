# For Agents

The kit includes **op1-design**, an installable skill that gives your coding
agent the screen rules, bundled preview font, stock-font setup and original
visual examples. Use it with Claude Code, Cursor, Pi or OpenCode through the
[Skills CLI](https://github.com/vercel-labs/skills#install-a-skill).

## Install From GitHub

From your firmware project, run:

```sh
npx skills add squarewave-studio/op1-design-kit
```

Select **op1-design**, choose your coding agent and install it for the project.
The CLI fetches the skill directly from this GitHub repository and puts it in
the agent’s skill directory. It requires Node.js 22.20 or later with `npx`.
See the CLI’s [supported agents](https://github.com/vercel-labs/skills/blob/main/docs/agents.md)
for other tools and installation paths.

[skills.sh](https://skills.sh/) is a directory for discovering skills. You do
not need an account or a directory listing to install from this repo. Once
installed, the kit’s guidance and original visual references are local files.

## Use The Skill

Ask your agent to use **op1-design** for the task. For example:

> Use op1-design to design an original OP-1 resonator screen. Keep encoder
> ownership clear, reserve space for complete values and show the rest and
> active states. Use the bundled Iosevka font for shareable previews and check
> text boundaries in each state.

The skill opens with a short reference index. It loads the guidance and visual
pair relevant to the task rather than every document at once. It also explains
where to look in your existing local firmware or TE’s official manual when
more stock design examples are useful. The Iosevka preview font and its OFL
licence are included. Firmware, stock font resources and manual images are
not bundled.

## Explore And Verify A Design

For an open brief, ask the agent to use the kit’s
[creative prompts](../../skills/op1-design/references/IDEATION.md) to explore
original visual directions with you. The ideas start from the sound and the
player’s task. Stock patterns help explain the choices without dictating
the layout.

The [verification guide](../../skills/op1-design/references/VERIFICATION.md)
covers host screenshots, image inspection, boundary states and what still needs
hardware testing. The installed skill includes local font, SVG and scene
checkers. It uses your project’s preview and the agent’s available capture tools.

## What Is Included

- [Local-resource instructions for your agent](../../skills/op1-design/references/LOCAL-RESOURCES.md): finding a private firmware folder and explaining unpacking when needed.
- [The skill entrypoint](../../skills/op1-design/SKILL.md), with its reference index and version.
- [Design rules](../../skills/op1-design/references/SPEC.md) and [design-kit.json](../../design-kit.json), shared with the site and code constants.
- [Bundled preview font](../../skills/op1-design/references/PREVIEW-FONT.md), with browser and static rendering helpers.
- [Font setup](../../skills/op1-design/references/FONTS.md), [icons](../../skills/op1-design/references/ICONS.md) and [graphics guidance](../../skills/op1-design/references/GRAPHICS.md).
- [Original visual examples](../../skills/op1-design/references/VISUALS.md) and [state contracts](../../skills/op1-design/references/visuals/examples.json), with local PNGs, schematic SVGs and scene data.

## Install Manually

Copy the complete `skills/op1-design` folder from this repo into your agent’s
skills directory, including its references and scripts. See the
[supported-agent paths](https://github.com/vercel-labs/skills/blob/main/docs/agents.md).
This preserves the same guidance without using the CLI.
