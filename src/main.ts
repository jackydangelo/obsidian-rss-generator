import { Notice, Plugin, TFile } from "obsidian";
import { generateFeed } from "./feed";
import {
  DEFAULT_SETTINGS,
  RssGeneratorSettings,
  RssGeneratorSettingTab,
} from "./settings";

export default class RssGeneratorPlugin extends Plugin {
  settings!: RssGeneratorSettings;

  async onload() {
    await this.loadSettings();

    this.addCommand({
      id: "generate-rss-feed",
      name: "Generate RSS feed",
      callback: async () => {
        await this.writeFeed();
      },
    });

    this.addSettingTab(new RssGeneratorSettingTab(this.app, this));
  }

  async writeFeed() {
    const xml = generateFeed(this.app, this.settings);
    const path = this.settings.outputPath;

    const existing = this.app.vault.getAbstractFileByPath(path);
    if (existing instanceof TFile) {
      await this.app.vault.modify(existing, xml);
    } else {
      await this.app.vault.create(path, xml);
    }

    new Notice(`RSS feed written to ${path}`);
  }

  async loadSettings() {
    const saved: unknown = await this.loadData();
    const savedSettings =
      typeof saved === "object" && saved !== null
        ? (saved as Partial<RssGeneratorSettings>)
        : {};
    this.settings = Object.assign({}, DEFAULT_SETTINGS, savedSettings);
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}