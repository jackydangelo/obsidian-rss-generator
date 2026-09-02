import { App, TFile } from "obsidian";
import type { RssGeneratorSettings } from "./settings";

export interface FeedItemData {
  title: string;
  link: string;
  pubDate: string;
  description: string;
}

// --- typed frontmatter extraction ----------------------------------------
//
// Obsidian's frontmatter cache is typed `any`, so every field read needs to
// be narrowed before it's trusted. These helpers are the only place that
// touches the raw, untyped object.

interface NoteFrontmatter {
  rss: boolean;
  date: string;
  title?: string;
  description?: string;
}

const asString = (value: unknown): string | undefined =>
  typeof value === "string" ? value : undefined;

const readFrontmatter = (
  app: App,
  file: TFile,
  datePropertyName: string
): NoteFrontmatter | null => {
  const raw: unknown = app.metadataCache.getFileCache(file)?.frontmatter;
  if (typeof raw !== "object" || raw === null) return null;

  const record = raw as Record<string, unknown>;
  const date = asString(record[datePropertyName]);
  if (record.rss !== true || !date) return null;

  return {
    rss: true,
    date,
    title: asString(record.title),
    description: asString(record.description),
  };
};

// --- filtering: rss: true anywhere in the vault, nothing else matters ---

export const getRssFiles = (app: App, settings: RssGeneratorSettings): TFile[] =>
  app
    .vault.getMarkdownFiles()
    .filter((file) => readFrontmatter(app, file, settings.datePropertyName) !== null);

// --- building item data --------------------------------------------------

export const buildItemData = (
  app: App,
  file: TFile,
  settings: RssGeneratorSettings
): FeedItemData => {
  const frontmatter = readFrontmatter(app, file, settings.datePropertyName);
  const title = frontmatter?.title ?? file.basename;
  const slug = file.basename.toLowerCase().replace(/\s+/g, "-");
  const date = new Date(frontmatter?.date ?? file.stat.ctime);
  const description = frontmatter?.description ?? "";

  return {
    title,
    link: `${settings.siteUrl.replace(/\/$/, "")}/${slug}/`,
    pubDate: date.toUTCString(),
    description,
  };
};

// --- XML rendering ---------------------------------------------------------

const escapeXml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const renderItem = (item: FeedItemData): string => `
  <item>
    <title>${escapeXml(item.title)}</title>
    <link>${escapeXml(item.link)}</link>
    <guid>${escapeXml(item.link)}</guid>
    <pubDate>${item.pubDate}</pubDate>
    <description>${escapeXml(item.description)}</description>
  </item>`;

export const buildFeedXml = (
  items: FeedItemData[],
  settings: RssGeneratorSettings
): string => {
  const sorted = [...items].sort(
    (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  );
  const limited = sorted.slice(0, settings.maxItems);

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>${escapeXml(settings.siteTitle)}</title>
  <link>${escapeXml(settings.siteUrl)}</link>
  <description>${escapeXml(settings.siteDescription)}</description>
${limited.map(renderItem).join("\n")}
</channel>
</rss>
`;
};

export const generateFeed = (app: App, settings: RssGeneratorSettings): string => {
  const files = getRssFiles(app, settings);
  const items = files.map((file) => buildItemData(app, file, settings));
  return buildFeedXml(items, settings);
};