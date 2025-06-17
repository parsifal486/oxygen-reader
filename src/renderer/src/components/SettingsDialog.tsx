import React, { useState, useEffect } from 'react'
import { useSettings } from '../hooks/useSettings'
import { MdOutlineClose, MdSearch } from 'react-icons/md'

interface SettingsDialogProps {
  isOpen: boolean
  onClose: () => void
}

type SettingCategory = 'appearance' | 'api' | 'language' | 'system' | 'dictionary'

interface FormValues {
  theme: string
  apiKey: string
  apiModel: string
  apiUrl: string
  apiUrlPath: string
  targetLanguage: string
  appLanguage: string
  dictionary: string
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({ isOpen, onClose }) => {
  const { settings, loading, updateSetting } = useSettings()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<SettingCategory>('appearance')
  const [formValues, setFormValues] = useState<FormValues>({
    theme: 'light',
    apiKey: '',
    apiModel: '',
    apiUrl: '',
    apiUrlPath: '',
    targetLanguage: '',
    appLanguage: 'en',
    dictionary: ''
  })

  // Initialize form values from settings when settings load or dialog opens
  useEffect(() => {
    if (settings) {
      setFormValues({
        theme: settings.theme || 'light',
        apiKey: settings.openai?.apiKey || '',
        apiModel: settings.openai?.apiModel || '',
        apiUrl: settings.openai?.apiUrl || '',
        apiUrlPath: settings.openai?.apiUrlPath || '',
        targetLanguage: settings.openai?.targetLanguage || '',
        appLanguage: settings.appLanguage || 'en',
        dictionary: settings.dictionary || ''
      })
    }
  }, [settings, isOpen])

  // If dialog is closed, reset state
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('')
    }
  }, [isOpen])

  if (!isOpen) return null

  // Filter settings based on search query
  const filterSettings = (category: SettingCategory): boolean => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()

    switch (category) {
      case 'appearance':
        return 'appearance theme dark light'.includes(query)
      case 'api':
        return 'api key model url openai language'.includes(query)
      case 'language':
        return 'language translation target'.includes(query)
      case 'system':
        return 'system platform storage'.includes(query)
      case 'dictionary':
        return 'dictionary youdao cambridge oxford merriam-webster'.includes(query)
      default:
        return false
    }
  }

  const handleThemeChange = async (theme: 'light' | 'dark'): Promise<void> => {
    // Update local form state
    setFormValues({ ...formValues, theme })

    // Apply theme change immediately
    const htmlElement = document.documentElement
    if (theme === 'dark') {
      htmlElement.classList.add('dark')
    } else {
      htmlElement.classList.remove('dark')
    }

    // Update persistent settings
    if (settings) {
      await updateSetting('theme', theme)
    }
  }

  const handleInputChange = (name: string, value: string): void => {
    setFormValues({ ...formValues, [name]: value })
  }

  const handleApiKeyChange = async (apiKey: string): Promise<void> => {
    handleInputChange('apiKey', apiKey)
    if (settings && settings.openai) {
      const updatedOpenAI = { ...settings.openai, apiKey }
      await updateSetting('openai', updatedOpenAI)
    }
  }

  const handleApiModelChange = async (apiModel: string): Promise<void> => {
    handleInputChange('apiModel', apiModel)
    if (settings && settings.openai) {
      const updatedOpenAI = { ...settings.openai, apiModel }
      await updateSetting('openai', updatedOpenAI)
    }
  }

  const handleApiUrlChange = async (apiUrl: string): Promise<void> => {
    handleInputChange('apiUrl', apiUrl)
    if (settings && settings.openai) {
      const updatedOpenAI = { ...settings.openai, apiUrl }
      await updateSetting('openai', updatedOpenAI)
    }
  }

  const handleApiUrlPathChange = async (apiUrlPath: string): Promise<void> => {
    handleInputChange('apiUrlPath', apiUrlPath)
    if (settings && settings.openai) {
      const updatedOpenAI = { ...settings.openai, apiUrlPath }
      await updateSetting('openai', updatedOpenAI)
    }
  }

  const handleTargetLanguageChange = async (targetLanguage: string): Promise<void> => {
    handleInputChange('targetLanguage', targetLanguage)
    if (settings && settings.openai) {
      const updatedOpenAI = { ...settings.openai, targetLanguage }
      await updateSetting('openai', updatedOpenAI)
    }
  }

  const handleAppLanguageChange = async (appLanguage: string): Promise<void> => {
    handleInputChange('appLanguage', appLanguage)
    if (settings) {
      await updateSetting('appLanguage', appLanguage)
    }
  }

  const handleDictionaryChange = async (dictionary: string): Promise<void> => {
    handleInputChange('dictionary', dictionary)
    if (settings) {
      await updateSetting('dictionary', dictionary)
    }
  }

  if (loading || !settings) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-6xl h-5/6 overflow-hidden">
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-6xl h-5/6 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <MdOutlineClose size="24px" className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <MdSearch
              size="20px"
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
            />
            <input
              type="text"
              placeholder="Search settings"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
            <nav className="p-2">
              {filterSettings('appearance') && (
                <button
                  onClick={() => setActiveCategory('appearance')}
                  className={`w-full text-left px-4 py-2 rounded-md mb-1 ${
                    activeCategory === 'appearance'
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Appearance
                </button>
              )}
              {filterSettings('api') && (
                <button
                  onClick={() => setActiveCategory('api')}
                  className={`w-full text-left px-4 py-2 rounded-md mb-1 ${
                    activeCategory === 'api'
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  API
                </button>
              )}
              {filterSettings('language') && (
                <button
                  onClick={() => setActiveCategory('language')}
                  className={`w-full text-left px-4 py-2 rounded-md mb-1 ${
                    activeCategory === 'language'
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Language
                </button>
              )}
              {filterSettings('dictionary') && (
                <button
                  onClick={() => setActiveCategory('dictionary')}
                  className={`w-full text-left px-4 py-2 rounded-md mb-1 ${
                    activeCategory === 'dictionary'
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Dictionary
                </button>
              )}
              {filterSettings('system') && (
                <button
                  onClick={() => setActiveCategory('system')}
                  className={`w-full text-left px-4 py-2 rounded-md mb-1 ${
                    activeCategory === 'system'
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  System
                </button>
              )}
            </nav>
          </div>

          {/* Settings content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeCategory === 'appearance' && (
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                  Appearance
                </h3>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Theme
                  </label>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleThemeChange('light')}
                      className={`px-4 py-2 rounded-md ${
                        formValues.theme === 'light'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
                      }`}
                    >
                      Light
                    </button>
                    <button
                      onClick={() => handleThemeChange('dark')}
                      className={`px-4 py-2 rounded-md ${
                        formValues.theme === 'dark'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
                      }`}
                    >
                      Dark
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeCategory === 'api' && (
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                  API Settings
                </h3>
                <div className="space-y-6">
                  <div>
                    <label
                      htmlFor="apiKey"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      API Key
                    </label>
                    <input
                      type="text"
                      id="apiKey"
                      value={formValues.apiKey}
                      onChange={(e) => handleApiKeyChange(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Your OpenAI API key for authentication
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="apiModel"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      API Model
                    </label>
                    <input
                      type="text"
                      id="apiModel"
                      value={formValues.apiModel}
                      onChange={(e) => handleApiModelChange(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      The model to use for API requests (e.g., gpt-4o)
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="apiUrl"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      API URL
                    </label>
                    <input
                      type="text"
                      id="apiUrl"
                      value={formValues.apiUrl}
                      onChange={(e) => handleApiUrlChange(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      The base URL for API requests
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="apiUrlPath"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      API URL Path
                    </label>
                    <input
                      type="text"
                      id="apiUrlPath"
                      value={formValues.apiUrlPath}
                      onChange={(e) => handleApiUrlPathChange(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      The path to append to the base URL for API requests
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeCategory === 'language' && (
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                  Language Settings
                </h3>
                <div className="space-y-6">
                  <div>
                    <label
                      htmlFor="appLanguage"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Application Language
                    </label>
                    <select
                      id="appLanguage"
                      value={formValues.appLanguage}
                      onChange={(e) => handleAppLanguageChange(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="en">English</option>
                      <option value="zh">中文</option>
                    </select>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      The language used for the application interface
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="targetLanguage"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Target Translation Language
                    </label>
                    <input
                      type="text"
                      id="targetLanguage"
                      value={formValues.targetLanguage}
                      onChange={(e) => handleTargetLanguageChange(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      The language to translate to (e.g., 中文, English, etc.)
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeCategory === 'dictionary' && (
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                  Dictionary Settings
                </h3>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Dictionary Provider
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="none"
                        name="dictionary"
                        value=""
                        checked={formValues.dictionary === ''}
                        onChange={() => handleDictionaryChange('')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <label
                        htmlFor="none"
                        className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                      >
                        None
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="youdao"
                        name="dictionary"
                        value="youdao"
                        checked={formValues.dictionary === 'youdao'}
                        onChange={() => handleDictionaryChange('youdao')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <label
                        htmlFor="youdao"
                        className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                      >
                        Youdao Dictionary (有道词典)
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="cambridge"
                        name="dictionary"
                        value="cambridge"
                        checked={formValues.dictionary === 'cambridge'}
                        onChange={() => handleDictionaryChange('cambridge')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <label
                        htmlFor="cambridge"
                        className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                      >
                        Cambridge Dictionary
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="oxford"
                        name="dictionary"
                        value="oxford"
                        checked={formValues.dictionary === 'oxford'}
                        onChange={() => handleDictionaryChange('oxford')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <label
                        htmlFor="oxford"
                        className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                      >
                        Oxford Dictionary
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="merriam-webster"
                        name="dictionary"
                        value="merriam-webster"
                        checked={formValues.dictionary === 'merriam-webster'}
                        onChange={() => handleDictionaryChange('merriam-webster')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <label
                        htmlFor="merriam-webster"
                        className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                      >
                        Merriam-Webster Dictionary
                      </label>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Select the dictionary provider to use for word lookups
                  </p>
                </div>
              </div>
            )}

            {activeCategory === 'system' && (
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                  System Settings
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Platform
                    </label>
                    <p className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md">
                      {settings.platform}
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Your current operating system (read-only)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Application Version
                    </label>
                    <p className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md">
                      1.0.0
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Current version of the application
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsDialog
