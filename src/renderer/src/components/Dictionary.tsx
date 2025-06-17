import React, { useState, useEffect } from 'react'
import { MdSearch } from 'react-icons/md'
import { useTranslation } from '../engines/openai'

interface DictionaryProps {
  onWordSelect?: (word: string) => void
  selectedWord?: string | null
  selectedSentence?: string | null
  wordLookupRequestKey?: string
}

const Dictionary: React.FC<DictionaryProps> = ({
  onWordSelect,
  selectedWord,
  selectedSentence,
  wordLookupRequestKey
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [definition, setDefinition] = useState('')
  const [translation, setTranslation] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { translateText, getWordDefinition } = useTranslation()

  // Update search term when selected word changes
  useEffect(() => {
    if (selectedWord) {
      setSearchTerm(selectedWord)
      handleSearch(selectedWord)
    }
  }, [selectedWord])

  // Function to handle search
  const handleSearch = async (term: string = searchTerm): Promise<void> => {
    if (!term.trim()) return

    setIsLoading(true)

    try {
      // Get word definition and translation
      if (selectedSentence) {
        // If we have a sentence context, use it for word definition
        const wordDef = await getWordDefinition(
          term,
          selectedSentence,
          undefined,
          wordLookupRequestKey
        )
        setDefinition(wordDef)

        // Translate the whole sentence
        const sentenceTrans = await translateText(selectedSentence, undefined, wordLookupRequestKey)
        setTranslation(sentenceTrans)
      } else {
        // If no sentence, just get the word definition and translate the word
        const wordDef = await getWordDefinition(term, undefined, undefined, wordLookupRequestKey)
        setDefinition(wordDef)

        const wordTrans = await translateText(term, undefined, wordLookupRequestKey)
        setTranslation(wordTrans)
      }

      // Notify parent component
      if (onWordSelect) {
        onWordSelect(term)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="flex flex-col w-full h-full">
      {/* Search bar */}
      <div className="flex flex-row items-center w-full px-2 py-1 bg-gray-200 dark:bg-gray-900 text-black dark:text-white border-gray-300 dark:border-gray-700">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search word..."
          className="flex-grow h-8 p-2 bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => handleSearch()}
          className="p-2 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-r-md"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
          ) : (
            <MdSearch size="20px" />
          )}
        </button>
      </div>

      {/* Result area */}
      <div className="flex-col flex-grow overflow-y-auto p-3">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {definition || translation ? (
              <>
                {/* Word Definition */}
                {definition && (
                  <div className="mb-6">
                    <h3 className="text-md font-semibold mb-2">Definition</h3>
                    <div
                      dangerouslySetInnerHTML={{ __html: definition.replace(/\n/g, '<br/>') }}
                      className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md mb-3"
                    />
                  </div>
                )}

                {/* Original and Translation */}
                {translation && (
                  <div>
                    <h3 className="text-md font-semibold mb-2">Translation</h3>
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md mb-3">
                      <p>{translation}</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                Search for a word to see its definition and translation
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dictionary
