# AGENTS.md

Context for AI coding agents working in this repo.

## What this is

An Obsidian plugin that generates a static RSS feed from notes marked `rss: true` in frontmatter. Generator-agnostic by design — it only produces `feed.xml`; it has no knowledge of Jekyll, Quartz, Eleventy, or any other static site generator.

## Architecture

```
src/
├── main.ts       Plugin entry point: command registration, settings load/save, file write
├── feed.ts        Pure functions: filter notes, build feed items, render XML
└── settings.ts    PluginSettingTab + settings interface/defaults
```

`feed.ts` is intentionally free of Obsidian side effects beyond reading `App`/`TFile` — it takes app + settings in, returns strings out. Keep it that way; it's the part most worth unit testing in isolation.

## Key conventions

- **No folder-based publishing.** Do not reintroduce a `sourceFolder` setting or any path-based filtering. The only publishing signal is `rss: true` in a note's frontmatter, checked anywhere in the vault.
- **Typed frontmatter extraction.** Obsidian's `frontmatter` cache is `any`. All raw frontmatter reads go through `readFrontmatter()` in `feed.ts`, which narrows to `NoteFrontmatter` via `asString()`. Do not read `frontmatter.x` directly elsewhere — it will fail `@typescript-eslint/no-unsafe-*` lint rules.
- **Filter before map.** `getRssFiles` filters first (valid frontmatter), then `buildItemData` maps. Don't collapse these into a single pass with inline conditionals — keep the two responsibilities separate.
- **Manual generation only.** The feed is written on explicit command invocation (`Generate RSS feed`), not on save or via a watcher. Don't add automatic/background generation without discussing it first — it's a deliberate scope boundary, not an oversight.
- **Minimal, single-purpose.** No settings or code paths beyond what's needed for: read frontmatter → build items → render XML → write file. Resist adding configuration surface (e.g. custom XML templates, multiple feeds, category tags) unless explicitly requested.

## Known deferred issue

`obsidianmd/settings-tab/prefer-setting-definitions` lint warning is intentionally not fixed. The declarative settings API for Obsidian 1.13+ is not yet stably documented; migrating now would mean rewriting against a moving target. Revisit once 1.13 API docs stabilize (same deferral as in `obsidian-property-from-backlink`). Note: this plugin itself was originally scaffolded as "Folder to RSS" before being renamed to "RSS Generator" once the folder-based filtering was dropped — the id/name in `manifest.json` and repo name may lag behind if you're reading this mid-rename.

## Build & verify

```bash
npm run build   # tsc -noEmit -skipLibCheck && node esbuild.config.mjs production
npm run lint    # eslint .
```

Both should pass with zero errors before considering a change complete. One warning (above) is expected and acceptable.

## Testing a change to feed.ts

There's no test suite yet. When changing filtering or rendering logic, manually verify with a vault fixture that includes:
- A note with `rss: true` and valid `date` → should appear
- A note with `rss: true` but no `date` → should be excluded
- A note with `date` but no `rss: true` → should be excluded
- A note with `rss: false` → should be excluded