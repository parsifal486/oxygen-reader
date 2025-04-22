import { ElectronAPI } from '@electron-toolkit/preload'
import { Settings } from '../main/settings'
import { FolderItem } from '../shared/types'
import { MarkdownDocument } from '../main/markdown'

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown
    settings: {
      getSettings: () => Promise<Settings>
      getSetting: (key: string) => Promise<Settings[keyof Settings]>
      updateSetting: (key: string, value: Settings[keyof Settings]) => Promise<void>
      saveSettings: (settings: Settings) => Promise<void>
    }
    windowCtrl: {
      minimizeWindow: () => Promise<void>
      maximizeRestoreWindow: () => Promise<void>
      closeWindow: () => Promise<void>
      isWindowMaximized: () => Promise<boolean>
      onWindowMaximizeChange: () => Promise<void>
      removeWindowMaximizeListener: () => Promise<void>
    }
    fileSystem: {
      getFolderTree: () => Promise<FolderItem>
      getAppFolderPath: () => Promise<string>
      onFolderTreeUpdated: (callback: (folderTree: FolderItem) => void) => void
      removeTreeListener: () => void
    }
    markdown: {
      openFile: (filePath: string) => Promise<MarkdownDocument | null>
      saveFile: (document: MarkdownDocument) => Promise<boolean>
      searchInFiles: (query: string) => Promise<MarkdownDocument[]>
      extractWords: (filePath: string) => Promise<string[]>
      getRecentFiles: () => Promise<MarkdownDocument[]>
    }
  }
}
