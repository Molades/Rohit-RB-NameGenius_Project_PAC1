# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Product Anatomy live-session workspace for **NameGenius**: a business-name generator for solo founders. This folder is a lab, not a monorepo with a shared build. Several prototypes sit side by side; pick the one that matches the task.

## Layout

| Path | What it is |
|---|---|
| `index.html`, `app.js`, `style.css` | Vanilla prototype. Keyword → 10 names (Groq if a key is stored, else offline generator) → live `.com` RDAP checks. |
| `namegenius/` | Full React + Vite + Tailwind 3 app. Brief → results → shortlist / compare / questions. Names from `src/generator.js` (deterministic, no API). |
| `result-card-app/` | Later UI pass of the same flow. Mock pool in `src/data.js` (`pickBatch`). Dev server port **5178**. |
| `s3-card-app/` | Isolated **result card** gallery (available / taken / loading). Mock data only. Port **5190**. |
| `design/`, `wireframe/`, `s3-card/` | HTML / Paper canvas comps. Treat as visual references, not runtime code. |
| `.claude/skills/prompt-enhancer/` | Required brief (Bar / Reference / Limits / Check) before writing UI. |

There is no root `package.json`. Each Vite app has its own.

## Commands

```bash
# Vanilla prototype — open index.html, or any static server from repo root
python3 -m http.server 8080

# Full product (Tailwind 3, generator.js)
cd namegenius && npm install && npm run dev    # port 5180

# UI flow with mock names
cd result-card-app && npm install && npm run dev  # port 5178

# Result-card gallery
cd s3-card-app && npm install && npm run dev     # port 5190

# Lint (namegenius only — the other two apps have no lint script)
cd namegenius && npm run lint     # oxlint

# Production build (any Vite app)
npm run build      # outputs to <app>/dist
```

`.claude/launch.json` starts `result-card-app` and `s3-card-app` for Claude Code. There are no test suites in this repo. Ports are enforced in each app's `vite.config.js` (`strictPort: true` on `namegenius` and `s3-card-app` — the dev server fails rather than picking a new port if the port is taken).

## Product behavior (keep these)

- **Screens:** brief (name, description, competitors, TLD) → results → shortlist, compare (max 2), brand-discovery questions.
- **Regen:** after 3 regenerations without a shortlist/compare action, surface the next unanswered question inline; answering it regenerates.
- **TLDs:** `.com` / `.io` / `.co` (and `.ai` in some mocks). Availability is **mocked** in the React apps; only the vanilla `app.js` hits Verisign RDAP.
- **Vanilla AI:** optional Groq key in `localStorage` (`namegenius_groq_api_key`), model `llama-3.1-8b-instant`. Never commit keys.

## Architecture (React apps)

Both `namegenius/` and `result-card-app/` follow the same pattern: `App.jsx` owns all state (current view/screen, brief, shortlist, compare selection, brand-discovery answers, regen count, pending question) and passes it down as props — there's no router or state library. Screens read as a `switch`/conditional on a `view` string in `App.jsx` rather than as routes.

- The regen-before-question mechanic (`REGENS_BEFORE_QUESTION = 3`) lives in `App.jsx` in both apps — check both if changing that behavior.
- Item identity keys differ by app: `namegenius` name items use `slug`; `result-card-app`/`s3-card-app` mock items use `domain`. Match whichever the app already uses when adding dedupe/compare/shortlist logic.
- `namegenius` file layout is flatter (`Brief.jsx`, `Results.jsx`, `Screens.jsx` bundling Shortlist/Compare/Questions); `result-card-app` splits screens into `src/screens/`. Don't assume one app's file layout when editing the other.

## Code conventions

- React 19, Vite, JSX (no TypeScript). Prefer functional components and colocated state in `App.jsx`.
- Tailwind: `namegenius` uses v3 + PostCSS; `result-card-app` and `s3-card-app` use v4 via `@tailwindcss/vite`.
- Name items in `namegenius` look like `{ name, slug, tlds, tags }`. Helpers live in `src/data.js`; generation in `src/generator.js`.
- `namegenius` also has Figma preview entries (`mainFigma.jsx`, `ResultCardFigma.jsx`) — do not mix those into the main `main.jsx` tree unless asked.
- UI work: follow `.claude/skills/prompt-enhancer/SKILL.md` (approve a four-line brief, then build one screen).
- Verify UI in the browser (or the closest substitute) before calling a visual change done.

## Do not

- Treat design HTML as the source of truth for app logic.
- Add a backend, auth, or real domain APIs to the React apps unless the user asks.
- Install new dependencies without a reason that the current stack cannot cover.
- Commit `node_modules`, `.env`, or Groq keys.
