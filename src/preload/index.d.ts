import { ElectronAPI } from '@electron-toolkit/preload'
import { Settings } from '../shared/types'
import { FolderItem, MarkdownDocument } from '../shared/types'

interface SettingsAPI {
  getSettings: () => Promise<Settings>
  getSetting: (key: string) => Promise<Settings[keyof Settings]>
  updateSetting: (key: string, value: Settings[keyof Settings]) => Promise<void>
  saveSettings: (settings: Settings) => Promise<void>
}

interface WindowCtrlAPI {
  minimizeWindow: () => Promise<void>
  maximizeRestoreWindow: () => Promise<void>
  closeWindow: () => Promise<void>
  isWindowMaximized: () => Promise<boolean>
  onWindowMaximizeChange: () => Promise<void>
  removeWindowMaximizeListener: () => Promise<void>
}

interface FileAPI {
  getFolderTree: () => Promise<FolderItem>
  getAppFolderPath: () => Promise<string>
  onFolderTreeUpdated: (callback: (folderTree: FolderItem) => void) => void
  removeTreeListener: () => void
}

interface MarkdownAPI {
  openFile: (filePath: string) => Promise<MarkdownDocument | null>
  saveFile: (document: MarkdownDocument) => Promise<boolean>
  searchInFiles: (query: string) => Promise<MarkdownDocument[]>
  extractWords: (filePath: string) => Promise<string[]>
  getRecentFiles: () => Promise<MarkdownDocument[]>
}

declare global {
  interface Window {
    electron: ElectronAPI
    settings: SettingsAPI
    windowCtrl: WindowCtrlAPI
    fileSystem: FileAPI
    markdown: MarkdownAPI
  }
}
