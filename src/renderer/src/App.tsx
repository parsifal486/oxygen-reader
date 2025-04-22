import { useEffect, useState } from 'react'
import { useSettings } from './hooks/useSettings'
import { useFiles } from './hooks/useFiles'
import NavBar from '@/components/NavBar'
import LeftPanel from '@renderer/components/LeftPanel'
import MarkdownViewer from '@/components/MarkdownViewer'
import SideNavBar from '@renderer/components/SideNavBar'

function App(): JSX.Element {
  const { settings, loading: settingsLoading, updateSetting } = useSettings()
  const [isFileExplorerOpen, setIsFileExplorerOpen] = useState(false)
  const [isRightSideBarOpen, setIsRightSideBarOpen] = useState(false)
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null)

  const { folderTree, loading: filesLoading } = useFiles()
  console.log('folderTree====> ==>', filesLoading, folderTree)

  useEffect(() => {
    if (settings && !settingsLoading) {
      //Apply theme from settings
      console.log('get settings in renderer', settings)
      if (settings.theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [settings, settingsLoading])

  const toggleTheme = (): void => {
    const newTheme = settings?.theme === 'dark' ? 'light' : 'dark'
    console.log('toggle theme in renderer classlist', document.documentElement.classList)
    updateSetting('theme', newTheme)
  }

  const toggleFileExplorer = (): void => {
    setIsFileExplorerOpen(!isFileExplorerOpen)
  }

  const toggleRightSideBar = (): void => {
    setIsRightSideBarOpen(!isRightSideBarOpen)
  }

  const handleFileSelect = (filePath: string): void => {
    setSelectedFilePath(filePath)
  }

  return (
    <div className="relative h-full w-full">
      <NavBar theme={settings?.theme || 'light'} platform={settings?.platform || 'darwin'} />

      <div className="absolute top-10 left-0 w-full h-[calc(100vh-40px)] flex flex-row">
        <SideNavBar
          theme={settings?.theme || 'light'}
          toggleTheme={toggleTheme}
          isFileExplorerOpen={isFileExplorerOpen}
          toggleFileExplorer={toggleFileExplorer}
          isRightSideBarOpen={isRightSideBarOpen}
          toggleRightSideBar={toggleRightSideBar}
        />
        {/* {if folderTree is null, show tip to create a new folder} */}
        {isFileExplorerOpen && folderTree && (
          <LeftPanel folderTree={folderTree} onFileSelect={handleFileSelect} />
        )}
        {isFileExplorerOpen && !folderTree && (
          <div className="flex flex-1 flex-col items-center justify-center h-full text-black dark:text-white bg-gray-400 dark:bg-gray-800 top-0 left-0">
            <h1 className="text-4xl font-bold">No folder found</h1>
            <span>Create a new folder</span>
          </div>
        )}

        {/* Markdown viewer */}
        <div className="flex flex-1 flex-col items-center justify-center h-full text-black dark:text-white bg-gray-400 dark:bg-gray-800 top-0 left-0">
          <MarkdownViewer filePath={selectedFilePath || undefined} />
        </div>
      </div>
    </div>
  )
}

export default App
