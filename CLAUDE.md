# Body in Space — working notes for the coding assistant

NASA Space Apps Challenge 2026 entry (challenge: health monitoring software for astronauts).
Team of school students, Astana. Talk to the team in Russian; everything in this repo and in the UI is English.

Live site: https://tuka2308.github.io/body-in-space/ (GitHub Pages, deploys on every push to `main`).
Local-only context (gitignored, Russian): `CONTEXT.md` (rules, thresholds, sources) and `RESEARCH.md`. Read `CONTEXT.md` first if it is present.

## Hard rules (breaking one loses global judging)

- English only in the repo, UI and submission.
- Say **SI** (Super Intelligence), never "AI".
- No photos, voices or likenesses of real people; no NASA logos, flags or mission patches.
- Disclaimer "Educational prototype. Not a medical device." stays visible. Simulated data is labelled "Simulated".
- Never invent medical numbers. Take them from `CONTEXT.md`; otherwise mark `// TODO: verify` and show "reference value" in the UI.
- No physician reviewed the content: keep the "team-designed" labels. Every "why it matters" number carries a source from `src/data/sources.ts`.
- Every library, dataset and icon goes into `REFERENCES.md`, with a "Use of Super Intelligence (SI)" section.

## Decisions already made

- Assistant is called KOMEK ("help" in Kazakh): offline, rule-based, no LLM API.
- No RU toggle, no chart/search/animation libraries (own SVG charts, own keyword search, CSS animation).
- Our score is "Space-NEWS2" = official NEWS2 + personal 7-day baseline + environment context. Describe it as the team's own method.
- Name concrete sources in the UI and submission: OSD-569/575/656, DONKI, NASA-STD-3001, NASA HRP.
- Commit after every stage. Feature freeze Sunday 2026-11-15 15:00 local; submission deadline 23:59.

## Stack and layout

Vite + React + TypeScript + Tailwind v4, Zustand, Vitest. `npm run dev`, `npm test`, `npm run build`.

- `src/engine/` scoring (NEWS2, baseline, thresholds, `assess.ts`) with tests
- `src/data/` thresholds, content (how / why / what to do), sources, crew, environments, tasks, SOS steps
- `src/sim/` seeded simulator and the deterioration scenario
- `src/si/` KOMEK knowledge base, search, replies (with tests)
- `src/state/` stores (`store.ts`, `sos.ts`, `komek.ts`), selectors, hash router
- `src/ui/` Dashboard, BodyMap, OrganCard, Measure, `sos/`, Komek, charts

Demo keys: `D` deterioration, `T` demo time x60, `Shift+R` reset. `?fresh=1` in the address starts from the untouched demo state.

## Status

Done: P0 (engine, simulator, dashboard, organ card, Measure, SOS, KOMEK) and P1 (self-tests, NASA OSDR lab view,
NASA DONKI space weather, daily missions, Remote clinic preset). `README.md`, `REFERENCES.md`, `SUBMISSION.md`,
`DEMO_SCRIPT.md` are written.

To do, in order:
1. Final self-check at 1280x800 and 1920x1080 on the deployed site, console clean, private window.
2. Optional P2: flight-surgeon split view ("Spacecraft | Earth"), PWA / offline install.
3. Keep `README.md`, `REFERENCES.md` and `SUBMISSION.md` in sync with any new feature or library.

Known issues: the DONKI solar-flare endpoint (FLR) returned 404 on 2026-11-14 while CME worked; the code tolerates it.
The public DONKI demo key is rate-limited (429), so the feed is cached and retried at most every 10 minutes.
OSD-656 is cited as reviewed but is not charted.
