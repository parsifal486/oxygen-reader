import { useState, useEffect } from 'react'
import { FolderItem } from '@shared/types'

export const useFiles = (): {
  folderTree: FolderItem | null
  loading: boolean
} => {
  const [folderTree, setFolderTree] = useState<FolderItem | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const loadFolderTree = async (): Promise<void> => {
      try {
        const tree = await window.fileSystem.getFolderTree()
        setFolderTree(tree)
        setLoading(false)
      } catch (error) {
        console.error('Error loading folder tree:', error)
        setLoading(false)
      }
    }

    loadFolderTree()
  }, [])

  return { folderTree, loading }
}