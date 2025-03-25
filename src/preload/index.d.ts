import { ElectronAPI } from '@electron-toolkit/preload'
import { globalAgent } from 'http'

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown
  }
}
