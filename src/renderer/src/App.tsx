import { useEffect, useState, useRef } from 'react'
import { useSettings } from './hooks/useSettings'
import { useFiles } from './hooks/useFiles'
import NavBar from '@renderer/layout/NavBar'
import LeftPanel from '@renderer/layout/LeftPanel'
import RightPanel from '@renderer/layout/RightPanel'
import MarkdownViewer from '@/components/MarkdownViewer'
import SideNavBar from '@renderer/layout/SideNavBar'
import FlashcardViewer from '@/components/FlashcardViewer'
import SettingsDialog from '@/components/SettingsDialog'
import { requestManager } from './services/llmService'

function App(): JSX.Element {
  // Constants for request keys
  const WORD_LOOKUP_REQUEST_KEY = 'word-lookup'

  //settings
  const { settings, loading: settingsLoading, updateSetting } = useSettings()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  //left panel
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(false)
  const [leftPanelType, setLeftPanelType] = useState<'fileExplorer' | 'dictionary'>('fileExplorer')
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null)
  const [selectedExpression, setSelectedWord] = useState<string | null>(null)
  const [selectedSentence, setSelectedSentence] = useState<string | null>(null)

  //right panel
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false)

  //flashcards
  const [isFlashcardsOpen, setIsFlashcardsOpen] = useState(false)
  const flashcardContainerRef = useRef<HTMLDivElement>(null)

  const { folderTree, loading: filesLoading } = useFiles()
  console.log('folderTree====> ==>', filesLoading, folderTree)

  useEffect(() => {
    if (settings && !settingsLoading) {
      //Apply theme from settings
      if (settings.theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [settings, settingsLoading])

  useEffect(() => {
    if (selectedExpression) {
      // When a word is selected, open left panel and switch to dictionary
      if (!isLeftPanelOpen) {
        setIsLeftPanelOpen(true)
      }

      // Switch to dictionary view
      setLeftPanelType('dictionary')

      console.log(`Will look up definition for: ${selectedExpression}`)
    }
  }, [selectedExpression])

  // Handle click outside of flashcard container to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (
        flashcardContainerRef.current &&
        !flashcardContainerRef.current.contains(event.target as Node)
      ) {
        setIsFlashcardsOpen(false)
      }
    }

    if (isFlashcardsOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return (): void => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isFlashcardsOpen])

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

  const toggleFlashcards = (): void => {
    setIsFlashcardsOpen(!isFlashcardsOpen)
  }

  const toggleSettings = (): void => {
    setIsSettingsOpen(!isSettingsOpen)
  }

  const handleFileSelect = (filePath: string): void => {
    setSelectedFilePath(filePath)
  }

  const handleWordSelect = (word: string, sentence?: string): void => {
    // Cancel any ongoing word lookup request before starting a new one
    requestManager.cancelRequest(WORD_LOOKUP_REQUEST_KEY)

    setSelectedWord(word)
    if (sentence) {
      setSelectedSentence(sentence)
    }
    // Auto-open right panel when a word is selected
    if (!isRightPanelOpen) {
      setIsRightPanelOpen(true)
    }
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
          isFlashcardsOpen={isFlashcardsOpen}
          toggleFlashcards={toggleFlashcards}
          isSettingsOpen={isSettingsOpen}
          toggleSettings={toggleSettings}
        />
        {/* {if folderTree is null, show tip to create a new folder} */}
        {isLeftPanelOpen && (
          <LeftPanel
            leftPanelType={leftPanelType}
            setLeftPanelType={setLeftPanelType}
            folderTree={folderTree}
            onFileSelect={handleFileSelect}
            onWordSelect={handleWordSelect}
            selectedWord={selectedExpression}
            selectedSentence={selectedSentence}
            wordLookupRequestKey={WORD_LOOKUP_REQUEST_KEY}
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
            selectedExpression={selectedExpression}
            selectedSentence={selectedSentence}
            wordLookupRequestKey={WORD_LOOKUP_REQUEST_KEY}
          />
        )}

        {/* Flashcard dialog */}
        {isFlashcardsOpen && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div ref={flashcardContainerRef} className="relative">
              <FlashcardViewer />
            </div>
          </div>
        )}

        {/* Settings dialog */}
        <SettingsDialog isOpen={isSettingsOpen} onClose={toggleSettings} />
      </div>
    </div>
  )
}

export default App
