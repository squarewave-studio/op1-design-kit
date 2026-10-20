# Publish With GitHub Pages

The design kit publishes from `squarewave-studio/op1-design-kit` to
**https://squarewave-studio.github.io/op1-design-kit/**. The
[Pages workflow](../../.github/workflows/pages.yml) builds the site from the
maintained skill references and the original example assets. No separate
`gh-pages` branch, custom domain or personal access token is needed.

## What The Workflow Does

The build first runs the shared public-asset safety workflow: it rejects
private resources from the Git index and tests that guard with invented fixtures.
Gitleaks runs locally through the pre-commit hook. The site build waits for those checks to pass.

Pull requests and relevant pushes to `main` then run the portable tool tests, source
checks, layout checks and conservative SVG checks. The workflow regenerates
the original SVG/state exports and checks that they match the committed files.
It then builds the static site, checks its links under `/op1-design-kit/` and uploads
only `out/pages/` as a Pages artifact, retained for seven days.

The build uses Python 3.12, Node 22 and Markdown 3.7. Saved example PNGs are
already in the repo; CI does not need firmware or a stock font. The artifact
includes the installed skill files and separately noticed website references.
It does not include the checkout, private inputs or local test output.

The share image uses the kit title, SquareWave mark and four encoder colours.
Rebuild it with `python3 op1-ui/tools/render_share.py`, using the pinned font
requirements and `rsvg-convert` from librsvg. It writes the 1200×630 PNG and
editable SVG source from the bundled Archivo font and original geometry.
`og-design-kit.png` is the current metadata URL; `og.png` keeps the same image
for older links. The build adds image dimensions, alt text and large-card
metadata to every page. Sharing sites control their own layout and caching,
so an existing post may keep an older preview until it is fetched again.

Deployment runs only in this repository, from `main`, after a successful build
and with `ENABLE_DESIGN_KIT_PAGES=true`. Pull requests never deploy. Manual
runs default to **build only**, even when the repository variable is enabled.
Official GitHub Actions are pinned to specific commit IDs in the workflow.

## Configure The Repository

A repository administrator performs these one-time steps when ready to publish:

1. Merge the workflow and site sources into `main`.
2. In **Settings → Pages → Build And Deployment**, select **GitHub Actions**
   as the source. The workflow does not automatically enable Pages.
3. Configure the **github-pages** deployment environment to allow only `main`.
   Add a required reviewer if deployments should wait for a person’s approval.
4. In **Settings → Secrets And Variables → Actions → Variables**, create
   `ENABLE_DESIGN_KIT_PAGES` with the value `true`.
5. Run **Actions → Design Kit Pages → Run Workflow** on `main`, with
   **Deploy After Checks** selected. Check the environment URL after deployment.

For a pre-publication artifact, run the workflow with **Deploy After Checks**
left off and download the `github-pages` artifact. Enabling the variable alone
does not start a deployment. Subsequent relevant pushes to `main` deploy
automatically while the variable is enabled, subject to environment protection.
The repository and organisation must permit the official `actions/*` actions.

The deploy job uses the automatic `GITHUB_TOKEN`, with `pages: write` and
`id-token: write`. The build job has only `contents: read`. No publishing
credential is stored in this repo.

See GitHub’s [publishing-source setup](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
and [custom Pages workflow guide](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
for the repository settings and environment rules.

## Updates And Rollback

A site or skill change goes through a pull request and the same checks. After
merging to `main`, the workflow publishes the new artifact. Different PR builds
do not cancel a production deployment; runs on `main` are serialised.

To roll back, revert the affected source change through the normal review
process and publish that revision. Set `ENABLE_DESIGN_KIT_PAGES=false` to stop
future deployments. That setting does not remove an already published site.

## Skill Distribution

The skill is distributed directly from this GitHub repo. It does not depend on
GitHub Pages or a skills.sh listing:

```sh
npx skills add squarewave-studio/op1-design-kit
```

After the source is published, the CLI can discover `skills/op1-design/SKILL.md`
and install its references and local checking tools. The Pages workflow checks
that same package; it does not publish a separate npm package or skill registry
release. See [installation and usage](AGENT-SKILL.md).

## Local Maintainer Checks

Use `npm ci` to install the tracked `.githooks/` dispatcher into Git’s shared
hooks directory. It uses the current checkout’s checks, so linked worktrees
run their own branch checks. Existing pre-commit hooks are preserved and chained;
an unrelated custom hooks path needs to be resolved before installation.

The maintainer hook checks staged public assets, requires local gitleaks and
checks whitespace. Gitleaks does not run in CI. `npm run setup:hooks` reinstalls
the dispatcher. The public-asset guard also runs on pull requests.
