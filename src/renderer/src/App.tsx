import { useEffect, useState } from 'react'
import { useSettings } from './hooks/useSettings'
import { useFiles } from './hooks/useFiles'
import NavBar from '@renderer/layout/NavBar'
import LeftPanel from '@renderer/layout/LeftPanel'
import RightPanel from '@renderer/layout/RightPanel'
import MarkdownViewer from '@/components/MarkdownViewer'
import SideNavBar from '@renderer/layout/SideNavBar'

function App(): JSX.Element {
  //settings
  const { settings, loading: settingsLoading, updateSetting } = useSettings()

  //left panel
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(false)
  const [leftPanelType, setLeftPanelType] = useState<'fileExplorer' | 'dictionary'>('fileExplorer')
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null)
  const [selectedWord, setSelectedWord] = useState<string | null>(null)
  const [selectedSentence, setSelectedSentence] = useState<string | null>(null)

  //right panel
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false)

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

  useEffect(() => {
    if (selectedWord) {
      // Will be implemented later to fetch dictionary definitions
      console.log(`Will look up definition for: ${selectedWord}`)
    }
  }, [selectedWord])

  const toggleTheme = (): void => {
    const newTheme = settings?.theme === 'dark' ? 'light' : 'dark'
    console.log('toggle theme in renderer classlist', document.documentElement.classList)
    updateSetting('theme', newTheme)
  }

  const toggleLeftPanel = (): void => {
    setIsLeftPanelOpen(!isLeftPanelOpen)
  }

  const toggleRightPanel = (): void => {
    setIsRightPanelOpen(!isRightPanelOpen)
  }

  const handleFileSelect = (filePath: string): void => {
    setSelectedFilePath(filePath)
  }

  const handleWordSelect = (word: string, sentence?: string): void => {
    setSelectedWord(word)
    if (sentence) {
      setSelectedSentence(sentence)
    }
    // Auto-open right panel when a word is selected
    if (!isRightPanelOpen) {
      setIsRightPanelOpen(true)
    }
    console.log('Selected word:', word, 'in sentence:', sentence || 'N/A')
  }

  return (
    <div className="relative h-full w-full">
      <NavBar theme={settings?.theme || 'light'} platform={settings?.platform || 'darwin'} />

      <div className="absolute top-10 left-0 w-full h-[calc(100vh-40px)] flex flex-row">
        <SideNavBar
          theme={settings?.theme || 'light'}
          toggleTheme={toggleTheme}
          isLeftPanelOpen={isLeftPanelOpen}
          toggleLeftPanel={toggleLeftPanel}
          isRightPanelOpen={isRightPanelOpen}
          toggleRightPanel={toggleRightPanel}
        />
        {/* {if folderTree is null, show tip to create a new folder} */}
        {isLeftPanelOpen && (
          <LeftPanel
            leftPanelType={leftPanelType}
            setLeftPanelType={setLeftPanelType}
            folderTree={folderTree}
            onFileSelect={handleFileSelect}
            onWordSelect={handleWordSelect}
          />
        )}

        {/* Markdown viewer */}
        <div className="flex flex-1 flex-col items-center justify-center h-full text-black dark:text-white bg-gray-400 dark:bg-gray-800 top-0 left-0">
          <MarkdownViewer
            filePath={selectedFilePath || undefined}
            onWordSelect={handleWordSelect}
          />
        </div>

        {/* Right panel for vocabulary */}
        {isRightPanelOpen && (
          <RightPanel
            isOpen={isRightPanelOpen}
            selectedWord={selectedWord}
            selectedSentence={selectedSentence}
          />
        )}
      </div>
    </div>
  )
}

export default App
