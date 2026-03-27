# SHADOWWEAVE — Dark Narrative Studio

## Story Modes (27+ total)
- **Heroine Forge** — 181+ heroines (Marvel/DC/CW/The Boys/PR/Animated/Star Wars/TV), 67 villains, 4-step wizard, multi-chapter AI story
- **Celebrity Captive** — 100 actresses, captor builder, streaming AI story
- **Custom Scenario** — Full character builder + captor profiler
- **Daily Dark Scenario** — Daily seeded scenario with multi-chapter continuation
- **Mind Break Chamber** — 5-phase psychological breaking, psyche tracking
- **Two Heroines, One Cell** (DualCapture) — Dual captive scenario with dynamic between them
- **Rescue Gone Wrong** — Second heroine attempts rescue and fails; both captured
- **Power Drain Mode** — Systematic stripping of powers with live drain % meter
- **Mass Capture Mode** — 3–5 heroines, one dominant villain, group dynamics, collective breaking
- **Corruption Arc** — 7-chapter arc tracking heroine's loyalty from 100% → 0%; she genuinely switches sides
- **Betting Pool** — Villain syndicate wagers on who breaks the heroine first; live resistance tracking
- **Villain Team-Up** — Two villains with shifting alliance dynamics
- **Chain of Custody** — Heroine transferred between captors with escalating conditions
- **Long Game** — Slow arc across days/weeks/months with public cover story
- **Dark Mirror** — Psychological corruption arc turning heroine toward villain's worldview
- **Arena Mode** — Combat showcase with crowd interaction and match rules
- **The Handler** — Clinical ownership relationship with compliance tracking
- **Trophy Display** — Heroine exhibited with visitor interaction levels
- **Obedience Training** — Conditioning via philosophy (punishment/reward/psychological)
- **Showcase Mode** — Power demonstration / pre-auction preview events
- **Public Property** — Identity exposure with varying anonymity levels
- **Hero Auction** — Live bidding, sealed bids, or private negotiation
- **Interrogation Room** — Real-time role-play chat with extraction targets and captor AI

## Utility Tools
- Interrogation Room (phase-based chat), Captor Logic Sim, Sounding Board, Scenario Engine, Character Mapper, Captor Configuration, Story Archive

## Key Features
- **Step 2 Config Panels** — All 19 specialist modes have OutfitSelector + Scene Parameters (mode-unique options) + UniversalOptions (Tone/Pacing/POV/Restraint/Dialogue) + StoryLengthPicker in step 2 before generating
- **Story Length** — Short (0.6×) / Standard / Long (1.5×, max 2200 tokens) controlled by `resolveTokens()` in ai.ts; `storyLength` sent in all fetch bodies; all 21 doStream calls use `resolveTokens(base, req.body)` in story.ts
- **Outfit Selector** — 60+ outfits with damage levels; sends `outfitContext` string to backend on every generate
- **Universal Narrative Controls** — Tone / Pacing / POV / Restraint / Dialogue sent as `universalContext` to all story endpoints
- **Scene Parameters** — Mode-unique option panels (e.g. Audience Type, Handler Tone, Alliance Stability, Transfer Method, etc.) sent as `modeContext`
- **Custom Heroine Builder** — Create your own heroines saved to localStorage, appear in Heroine Forge picker (CUSTOM tab)
- **Favorite Heroines** — Star any heroine in Heroine Forge; favorites sorted first in grid, persisted to `sw_favorites_v1` localStorage key
- **Heroine Lore Cards** — Click ℹ on any hero card to see a modal with powers, alias, universe, known vulnerabilities, and favorite toggle
- **Intensity Slider** — Tense / Explicit / Brutal 3-level control in Heroine Forge Step 3; bakes into system prompt
- **Chapter Regeneration** — ↻ Re-roll button on each chapter in Heroine Forge; calls `/story/superhero-regen` with context
- **Random Picker** — One-click randomize heroine + villain in Heroine Forge
- **Export TXT/PDF** — All story modes support export; PDF is print-ready with Cinzel/Garamond fonts
- **Story Archive** — localStorage archive with search, tags, favourites, sort (newest/oldest/words/alpha/top-rated), export, star ratings, and copy to clipboard
- **Recently Visited Modes** — homepage "Jump Back In" chip row (last 6 modes); tracked via `sw_recent_modes_v1`; powered by `lib/recentModes.ts`
- **Studio Stats Bar** — homepage live stats (total stories, words, heroines used, modes tried) computed from archive; visible once ≥1 story exists
- **Star Ratings** — 1–5 star rating on each archived story; shown in card header; sortable; "Top Rated" sort option in archive
- **Dual AI Providers** — Venice AI (`venice-uncensored-role-play`) or NovelAI (`kayra-v1`); toggled via bottom-left badge; persisted to `sw_ai_provider_v1` localStorage; all 27 story endpoints + soundboard + plottwist support both providers
- **Anti-Repetition** — `frequency_penalty: 0.42` + `presence_penalty: 0.32` baked into all Venice calls via `lib/ai.ts`
- **AiProviderBadge** — fixed bottom-left overlay; shows active engine with glow; click to toggle; Venice=violet, NovelAI=green
- **Mobile CSS** — Comprehensive mobile responsive styles in `index.css` (safe-area insets, sticky generate button, touch targets, pill scrolling, responsive grids)
- 4 visual themes: Void / Cold Blue / Candlelight / Glitch

# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   └── api-server/         # Express API server
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers; `src/routes/health.ts` exposes `GET /health` (full path: `/api/health`)
- Depends on: `@workspace/db`, `@workspace/api-zod`
- `pnpm --filter @workspace/api-server run dev` — run the dev server
- `pnpm --filter @workspace/api-server run build` — production esbuild bundle (`dist/index.cjs`)
- Build bundles an allowlist of deps (express, cors, pg, drizzle-orm, zod, etc.) and externalizes the rest

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Exports a Drizzle client instance and schema models.

- `src/index.ts` — creates a `Pool` + Drizzle instance, exports schema
- `src/schema/index.ts` — barrel re-export of all models
- `src/schema/<modelname>.ts` — table definitions with `drizzle-zod` insert schemas (no models definitions exist right now)
- `drizzle.config.ts` — Drizzle Kit config (requires `DATABASE_URL`, automatically provided by Replit)
- Exports: `.` (pool, db, schema), `./schema` (schema only)

Production migrations are handled by Replit when publishing. In development, we just use `pnpm --filter @workspace/db run push`, and we fallback to `pnpm --filter @workspace/db run push-force`.

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`). Running codegen produces output into two sibling packages:

1. `lib/api-client-react/src/generated/` — React Query hooks + fetch client
2. `lib/api-zod/src/generated/` — Zod schemas

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec (e.g. `HealthCheckResponse`). Used by `api-server` for response validation.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec (e.g. `useHealthCheck`, `healthCheck`).

### `scripts` (`@workspace/scripts`)

Utility scripts package. Each script is a `.ts` file in `src/` with a corresponding npm script in `package.json`. Run scripts via `pnpm --filter @workspace/scripts run <script>`. Scripts can import any workspace package (e.g., `@workspace/db`) by adding it as a dependency in `scripts/package.json`.
