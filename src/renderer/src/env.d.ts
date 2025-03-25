/// <reference types="vite/client

interface Window {
  electron: {
    ipcRenderer: {
      send: (channel: string, ...args: any[]) => void
      on: (channel: string, listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => void
    }
  }
  settings: {
    getSettings: () => Promise<Settings>
    getSetting: (key: string) => Promise<Settings[keyof Settings]>
    updateSetting: (key: string, value: Settings[keyof Settings]) => Promise<void>
    saveSettings: (settings: Settings) => Promise<void>
  }
}