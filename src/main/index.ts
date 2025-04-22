import { app, shell, BrowserWindow, ipcMain, nativeImage, Tray } from 'electron'
import { join, dirname } from 'path'
import { optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { settingsManager } from './settings'
import { fileURLToPath } from 'url'
import { fileManager } from './files'
import { markdownManager } from './markdown'

const HEADER_HEIGHT = 50
const MACOS_TRAFFIC_LIGHT_HEIGHT = 25

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

let mainWindow: BrowserWindow

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'hidden',
    titleBarOverlay: process.platform === 'darwin' ? { height: HEADER_HEIGHT } : false,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    },
    ...(process.platform === 'darwin'
      ? {
          trafficLightPosition: {
            x: 20,
            y: HEADER_HEIGHT / 2 - MACOS_TRAFFIC_LIGHT_HEIGHT / 2
          }
        }
      : {})
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    // Open DevTools by default
    //mainWindow.webContents.openDevTools()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    console.log('dirname====>', __dirname)
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  //set app icon
  //hide
  const appIcon = nativeImage.createFromPath('./resources/icon.png')
  app.setAppUserModelId('com.electron')

  // Set dock icon for macOS
  if (process.platform === 'darwin') {
    app.dock.setIcon(appIcon)
  }

  // Create tray icon
  const tray = new Tray(appIcon)
  tray.setToolTip('Oxygen2')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  //ipc handler for settings
  ipcMain.handle('get-settings', () => {
    return settingsManager.getSettings()
  })

  ipcMain.handle('get-setting', (_, key) => {
    return settingsManager.getSetting(key)
  })

  ipcMain.handle('update-setting', (_, key, value) => {
    return settingsManager.updateSetting(key, value)
  })

  ipcMain.handle('save-settings', (_, settings) => {
    return settingsManager.saveSettings(settings)
  })

  // File system related handlers
  ipcMain.handle('get-folder-tree', () => {
    try {
      return fileManager.getFolderTree()
    } catch (error) {
      console.error('Error getting folder tree:', error)
      return null
    }
  })

  ipcMain.handle('get-app-folder-path', () => {
    return fileManager.getAppFolderPath()
  })

  // Explicitly initialize the markdown manager's IPC handlers
  // This ensures the handlers are registered at the right time in the app lifecycle
  markdownManager.initialize()
  console.log('Markdown manager IPC handlers initialized')

  createWindow()

  // Send folder tree to renderer after window is ready
  mainWindow.webContents.on('did-finish-load', () => {
    try {
      const folderTree = fileManager.getFolderTree()
      mainWindow.webContents.send('folder-tree-updated', folderTree)
    } catch (error) {
      console.error('Error sending folder tree to renderer:', error)
    }
  })

  //ipc handler for window
  ipcMain.handle('window:minimize', () => {
    mainWindow.minimize()
  })

  ipcMain.handle('window:maximize-restore', () => {
    mainWindow.maximize()
  })

  ipcMain.handle('window:close', () => {
    mainWindow.close()
  })

  ipcMain.handle('window:is-maximized', () => {
    return mainWindow.isMaximized()
  })

  ipcMain.on('window:maximized-change', (_, maximized) => {
    console.log('window:maximized-change', maximized)
  })

  ipcMain.removeListener('window:maximized-change', (_, maximized) => {
    console.log('window:maximized-change', maximized)
  })

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
