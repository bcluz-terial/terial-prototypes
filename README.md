# Terial Prototype Workspace

Hosted HTML mockup workspace for product feedback (backlog #150). Turns Product Feedback Ledger entries into shareable visual concepts the product team can react to in minutes. Modeled on the design team's workspace at `h12312315.github.io/terial-ai`.

## Rules

1. **Every prototype carries the `.proto-banner`** ("PROTOTYPE — concept, not spec"). Never remove it — a concept sketch must not be readable as committed scope.
2. **No prospect data on this site.** GitHub Pages is public. Prospect workflow maps (company names, verbatims, process detail) live vault-local only. This workspace carries generic Terial feature mockups.
3. **Plain HTML only.** One file per prototype, tokens CSS linked, inline vanilla JS for schematic interactions. No TypeScript, no build step, no libraries.
4. **`terial-tokens.css` is vendored, not owned.** Canonical source: https://h12312315.github.io/terial-ai/terial-tokens.css — re-sync if the design team updates it; never hand-edit. Workspace styles go in `workspace.css`.

## Structure

```
index.html            workspace shell — nav groups mirror the Ledger categories;
                      the skill edits only the NAV:START/NAV:END block
terial-tokens.css     vendored design tokens + component classes
workspace.css         shell layout + shared prototype chrome (.proto-banner, .proto-page)
design-system.html    token/component reference
prototypes/
  _template.html      starter — copy per prototype: {slug}.html
```

## Adding a prototype (manual, until the skill ships)

1. Copy `prototypes/_template.html` → `prototypes/{slug}.html`.
2. Fill the provenance block (Ledger entry, type, sources, date) and build the concept from tokens classes.
3. Add `{ title, path }` to the matching group in the `NAV` block of `index.html`.
4. Commit + push — Pages redeploys automatically.
5. Paste the live URL into the Ledger entry's Prototype Link field (Notion).

Session 2 of #150 replaces steps 1–5 with the `product-prototype-builder` skill.

## One-time setup (Brian's machine)

```bash
cd ~/Desktop/Terial/terial-prototypes   # after copying this folder there
git init && git add -A && git commit -m "Prototype workspace scaffold (#150 Session 1)"
gh repo create terial-prototypes --public --source=. --push
# or: create empty repo on github.com, then
# git remote add origin git@github.com:{user}/terial-prototypes.git && git push -u origin main
```

Then GitHub → repo → Settings → Pages → Deploy from branch → `main` / root. Site lands at `https://{user}.github.io/terial-prototypes/`.

Verify locally first: `open index.html` (nav + iframe routing work over file://).
