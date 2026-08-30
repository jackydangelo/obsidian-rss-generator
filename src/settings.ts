import { App, PluginSettingTab, Setting } from "obsidian";
import type RssGeneratorPlugin from "./main";

export interface RssGeneratorSettings {
  outputPath: string;
  siteTitle: string;
  siteUrl: string;
  siteDescription: string;
  maxItems: number;
}

export const DEFAULT_SETTINGS: RssGeneratorSettings = {
  outputPath: "feed.xml",
  siteTitle: "",
  siteUrl: "",
  siteDescription: "",
  maxItems: 20,
};

export class RssGeneratorSettingTab extends PluginSettingTab {
  plugin: RssGeneratorPlugin;

  constructor(app: App, plugin: RssGeneratorPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName("Output path")
      .setDesc("Where to write the feed, relative to vault root (e.g. Feed.xml, public/feed.xml)")
      .addText((text) =>
        text.setValue(this.plugin.settings.outputPath).onChange(async (value) => {
          this.plugin.settings.outputPath = value;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl).setName("Site title").addText((text) =>
      text.setValue(this.plugin.settings.siteTitle).onChange(async (value) => {
        this.plugin.settings.siteTitle = value;
        await this.plugin.saveSettings();
      })
    );

    new Setting(containerEl).setName("Site URL").addText((text) =>
      text.setValue(this.plugin.settings.siteUrl).onChange(async (value) => {
        this.plugin.settings.siteUrl = value;
        await this.plugin.saveSettings();
      })
    );

    new Setting(containerEl).setName("Site description").addText((text) =>
      text.setValue(this.plugin.settings.siteDescription).onChange(async (value) => {
        this.plugin.settings.siteDescription = value;
        await this.plugin.saveSettings();
      })
    );

    new Setting(containerEl)
      .setName("Max items")
      .setDesc("Maximum number of items in the feed.")
      .addText((text) =>
        text
          .setValue(String(this.plugin.settings.maxItems))
          .onChange(async (value) => {
            const parsed = parseInt(value, 10);
            this.plugin.settings.maxItems = Number.isNaN(parsed) ? 20 : parsed;
            await this.plugin.saveSettings();
          })
      );
  }
}