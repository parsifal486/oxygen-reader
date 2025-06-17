import { useState, useCallback } from 'react'
import { MarkdownDocument } from '@shared/types'

interface MarkdownHookResult {
  currentDocument: MarkdownDocument | null
  isLoading: boolean
  error: string | null
  searchResults: MarkdownDocument[]
  recentFiles: MarkdownDocument[]
  openFile: (filePath: string) => Promise<void>
  saveFile: (content?: string) => Promise<boolean>
  searchInFiles: (query: string) => Promise<void>
  extractWords: (filePath?: string) => Promise<string[]>
  loadRecentFiles: () => Promise<void>
  findSentenceWithWord: (text: string, word: string) => string
}

export const useMarkdown = (): MarkdownHookResult => {
  const [currentDocument, setCurrentDocument] = useState<MarkdownDocument | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [searchResults, setSearchResults] = useState<MarkdownDocument[]>([])
  const [recentFiles, setRecentFiles] = useState<MarkdownDocument[]>([])

  /**
   * Load recently opened files
   */
  const loadRecentFiles = useCallback(async (): Promise<void> => {
    try {
      const recent = await window.markdown.getRecentFiles()
      setRecentFiles(recent)
    } catch (err) {
      console.error('Error loading recent files:', err)
    }
  }, [])

  /**
   * Open a markdown file
   * @param filePath Path to the markdown file
   */
  const openFile = useCallback(
    async (filePath: string): Promise<void> => {
      setIsLoading(true)
      setError(null)

      try {
        console.log('opening file in useMarkdown', filePath)
        const document = await window.markdown.openFile(filePath)
        setCurrentDocument(document)
        // Refresh recent files after opening a document
        loadRecentFiles()
      } catch (err) {
        console.error('Error opening markdown file:', err)
        setError('Failed to open file')
      } finally {
        setIsLoading(false)
      }
    },
    [loadRecentFiles]
  )

  /**
   * Save the current document
   * @param content Updated content to save
   */
  const saveFile = useCallback(
    async (content?: string): Promise<boolean> => {
      if (!currentDocument) {
        setError('No document is currently open')
        return false
      }

      setIsLoading(true)
      setError(null)

      try {
        // Update document content if provided
        const documentToSave = {
          ...currentDocument,
          content: content !== undefined ? content : currentDocument.content
        }

        const success = await window.markdown.saveFile(documentToSave)

        if (success) {
          setCurrentDocument(documentToSave)
          return true
        } else {
          setError('Failed to save file')
          return false
        }
      } catch (err) {
        console.error('Error saving markdown file:', err)
        setError('Failed to save file')
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [currentDocument]
  )

  /**
   * Search in all markdown files
   * @param query Search query
   */
  const searchInFiles = useCallback(async (query: string): Promise<void> => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const results = await window.markdown.searchInFiles(query)
      setSearchResults(results)
    } catch (err) {
      console.error('Error searching in markdown files:', err)
      setError('Failed to search files')
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Extract unique words from a markdown file
   * @param filePath Path to the markdown file
   */
  const extractWords = useCallback(
    async (filePath?: string): Promise<string[]> => {
      const path = filePath || currentDocument?.path

      if (!path) {
        setError('No document specified for word extraction')
        return []
      }

      setIsLoading(true)
      setError(null)

      try {
        const words = await window.markdown.extractWords(path)
        return words
      } catch (err) {
        console.error('Error extracting words from markdown file:', err)
        setError('Failed to extract words')
        return []
      } finally {
        setIsLoading(false)
      }
    },
    [currentDocument]
  )

  /**
   * Find the sentence containing a specific word
   * @param text Full text to search in
   * @param word Word to find
   */
  const findSentenceWithWord = useCallback((text: string, word: string): string => {
    // Basic sentence splitting - handles periods, question marks, exclamation marks
    const sentences = text.split(/(?<=[.!?])\s+/)

    // Find the sentence containing the word
    const targetSentence = sentences.find((sentence) => {
      const words = sentence.split(/\s+/)
      return words.some((w) => w.toLowerCase() === word.toLowerCase())
    })

    return targetSentence || word // Return the sentence or the word as fallback
  }, [])

  return {
    currentDocument,
    isLoading,
    error,
    searchResults,
    recentFiles,
    openFile,
    saveFile,
    searchInFiles,
    extractWords,
    loadRecentFiles,
    findSentenceWithWord
  }
}
