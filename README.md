# RSS Generator

Generate a static `feed.xml` from Obsidian notes, for use with any static site generator (Jekyll, Quartz, Eleventy, or anything else that can serve a static file).

## Why

Most RSS solutions are tied to a specific site generator or require a folder-based publishing structure. This plugin does neither: mark any note anywhere in your vault with `rss: true`, run one command, get a valid RSS 2.0 feed. What you do with the resulting file is up to your own build/deploy pipeline.

## Usage

Add to a note's frontmatter:

```yaml
---
title: "Post title"
date: 2026-08-30
description: "Optional summary"
rss: true
---
```

`rss: true` and the configured date property (`date` by default — see Settings) are required. `title` falls back to the filename; `description` falls back to an empty string.

Run **"Generate RSS feed"** from the command palette. The plugin scans the whole vault, filters to notes with `rss: true` and a valid date value in the configured date property, sorts by date descending, and writes the feed to the configured output path (creating or overwriting as needed).

## Settings

| Setting | Description |
|---|---|
| Output path | Where to write the feed, relative to vault root (e.g. `feed.xml`, `public/feed.xml`) |
| Site title | `<title>` of the RSS channel |
| Site URL | `<link>` of the channel, also used to build item links |
| Site description | `<description>` of the channel |
| Date property name | Frontmatter property to read as the publish date (default: `date`; e.g. `created` if you use Obsidian's creation-date property) |
| Max items | Maximum number of items included in the feed |

## Design notes

- No folder concept — publishing is opt-in per note via frontmatter, not location.
- No generator-specific output — this plugin only produces a standard `feed.xml`; getting it into your built site is a separate concern (git sync, build step, etc.).
- Generation is manual, on-demand (command palette), not automatic on save. Keeping it explicit avoids a hidden watcher running in the background.

## Development

```bash
npm install
npm run build   # tsc -noEmit -skipLibCheck && esbuild.config.mjs production
npm run lint
```

Known deferred lint warning: `obsidianmd/settings-tab/prefer-setting-definitions` — the settings tab uses the standard `PluginSettingTab`/`Setting` API rather than the declarative settings API, pending stable documentation for Obsidian 1.13+.