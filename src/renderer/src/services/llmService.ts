/**
 * LLM Service for making direct API calls to language models
 */

// Types for LLM API
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatResponse {
  choices: {
    message?: {
      content: string
    }
    delta?: {
      content: string
    }
  }[]
}

export interface LLMConfig {
  apiKey: string
  apiUrl: string
  apiUrlPath: string
  apiModel: string
}

/**
 * Request Manager to handle cancellation of in-flight requests
 */
class RequestManager {
  private requestMap: Map<string, AbortController> = new Map()

  /**
   * Cancels an existing request with the given key
   */
  cancelRequest(key: string): void {
    const controller = this.requestMap.get(key)
    if (controller) {
      controller.abort()
      this.requestMap.delete(key)
    }
  }

  /**
   * Registers a new request with the given key and returns an AbortController
   * Cancels any existing request with the same key
   */
  registerRequest(key: string): AbortController {
    // Cancel existing request with the same key
    this.cancelRequest(key)

    // Create and register new abort controller
    const controller = new AbortController()
    this.requestMap.set(key, controller)
    return controller
  }

  /**
   * Completes a request, removing it from the tracking map
   */
  completeRequest(key: string): void {
    this.requestMap.delete(key)
  }
}

// Create a singleton instance of the request manager
export const requestManager = new RequestManager()

/**
 * Make a request to an LLM API
 */
export async function callLLMApi(
  messages: ChatMessage[],
  config: LLMConfig,
  temperature: number = 0.3,
  requestKey?: string
): Promise<ChatResponse> {
  // Create abort controller for this request if a key is provided
  const controller = requestKey ? requestManager.registerRequest(requestKey) : undefined

  try {
    const response = await fetch(`${config.apiUrl}${config.apiUrlPath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.apiModel,
        messages,
        temperature
      }),
      signal: controller?.signal
    })

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()

    // Mark the request as complete
    if (requestKey) {
      requestManager.completeRequest(requestKey)
    }

    return result
  } catch (error) {
    // Don't report errors for aborted requests
    if (error instanceof Error && error.name === 'AbortError') {
      throw error
    }

    console.error('Error calling LLM API:', error)
    throw error
  }
}

/**
 * Make a streaming request to an LLM API
 */
export async function callLLMApiStream(
  messages: ChatMessage[],
  config: LLMConfig,
  options: {
    onChunk: (content: string, done: boolean) => void
    onError: (error: Error) => void
    onStatusCode?: (statusCode: number) => void
    signal?: AbortSignal
    temperature?: number
    requestKey?: string
  }
): Promise<void> {
  let controller: AbortController | undefined

  // If a request key is provided, register with request manager
  if (options.requestKey) {
    controller = requestManager.registerRequest(options.requestKey)
  }

  // Create a combined abort signal if both a manual signal and request manager signal exist
  let signal = options.signal || controller?.signal
  if (options.signal && controller) {
    // Create a new AbortController for combined signals
    const combinedController = new AbortController()

    // Listen to both signals
    const abortListener1 = (): void => combinedController.abort()
    const abortListener2 = (): void => combinedController.abort()

    options.signal.addEventListener('abort', abortListener1)
    controller.signal.addEventListener('abort', abortListener2)

    // Cleanup function to remove listeners
    const cleanup = (): void => {
      options.signal?.removeEventListener('abort', abortListener1)
      controller?.signal.removeEventListener('abort', abortListener2)
    }

    // Use the combined signal
    signal = combinedController.signal

    // Add cleanup to the finally block
    const originalOnError = options.onError
    options.onError = (error): void => {
      cleanup()
      originalOnError(error)
    }
  }

  try {
    const response = await fetch(`${config.apiUrl}${config.apiUrlPath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.apiModel,
        messages,
        stream: true,
        temperature: options.temperature || 0.3
      }),
      signal
    })

    if (!response.ok) {
      const statusCode = response.status
      if (options.onStatusCode) {
        options.onStatusCode(statusCode)
      }
      const errorText = await response.text()
      throw new Error(`API request failed with status ${statusCode}: ${errorText}`)
    }

    if (options.onStatusCode) {
      options.onStatusCode(response.status)
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
              options.onChunk(text, false)
            } catch (e) {
              console.error('Error parsing JSON from stream:', e)
            }
          }
        }
      }
    }

    options.onChunk(text, true)

    // Mark the request as complete if using request manager
    if (options.requestKey) {
      requestManager.completeRequest(options.requestKey)
    }
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      // Simply pass along the abort
      console.log(`Request ${options.requestKey || 'unknown'} was cancelled`)
    } else {
      options.onError(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
