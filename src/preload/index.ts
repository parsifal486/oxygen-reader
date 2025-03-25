import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { Settings } from '../main/settings'

// Custom APIs for renderer
const settingsAPI = {
  getSettings: (): Promise<Settings> => ipcRenderer.invoke('get-settings'),
  getSetting: (key: string): Promise<Settings[keyof Settings]> => ipcRenderer.invoke('get-setting', key),
  updateSetting: (key: string, value: Settings[keyof Settings]): Promise<void> => ipcRenderer.invoke('update-setting', key, value),
  saveSettings: (settings: Settings): Promise<void> => ipcRenderer.invoke('save-settings', settings)
}

const windowCtrlAPI = {
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeRestoreWindow: () => ipcRenderer.invoke('window:maximize-restore'),
  closeWindow: () => ipcRenderer.invoke('window:close'),
  isWindowMaximized: () => ipcRenderer.invoke('window:is-maximized'),
  onWindowMaximizeChange: (callback) => ipcRenderer.on('window:maximized-change', callback),
  removeWindowMaximizeListener: (callback) => ipcRenderer.removeListener('window:maximized-change', callback)
}



// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('settings', settingsAPI)
    contextBridge.exposeInMainWorld('windowCtrl', windowCtrlAPI)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.settings = settingsAPI
}
