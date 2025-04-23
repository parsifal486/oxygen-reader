import React, { useState } from 'react'
import { MdSearch, MdHistory } from 'react-icons/md'

interface DictionaryProps {
  onWordSelect?: (word: string) => void
}

const Dictionary: React.FC<DictionaryProps> = ({ onWordSelect }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchHistory, setSearchHistory] = useState<string[]>([])

  const handleSearch = () => {
    if (searchTerm.trim() && !searchHistory.includes(searchTerm)) {
      setSearchHistory([searchTerm, ...searchHistory.slice(0, 9)])
    }
    if (onWordSelect && searchTerm.trim()) {
      onWordSelect(searchTerm)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="flex flex-col w-full h-full">
      {/* Search bar */}
      <div className="flex flex-row items-center w-full p-2 bg-gray-200 dark:bg-gray-900 text-black dark:text-white border-b border-gray-300 dark:border-gray-700">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search word..."
          className="flex-grow p-2 bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSearch}
          className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-r-md"
        >
          <MdSearch size="20px" />
        </button>
      </div>

      {/* History */}
      <div className="p-2 border-b border-gray-300 dark:border-gray-700">
        <div className="flex items-center gap-2 text-sm font-medium mb-2">
          <MdHistory size="16px" />
          <span>History</span>
        </div>
        {searchHistory.length > 0 ? (
          <ul className="space-y-1">
            {searchHistory.map((word, index) => (
              <li
                key={index}
                onClick={() => onWordSelect && onWordSelect(word)}
                className="cursor-pointer p-1 hover:bg-gray-300 dark:hover:bg-gray-700 rounded text-sm"
              >
                {word}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No search history yet</p>
        )}
      </div>

      {/* Suggestion panel (empty for now) */}
      <div className="flex-grow p-2 overflow-y-auto">
        <div className="text-sm font-medium mb-2">Suggestions</div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Search for a word to see suggestions
        </p>
      </div>
    </div>
  )
}

export default Dictionary 