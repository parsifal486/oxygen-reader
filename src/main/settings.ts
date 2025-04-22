import { app } from 'electron'
import * as path from 'path'
import * as fs from 'fs'

// Define an interface for application settings
export interface Settings {
  theme: 'light' | 'dark' // Theme can be either 'light' or 'dark'
  appLanguage: string // Application language (e.g., 'en', 'fr')
  platform: string // Platform can be either 'darwin' or 'win32'
}

// Default settings if no settings file exists
const defaultSettings: Settings = {
  theme: 'light',
  appLanguage: 'en',
  platform: 'darwin'
}

// Class to manage application settings
export class SettingsManager {
  private settingsPath: string // Path to the settings file
  private settings: Settings // Current settings

  constructor() {
    // Get the user data directory path where settings.json will be stored
    const userDataPath = app.getPath('userData')
    this.settingsPath = path.join(userDataPath, 'settings.json')

    // Load existing settings or apply default settings
    this.settings = this.loadSettings()

    // Log the settings path and loaded settings for debugging
    console.log('settings==>', this.settingsPath, this.settings)

    // Get the platform
    this.settings.platform = process.platform
  }

  // Load settings from the file or return default settings if the file is missing or invalid
  private loadSettings(): Settings {
    try {
      if (fs.existsSync(this.settingsPath)) {
        // Read the settings file
        const data = fs.readFileSync(this.settingsPath, 'utf8')

        // Parse JSON data and return it as settings
        const savedSettings = JSON.parse(data)
        return savedSettings
      }
    } catch (error) {
      // Log any errors encountered while reading/parsing the settings file
      console.error('Error loading settings:', error)

      // Return default settings in case of an error
      return defaultSettings
    }

    // If settings file does not exist, create it with default settings
    this.saveSettings(defaultSettings)
    return defaultSettings
  }

  // Getter function to retrieve the current settings
  public getSettings(): Settings {
    return this.settings
  }

  public getSetting<K extends keyof Settings>(key: K): Settings[K] {
    return this.settings[key]
  }

  public updateSetting<K extends keyof Settings>(key: K, value: Settings[K]): void {
    this.settings[key] = value
    this.saveSettings(this.settings)
  }

  // Save the given settings to the settings file
  public saveSettings(settings: Settings): void {
    try {
      // Write settings to the file as formatted JSON
      fs.writeFileSync(this.settingsPath, JSON.stringify(settings, null, 2), 'utf8')
    } catch (error) {
      // Log any errors encountered while saving settings
      console.error('Error saving settings:', error)
    }
  }
}

// Create and export a single instance of SettingsManager
export const settingsManager = new SettingsManager()
