import React from 'react'
import { MdOutlineFolder, MdFolderOpen, MdOutlineBook, MdBook } from 'react-icons/md'
import { FolderItem } from '@shared/types'
import FileExplorer from '../components/FileExplorer'
import Dictionary from '../components/Dictionary'

interface LeftPanelProps {
  leftPanelType: 'fileExplorer' | 'dictionary'
  setLeftPanelType: (leftPanelType: 'fileExplorer' | 'dictionary') => void
  folderTree: FolderItem | null
  onFileSelect?: (filePath: string) => void
  onWordSelect?: (word: string) => void
}

const LeftPanel: React.FC<LeftPanelProps> = ({
  leftPanelType,
  setLeftPanelType,
  folderTree,
  onFileSelect,
  onWordSelect
}) => {
  return (
    <div className="flex flex-col h-full min-w-64 bg-gray-200 border-1 border-gray-300 dark:border-gray-700 dark:bg-gray-900 text-black dark:text-white shadow-lg">
      {/* Panel type switcher */}
      <div className="flex flex-row items-center justify-evenly w-full h-10 bg-gray-200 dark:bg-gray-900 text-black dark:text-white border-gray-400 dark:border-gray-600">
        <button
          onClick={() => setLeftPanelType('fileExplorer')}
          className={`flex items-center px-3 py-1 rounded-md ${
            leftPanelType === 'fileExplorer'
              ? 'bg-gray-800 text-white'
              : 'hover:bg-gray-400 dark:hover:bg-gray-700'
          }`}
        >
          {leftPanelType === 'fileExplorer' ? (
            <MdFolderOpen className="mr-1" size="20px" />
          ) : (
            <MdOutlineFolder className="mr-1" size="20px" />
          )}
        </button>
        <button
          onClick={() => setLeftPanelType('dictionary')}
          className={`flex items-center px-3 py-1 rounded-md ${
            leftPanelType === 'dictionary'
              ? 'bg-gray-800 text-white'
              : 'hover:bg-gray-400 dark:hover:bg-gray-700'
          }`}
        >
          {leftPanelType === 'dictionary' ? (
            <MdBook className="mr-1" size="20px" />
          ) : (
            <MdOutlineBook className="mr-1" size="20px" />
          )}
        </button>
      </div>

      {/* Content based on panel type */}
      <div className="flex-grow overflow-hidden">
        {leftPanelType === 'fileExplorer' ? (
          folderTree ? (
            <FileExplorer folderTree={folderTree} onFileSelect={onFileSelect} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-4">
              <p className="text-lg font-medium mb-2">No folder loaded</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                Please open a folder to view files
              </p>
            </div>
          )
        ) : (
          <Dictionary onWordSelect={onWordSelect} />
        )}
      </div>
    </div>
  )
}

export default LeftPanel
