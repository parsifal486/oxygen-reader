import fs from 'fs'
import path from 'path'
import { ipcMain } from 'electron'
import { fileManager } from './files'
import { FolderItem, FileTreeItem, MarkdownDocument, MarkdownMetadata } from '@shared/types'

// Regex patterns for parsing markdown
const FRONTMATTER_REGEX = /^---\n([\s\S]*?)\n---/
const TITLE_REGEX = /# (.*?)(\n|$)/

class MarkdownManager {
  private openDocuments: Map<string, MarkdownDocument> = new Map()

  constructor() {
    // Don't set up handlers in constructor
    // They will be explicitly initialized from the main process
  }

  // Public method to initialize or re-initialize IPC handlers
  public initialize(): void {
    this.setupIpcHandlers()
  }

  // Set up IPC handlers for renderer communication
  private setupIpcHandlers(): void {
    ipcMain.handle('markdown:open', (_event, filePath: string) => this.openMarkdownFile(filePath))
    ipcMain.handle('markdown:save', (_event, document: MarkdownDocument) =>
      this.saveMarkdownFile(document)
    )
    ipcMain.handle('markdown:search', (_event, query: string) => this.searchInFiles(query))
    ipcMain.handle('markdown:extract-words', (_event, filePath: string) =>
      this.extractWords(filePath)
    )
    ipcMain.handle('markdown:get-recent', () => this.getRecentFiles())
  }

  // Open a markdown file and parse its content
  public async openMarkdownFile(filePath: string): Promise<MarkdownDocument | null> {
    try {
      // Check if document is already open
      if (this.openDocuments.has(filePath)) {
        return this.openDocuments.get(filePath) || null
      }

      // Read file content
      const content = fs.readFileSync(filePath, 'utf-8')
      const stats = fs.statSync(filePath)
      const filename = path.basename(filePath)

      // Parse metadata and create document
      const metadata = this.extractMetadata(content)
      const doc: MarkdownDocument = {
        path: filePath,
        filename,
        content,
        metadata,
        lastModified: stats.mtime
      }

      // Add to open documents
      this.openDocuments.set(filePath, doc)

      return doc
    } catch (error) {
      console.error(`Error opening markdown file: ${error}`)
      return null
    }
  }

  // Save markdown content to file
  public async saveMarkdownFile(document: MarkdownDocument): Promise<boolean> {
    try {
      // Write to file
      const contentToSave = document.content

      // Write to file
      fs.writeFileSync(document.path, contentToSave, 'utf-8')

      // Update the document in memory
      document.lastModified = new Date()
      this.openDocuments.set(document.path, document)

      return true
    } catch (error) {
      console.error(`Error saving markdown file: ${error}`)
      return false
    }
  }

  // Extract metadata from markdown content
  private extractMetadata(content: string): MarkdownMetadata {
    const metadata: MarkdownMetadata = {}

    // Check for YAML frontmatter
    const frontmatterMatch = content.match(FRONTMATTER_REGEX)
    if (frontmatterMatch) {
      const frontmatter = frontmatterMatch[1]

      // Basic YAML parsing (for a more robust solution, use a YAML library)
      frontmatter.split('\n').forEach((line) => {
        const [key, value] = line.split(':').map((part) => part.trim())
        if (key && value) {
          metadata[key] = value
        }
      })
    }

    // If no title in frontmatter, look for # Title
    if (!metadata.title) {
      const titleMatch = content.match(TITLE_REGEX)
      if (titleMatch) {
        metadata.title = titleMatch[1]
      }
    }

    return metadata
  }

  // Extract unique words from markdown (for language learning)
  public async extractWords(filePath: string): Promise<string[]> {
    try {
      // Open the file if not already open
      let doc = this.openDocuments.get(filePath)
      if (!doc) {
        const loadedDoc = await this.openMarkdownFile(filePath)
        if (!loadedDoc) {
          return []
        }
        doc = loadedDoc
      }

      // Remove markdown syntax and extract unique words
      const textContent = this.stripMarkdown(doc.content)
      const words = textContent
        .split(/\s+/)
        .map((word) =>
          word
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .trim()
        )
        .filter((word) => word.length > 0)

      // Return unique words
      return [...new Set(words)]
    } catch (error) {
      console.error(`Error extracting words: ${error}`)
      return []
    }
  }

  // Search for text in all markdown files
  public async searchInFiles(query: string): Promise<MarkdownDocument[]> {
    const results: MarkdownDocument[] = []

    try {
      // Get all markdown files from the file manager
      const folderTree = fileManager.getFolderTree()
      const markdownFiles = this.collectMarkdownFiles(folderTree)

      // Search in each file
      for (const filePath of markdownFiles) {
        let doc = this.openDocuments.get(filePath)
        if (!doc) {
          const loadedDoc = await this.openMarkdownFile(filePath)
          if (!loadedDoc) {
            continue
          }
          doc = loadedDoc
        }

        if (doc.content.toLowerCase().includes(query.toLowerCase())) {
          results.push(doc)
        }
      }

      return results
    } catch (error) {
      console.error(`Error searching in files: ${error}`)
      return []
    }
  }

  // Get recently opened files
  public getRecentFiles(): MarkdownDocument[] {
    return Array.from(this.openDocuments.values()).sort(
      (a, b) => b.lastModified.getTime() - a.lastModified.getTime()
    )
  }

  // Helper method to strip markdown syntax
  private stripMarkdown(content: string): string {
    return content
      .replace(/^---\n[\s\S]*?\n---/m, '') // Remove frontmatter
      .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
      .replace(/\[.*?\]\(.*?\)/g, '$1') // Replace links with just text
      .replace(/#{1,6}\s+.*?\n/g, '') // Remove headings
      .replace(/(`{1,3}).*?\1/g, '') // Remove code blocks and inline code
      .replace(/~~.*?~~/g, '') // Remove strikethrough
      .replace(/\*\*.*?\*\*/g, '') // Remove bold
      .replace(/\*.*?\*/g, '') // Remove italic
      .replace(/__.*?__/g, '') // Remove underline
      .replace(/_.*?_/g, '') // Remove italic with underscore
      .replace(/>\s*(.*?)\n/g, '') // Remove blockquotes
      .replace(/\n\s*[-+*]\s+/g, '\n') // Remove list markers
      .replace(/\n\s*\d+\.\s+/g, '\n') // Remove numbered list markers
  }

  // Helper to collect all markdown file paths from folder tree
  private collectMarkdownFiles(folder: FileTreeItem, files: string[] = []): string[] {
    if (
      folder.type === 'file' &&
      (folder.name.endsWith('.md') || folder.name.endsWith('.markdown'))
    ) {
      files.push(folder.path)
    } else if (folder.type === 'folder' && Array.isArray((folder as FolderItem).children)) {
      ;(folder as FolderItem).children.forEach((item: FileTreeItem) =>
        this.collectMarkdownFiles(item, files)
      )
    }
    return files
  }
}

// Export both the class and a singleton instance
export default MarkdownManager
export const markdownManager = new MarkdownManager()
