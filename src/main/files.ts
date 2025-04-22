// get filetree from path
// create file
// create folder
// delete file
// delete folder
// rename file
// rename folder
// move file
// move folder
// copy file
// copy folder
// get file content
// get file metadata
// get file tree

import path from 'path'
import os from 'os'
import fs from 'fs'
import { FolderItem, FileTreeItem } from '@shared/types'

class FileManager {
  private appFolderPath: string

  constructor() {
    // Get oxygen2's path from user, if it doesn't exist, create it
    this.appFolderPath = path.join(os.homedir(), 'oxygen2')
    console.log('init appFolderPath=====>', this.appFolderPath)
    this.ensureAppFolder()
  }

  // Make sure the app folder exists
  private ensureAppFolder(): void {
    if (!fs.existsSync(this.appFolderPath)) {
      fs.mkdirSync(this.appFolderPath, { recursive: true })
      console.log(`Created app folder at: ${this.appFolderPath}`)
    }
  }

  // Get root folder path
  public getAppFolderPath(): string {
    return this.appFolderPath
  }

  // Get the entire folder tree starting from app folder
  public getFolderTree(): FolderItem {
    return this.getDirectoryTree(this.appFolderPath)
  }

  // Recursive function to build directory tree filter out hidden files
  private getDirectoryTree(dirPath: string): FolderItem {
    const name = path.basename(dirPath)
    const stats = fs.statSync(dirPath)

    if (!stats.isDirectory()) {
      throw new Error(`Path is not a directory: ${dirPath}`)
    }

    const children: FileTreeItem[] = []
    const entries = fs.readdirSync(dirPath).filter((entry) => !entry.startsWith('.'))

    for (const entry of entries) {
      const entryPath = path.join(dirPath, entry)
      const entryStat = fs.statSync(entryPath)

      if (entryStat.isDirectory()) {
        children.push(this.getDirectoryTree(entryPath))
      } else {
        children.push({
          name: entry,
          path: entryPath,
          type: 'file',
          extension: path.extname(entry).slice(1)
        })
      }
    }

    // Sort children: folders first, then files, both alphabetically
    children.sort((a, b) => {
      // Sort folders before files
      if (a.type === 'folder' && b.type !== 'folder') return -1
      if (a.type !== 'folder' && b.type === 'folder') return 1

      // Sort alphabetically within the same type
      return a.name.localeCompare(b.name)
    })

    return {
      name,
      path: dirPath,
      type: 'folder',
      children
    }
  }
}

// Export both the class and a single instance
export default FileManager
export const fileManager = new FileManager()
