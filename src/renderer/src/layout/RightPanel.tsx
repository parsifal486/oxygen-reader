import React, { useState, useEffect } from 'react'

interface RightPanelProps {
  isOpen: boolean
  selectedWord?: string | null
  selectedSentence?: string | null
}

// Mock dictionary data
const mockMeaning: string = 'A representative form or pattern; a typical instance of something.'
const mockTranslation: string = "Un exemple représentatif ou typique d'une chose."

// Async function to fetch meaning (mock implementation)
const fetchMeaning = async (): Promise<string> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  return mockMeaning
}

const fetchTranslation = async (): Promise<string> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  return mockTranslation
}

const RightPanel: React.FC<RightPanelProps> = ({ isOpen, selectedWord, selectedSentence }) => {
  const [expression, setExpression] = useState<string>('')
  const [sentence, setSentence] = useState<string>('')
  const [meaning, setMeaning] = useState<string>('')
  const [translation, setTranslation] = useState<string>('')
  const [isLoadingMeaning, setIsLoadingMeaning] = useState<boolean>(false)
  const [isLoadingTranslation, setIsLoadingTranslation] = useState<boolean>(false)

  // Handle when a new word is selected
  useEffect(() => {
    if (selectedWord) {
      setExpression(selectedWord)
      updateMeaning()
    }

    if (selectedSentence) {
      setSentence(selectedSentence)
      updateTranslation()
    }
  }, [selectedWord, selectedSentence])

  // Update meaning when expression changes
  useEffect(() => {
    if (expression) {
      updateMeaning()
    }
  }, [expression])

  // Update translation when sentence changes
  useEffect(() => {
    if (sentence) {
      updateTranslation()
    }
  }, [sentence])

  // Async function to update meaning
  const updateMeaning = async (): Promise<void> => {
    setIsLoadingMeaning(true)
    try {
      const result = await fetchMeaning()
      setMeaning(result)
    } catch (error) {
      console.error('Error fetching meaning:', error)
      setMeaning('Error fetching definition')
    } finally {
      setIsLoadingMeaning(false)
    }
  }

  // Async function to update translation
  const updateTranslation = async (): Promise<void> => {
    setIsLoadingTranslation(true)
    try {
      const result = await fetchTranslation()
      setTranslation(result)
    } catch (error) {
      console.error('Error fetching translation:', error)
      setTranslation('Error fetching translation')
    } finally {
      setIsLoadingTranslation(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="flex flex-col h-full w-64 bg-gray-200 border-1 border-gray-300 dark:border-gray-700 dark:bg-gray-900 text-black dark:text-white shadow-lg">
      {/* Expression bar */}
      <div className="w-full p-2 bg-gray-200 dark:bg-gray-900 text-black dark:text-white border-gray-300 dark:border-gray-700">
        <div className="mb-1 font-medium">Expression</div>
        <input
          type="text"
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          placeholder="Enter a word..."
          className="px-1 w-full bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Meaning bar */}
      <div className="w-full p-2 bg-gray-200 dark:bg-gray-900 text-black dark:text-white border-gray-300 dark:border-gray-700">
        <div className="mb-1 font-medium">Meaning</div>
        <div className="relative">
          <textarea
            value={meaning}
            onChange={(e) => setMeaning(e.target.value)}
            placeholder="Meaning..."
            className="px-1 w-full bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px] resize-none"
          />
          {isLoadingMeaning && (
            <div className="absolute right-2 top-2">
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
          )}
        </div>
      </div>

      {/* Sentence bar*/}
      <div className="w-full p-2 bg-gray-200 dark:bg-gray-900 text-black dark:text-white border-gray-300 dark:border-gray-700">
        <div className="mb-1 font-medium">Sentence</div>
        <textarea
          value={sentence}
          onChange={(e) => setSentence(e.target.value)}
          placeholder="Example sentence..."
          className="px-1 w-full bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px] resize-none"
        />
      </div>

      {/* Translation bar */}
      <div className="w-full p-2 bg-gray-200 dark:bg-gray-900 text-black dark:text-white border-gray-300 dark:border-gray-700">
        <div className="mb-1 font-medium">Translation</div>
        <div className="relative">
          <textarea
            value={translation}
            onChange={(e) => setTranslation(e.target.value)}
            placeholder="Translation..."
            className="px-1 w-full bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px] resize-none"
          />
          {isLoadingTranslation && (
            <div className="absolute right-2 top-2">
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RightPanel
