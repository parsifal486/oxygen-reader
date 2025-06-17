import { AbstractEngine, IMessageRequest } from './abstract-engine'
import { Settings } from '@shared/types'
import { useSettings } from '../hooks/useSettings'
import { useState } from 'react'

// Types for OpenAI API
interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface ChatResponse {
  choices: {
    message?: {
      content: string
    }
    delta?: {
      content: string
    }
  }[]
}

// OpenAI engine class
export class OpenAI extends AbstractEngine {
  private settings: OpenAISettings | null = null

  constructor() {
    super()
  }

  // Allow settings to be injected from a React component
  setSettings(settings: OpenAISettings): void {
    this.settings = settings
  }

  // Get API configuration from settings
  getAPIKey(): string {
    return this.settings?.openai?.apiKey || 'sk-WXRqhrdeHBJyHyel884bDf8b0d604192Ab287a7276A63880'
  }

  getAPIURL(): string {
    return this.settings?.openai?.apiUrl || 'https://aihubmix.com'
  }

  getAPIModel(): string {
    return this.settings?.openai?.apiModel || 'gpt-4o'
  }

  getAPIURLPath(): string {
    return this.settings?.openai?.apiUrlPath || '/v1/chat/completions'
  }

  getTargetLanguage(): string {
    return this.settings?.openai?.targetLanguage || '中文'
  }

  // Direct method to call OpenAI API
  private async callOpenAI(
    messages: ChatMessage[],
    temperature: number = 0.3,
    requestKey?: string
  ): Promise<ChatResponse> {
    try {
      const apiKey = this.getAPIKey()
      const apiURL = this.getAPIURL()
      const apiURLPath = this.getAPIURLPath()
      const apiModel = this.getAPIModel()

      // Use the llmService with the request key
      const { callLLMApi } = await import('../services/llmService')

      return await callLLMApi(
        messages,
        {
          apiKey,
          apiUrl: apiURL,
          apiUrlPath: apiURLPath,
          apiModel
        },
        temperature,
        requestKey
      )
    } catch (error) {
      console.error('Error calling OpenAI API:', error)
      throw error
    }
  }

  // Method to translate text directly using OpenAI API
  async translateText(
    text: string,
    targetLanguage: string,
    callback: (result: string) => void,
    requestKey?: string
  ): Promise<void> {
    if (!text) {
      callback('')
      return
    }

    try {
      const messages: ChatMessage[] = [
        {
          role: 'system',
          content: `You are a professional translator. Translate the following text into ${targetLanguage}. Only respond with the translation without any explanations or additional text.`
        },
        {
          role: 'user',
          content: text
        }
      ]

      const result = await this.callOpenAI(messages, 0.3, requestKey)
      callback(result.choices[0]?.message?.content || '')
    } catch (error) {
      console.error('Translation error:', error)
      callback(`Error translating: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  // Method to get the meaning/definition of a word directly using OpenAI API
  async getWordDefinition(
    word: string,
    callback: (result: string) => void,
    sentence?: string,
    targetLanguage?: string,
    requestKey?: string
  ): Promise<void> {
    if (!word) {
      callback('')
      return
    }

    try {
      const language = targetLanguage || this.getTargetLanguage()

      const messages: ChatMessage[] = [
        {
          role: 'system',
          content: `You are an intelligent dictionary assistant. Provide a clear, concise definition of the given word in ${language}. Include part of speech, pronunciation if relevant`
        },
        {
          role: 'user',
          content:
            sentence && sentence.trim()
              ? `Define the word: "${word}" in the context of the following sentence: "${sentence}"`
              : `Define the word: "${word}"`
        }
      ]

      const result = await this.callOpenAI(messages, 0.3, requestKey)
      callback(result.choices[0]?.message?.content || '')
    } catch (error) {
      console.error('Error getting word definition:', error)
      callback(
        `Error fetching definition for "${word}": ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  async sendMessage(req: IMessageRequest): Promise<void> {
    const apiKey = this.getAPIKey()
    const apiURL = this.getAPIURL()
    const apiURLPath = this.getAPIURLPath()
    const apiModel = this.getAPIModel()

    try {
      // Include the model in the request body
      const requestBody = {
        model: apiModel,
        messages: [
          {
            role: 'system',
            content: req.rolePrompt
          },
          {
            role: 'user',
            content: req.commandPrompt
          }
        ],
        stream: true
      }

      const response = await fetch(`${apiURL}${apiURLPath}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody),
        signal: req.signal
      })

      if (!response.ok) {
        const statusCode = response.status
        if (req.onStatusCode) {
          req.onStatusCode(statusCode)
        }
        const errorText = await response.text()
        throw new Error(`API request failed with status ${statusCode}: ${errorText}`)
      }

      if (req.onStatusCode) {
        req.onStatusCode(response.status)
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('Failed to get response reader')
      }

      const decoder = new TextDecoder()
      let done = false
      let text = ''

      while (!done) {
        const { value, done: readerDone } = await reader.read()
        done = readerDone

        if (value) {
          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk
            .split('\n')
            .filter((line) => line.trim() !== '' && line.trim() !== 'data: [DONE]')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const jsonData = JSON.parse(line.substring(6))
                const content = jsonData.choices[0]?.delta?.content || ''
                text += content
                req.onMessage({ content: text, isFinished: false })
              } catch (e) {
                console.error('Error parsing JSON from stream:', e)
              }
            }
          }
        }
      }

      req.onMessage({ content: text, isFinished: true })
      req.onFinished('complete')
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        req.onFinished('aborted')
      } else {
        req.onError(error instanceof Error ? error : new Error(String(error)))
      }
    }
  }
}

// Extend Settings type to include OpenAI properties
interface OpenAISettings extends Settings {
  openai: {
    apiKey: string
    apiModel: string
    apiUrl: string
    apiUrlPath: string
    targetLanguage: string
  }
}

// Create a hook to use the OpenAI engine with settings
export function useOpenAI(): OpenAI {
  const openAI = new OpenAI()
  const { settings } = useSettings()

  if (settings) {
    openAI.setSettings(settings as OpenAISettings)
  }

  return openAI
}

// Interface for translation hook return value
interface TranslationHookResult {
  translateText: (text: string, targetLanguage?: string, requestKey?: string) => Promise<string>
  getWordDefinition: (
    word: string,
    sentence?: string,
    targetLanguage?: string,
    requestKey?: string
  ) => Promise<string>
  isLoading: boolean
  error: string | null
}

// Custom hook for translation functionality
export function useTranslation(): TranslationHookResult {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const openAI = useOpenAI()
  const { settings } = useSettings()

  // Function to translate text
  const translateText = async (
    text: string,
    targetLanguage?: string,
    requestKey?: string
  ): Promise<string> => {
    if (!text.trim()) return ''

    setIsLoading(true)
    setError(null)
    let result = ''

    try {
      // Use targetLanguage from params or from settings
      const language = targetLanguage || settings?.openai?.targetLanguage || '中文'

      await openAI.translateText(
        text,
        language,
        (translation) => {
          result = translation
        },
        requestKey
      )
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Translation failed'
      setError(errorMessage)
      console.error('Translation error:', err)
    } finally {
      setIsLoading(false)
    }

    return result
  }

  // Function to get word definition
  const getWordDefinition = async (
    word: string,
    sentence?: string,
    targetLanguage?: string,
    requestKey?: string
  ): Promise<string> => {
    if (!word.trim()) return ''

    setIsLoading(true)
    setError(null)
    let result = ''

    try {
      // Use targetLanguage from params or from settings
      const language = targetLanguage || settings?.openai?.targetLanguage || '中文'

      await openAI.getWordDefinition(
        word,
        (definition) => {
          result = definition
        },
        sentence,
        language,
        requestKey
      )
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get definition'
      setError(errorMessage)
      console.error('Definition error:', err)
    } finally {
      setIsLoading(false)
    }

    return result
  }

  return {
    translateText,
    getWordDefinition,
    isLoading,
    error
  }
}
