import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { Settings } from '../main/settings'
import { FolderItem, MarkdownDocument } from '../shared/types'

// Custom APIs for renderer
const settingsAPI = {
  getSettings: (): Promise<Settings> => ipcRenderer.invoke('get-settings'),
  getSetting: (key: string): Promise<Settings[keyof Settings]> =>
    ipcRenderer.invoke('get-setting', key),
  updateSetting: (key: string, value: Settings[keyof Settings]): Promise<void> =>
    ipcRenderer.invoke('update-setting', key, value),
  saveSettings: (settings: Settings): Promise<void> => ipcRenderer.invoke('save-settings', settings)
}

const windowCtrlAPI = {
  minimizeWindow: (): Promise<void> => ipcRenderer.invoke('window:minimize'),
  maximizeRestoreWindow: (): Promise<void> => ipcRenderer.invoke('window:maximize-restore'),
  closeWindow: (): Promise<void> => ipcRenderer.invoke('window:close'),
  isWindowMaximized: (): Promise<boolean> => ipcRenderer.invoke('window:is-maximized'),
  onWindowMaximizeChange: (): Promise<void> => ipcRenderer.invoke('window:maximized-change'),
  removeWindowMaximizeListener: (): Promise<void> => ipcRenderer.invoke('window:maximized-change')
}

const fileAPI = {
  getFolderTree: (): Promise<FolderItem> => ipcRenderer.invoke('get-folder-tree'),
  getAppFolderPath: (): Promise<string> => ipcRenderer.invoke('get-app-folder-path'),
  onFolderTreeUpdated: (callback: (folderTree: FolderItem) => void): void => {
    ipcRenderer.on('folder-tree-updated', (_event, folderTree) => callback(folderTree))
  },
  removeTreeListener: (): void => {
    ipcRenderer.removeAllListeners('folder-tree-updated')
  }
}

// Add markdown API
const markdownAPI = {
  openFile: (filePath: string): Promise<MarkdownDocument | null> =>
    ipcRenderer.invoke('markdown:open', filePath),
  saveFile: (document: MarkdownDocument): Promise<boolean> =>
    ipcRenderer.invoke('markdown:save', document),
  searchInFiles: (query: string): Promise<MarkdownDocument[]> =>
    ipcRenderer.invoke('markdown:search', query),
  extractWords: (filePath: string): Promise<string[]> =>
    ipcRenderer.invoke('markdown:extract-words', filePath),
  getRecentFiles: (): Promise<MarkdownDocument[]> => ipcRenderer.invoke('markdown:get-recent')
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('settings', settingsAPI)
    contextBridge.exposeInMainWorld('windowCtrl', windowCtrlAPI)
    contextBridge.exposeInMainWorld('fileSystem', fileAPI)
    contextBridge.exposeInMainWorld('markdown', markdownAPI)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.settings = settingsAPI
  // @ts-ignore (define in dts)
  window.fileSystem = fileAPI
  // @ts-ignore (define in dts)
  window.markdown = markdownAPI
}
