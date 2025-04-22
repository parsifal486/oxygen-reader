// Define shared types for file system operations

// Types for file system items
export interface FileItem {
  name: string
  path: string
  type: 'file'
  extension?: string
}

export interface FolderItem {
  name: string
  path: string
  type: 'folder'
  children: (FileItem | FolderItem)[]
}

export interface Settings {
  theme: 'light' | 'dark' // Theme can be either 'light' or 'dark'
  appLanguage: string // Application language (e.g., 'en', 'fr')
  platform: string // Platform can be either 'darwin' or 'win32'
}

export type FileTreeItem = FileItem | FolderItem

// Types for markdown documents
export interface MarkdownMetadata {
  title?: string
  tags?: string[]
  createdAt?: Date
  language?: string
  [key: string]: unknown // For custom metadata
}

export interface MarkdownDocument {
  path: string
  filename: string
  content: string
  metadata: MarkdownMetadata
  lastModified: Date
}
