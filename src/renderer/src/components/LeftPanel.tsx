import React, { useState } from 'react'
import {
  MdOutlineNoteAdd,
  MdOutlineCreateNewFolder,
  MdKeyboardArrowRight,
  MdKeyboardArrowDown,
  MdTextSnippet,
  MdInsertDriveFile
} from 'react-icons/md'
import { FolderItem, FileItem } from '@shared/types'

interface LeftPanelProps {
  folderTree: FolderItem
  onFileSelect?: (filePath: string) => void
}

const LeftPanel: React.FC<LeftPanelProps> = ({ folderTree, onFileSelect }) => {
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null)

  const handleFileSelect = (filePath: string): void => {
    setSelectedFilePath(filePath)
    if (onFileSelect) {
      onFileSelect(filePath)
    }
  }

  return (
    <div className="items-center justify-center h-full min-w-50 bg-gray-200 border-1 border-gray-300 dark:border-gray-700 dark:bg-gray-900 text-black dark:text-white shadow-lg">
      {/* menu bar */}
      <div className="flex flex-row items-center justify-evenly w-full h-10 bg-gray-200 dark:bg-gray-900 text-black dark:text-white">
        <MenuIcon icon={<MdOutlineNoteAdd size="25px" />} text="NewFile" onClick={() => {}} />
        <MenuIcon
          icon={<MdOutlineCreateNewFolder size="25px" />}
          text="NewFolder"
          onClick={() => {}}
        />
      </div>

      {/* file explorer - directly render children of root folder */}
      <div className="items-center justify-center w-full h-full overflow-y-auto max-h-[calc(100vh-90px)]">
        {folderTree.children
          .filter((child) => child.name !== '.DS_Store')
          .sort((a, b) => {
            if (a.type === 'folder' && b.type !== 'folder') return -1
            if (a.type !== 'folder' && b.type === 'folder') return 1
            return a.name.localeCompare(b.name)
          })
          .map((child) => (
            <FolderTree
              key={child.name}
              folderTree={child}
              onFileSelect={handleFileSelect}
              selectedFilePath={selectedFilePath}
            />
          ))}
      </div>
    </div>
  )
}

interface FolderTreeProps {
  folderTree: FolderItem | FileItem
  level?: number
  onFileSelect: (filePath: string) => void
  selectedFilePath: string | null
}

const FolderTree: React.FC<FolderTreeProps> = ({
  folderTree,
  level = 0,
  onFileSelect,
  selectedFilePath
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  // Calculate left padding based on nesting level
  const indentationStyle = { marginLeft: `${level * 16}px` }
  const fileIndentationStyle = { marginLeft: `${level * 16}px`, paddingLeft: '8px' }

  // Check if it's a markdown file
  const isMarkdownFile =
    folderTree.type === 'file' &&
    (folderTree.name.endsWith('.md') || folderTree.name.endsWith('.markdown'))

  // Determine if this file is selected
  const isSelected = selectedFilePath === folderTree.path

  if (folderTree.type === 'folder') {
    return (
      <div className="w-full">
        <div
          className="flex flex-row items-center justify-start pl-1 cursor-pointer hover:bg-gray-400 dark:hover:bg-gray-700 rounded-md transition-all duration-300 ease-linear"
          onClick={(e) => {
            e.stopPropagation()
            setIsExpanded(!isExpanded)
          }}
          style={indentationStyle}
        >
          <div>{isExpanded ? <MdKeyboardArrowDown /> : <MdKeyboardArrowRight />}</div>
          <div className="ml-1">{folderTree.name}</div>
        </div>
        {isExpanded && (
          <div className="w-full">
            {folderTree.children
              .filter((child) => child.name !== '.DS_Store')
              .sort((a, b) => {
                if (a.type === 'folder' && b.type !== 'folder') return -1
                if (a.type !== 'folder' && b.type === 'folder') return 1
                return a.name.localeCompare(b.name)
              })
              .map((child) => (
                <FolderTree
                  key={child.name}
                  folderTree={child}
                  level={level + 1}
                  onFileSelect={onFileSelect}
                  selectedFilePath={selectedFilePath}
                />
              ))}
          </div>
        )}
      </div>
    )
  } else {
    return (
      <div
        className={`flex flex-row items-center justify-start cursor-pointer rounded-md transition-all duration-300 ease-linear ${
          isSelected ? 'bg-blue-200 dark:bg-blue-500' : 'hover:bg-gray-300 dark:hover:bg-gray-700'
        }`}
        style={fileIndentationStyle}
        onClick={() => isMarkdownFile && onFileSelect(folderTree.path)}
      >
        <div className="mr-1">{isMarkdownFile ? <MdTextSnippet /> : <MdInsertDriveFile />}</div>
        <div className={isMarkdownFile ? 'cursor-pointer' : 'cursor-default'}>
          {folderTree.name}
        </div>
      </div>
    )
  }
}

const MenuIcon = ({
  icon,
  text,
  onClick
}: {
  icon: React.ReactNode
  text: string
  onClick: () => void
}): JSX.Element => {
  return (
    <div
      className="group relative flex flex-row items-center justify-center w-full h-full m-7 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-md transition-all duration-300 ease-linear cursor-pointer"
      onClick={onClick}
    >
      {icon}
      <span className="absolute w-auto p-2 min-w-max top-full left-1/2 transform -translate-x-1/2 mt-2 rounded-md shadow-md text-white bg-gray-900 dark:bg-gray-300 dark:text-gray-900 text-xs font-bold transition-all duration-100 scale-0 opacity-0 origin-top group-hover:scale-100 group-hover:opacity-100">
        {text}
      </span>
    </div>
  )
}

export default LeftPanel
