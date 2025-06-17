import React, { useState, useEffect } from 'react'
import useVocabulary from '../hooks/useVocabulary'
import { Expression, Sentence } from '../services/db'

// Types for the flashcard UI state
interface FlashcardState {
  flipped: boolean
  currentIndex: number
  expressions: Expression[]
  sentences: Record<number, Sentence[]>
  loading: boolean
}

// Set to true to use mock data, false to use real data from the database
const isUseMockData = true

// Mock data for testing
const mockData = [
  {
    id: 1,
    expression: 'Hello',
    meaning: 'A common greeting used when meeting someone.',
    t: 'WORD',
    status: 1,
    date: Date.now(),
    notes: [],
    sentences: [],
    connections: {}
  },
  {
    id: 2,
    expression: 'Goodbye',
    meaning: 'A farewell used when parting with someone.',
    t: 'WORD',
    status: 1,
    date: Date.now(),
    notes: [],
    sentences: [],
    connections: {}
  },
  {
    id: 3,
    expression: 'Thank you',
    meaning: 'An expression of gratitude.',
    t: 'PHRASE',
    status: 1,
    date: Date.now(),
    notes: [],
    sentences: [],
    connections: {}
  }
]

// Mock sentences for testing
const mockSentences: Record<number, Sentence[]> = {
  1: [
    { id: 101, text: 'Hello, how are you?', trans: '你好，你好吗？', origin: 'mock' },
    { id: 102, text: 'Hello, my name is John.', trans: '你好，我叫约翰。', origin: 'mock' }
  ],
  2: [
    { id: 201, text: 'Goodbye, see you tomorrow.', trans: '再见，明天见。', origin: 'mock' },
    { id: 202, text: 'I have to say goodbye now.', trans: '我现在必须说再见了。', origin: 'mock' }
  ],
  3: [
    { id: 301, text: 'Thank you for your help.', trans: '谢谢你的帮助。', origin: 'mock' },
    { id: 302, text: 'I want to say thank you.', trans: '我想说谢谢。', origin: 'mock' }
  ]
}

const FlashcardViewer: React.FC = () => {
  const vocabulary = useVocabulary()

  // Flashcard state
  const [state, setState] = useState<FlashcardState>({
    flipped: false,
    currentIndex: 0,
    expressions: [],
    sentences: {},
    loading: true
  })

  // Load expressions on mount
  useEffect(() => {
    loadExpressions()
  }, [])

  // Load all active expressions from the database
  const loadExpressions = async (): Promise<void> => {
    try {
      if (isUseMockData) {
        // Use mock data
        setState({
          flipped: false,
          currentIndex: 0,
          expressions: mockData,
          sentences: mockSentences,
          loading: false
        })
      } else {
        // Use the hook to get expressions
        const expressions = (await vocabulary.expressions) || []

        // Filter only active expressions
        const activeExpressions = expressions?.filter((expr) => expr.status > 0) || []

        // Initialize the state with loaded expressions
        setState((prev) => ({
          ...prev,
          expressions: activeExpressions,
          loading: false
        }))

        // Load sentences for the first expression
        if (activeExpressions.length > 0) {
          loadSentencesForExpression(activeExpressions[0])
        }
      }
    } catch (error) {
      console.error('Error loading expressions for flashcards:', error)
      setState((prev) => ({ ...prev, loading: false }))
    }
  }

  // Load sentences for a specific expression
  const loadSentencesForExpression = async (expression: Expression): Promise<void> => {
    if (!expression || !expression.id) return

    try {
      if (isUseMockData) {
        // Mock sentences are already loaded in initial state
        return
      }

      const sentences = await vocabulary.getSentencesForExpression(expression)

      setState((prev) => ({
        ...prev,
        sentences: {
          ...prev.sentences,
          [expression.id as number]: sentences
        }
      }))
    } catch (error) {
      console.error(`Error loading sentences for expression ${expression.expression}:`, error)
    }
  }

  // Flip the current flashcard
  const flipCard = (): void => {
    setState((prev) => ({ ...prev, flipped: !prev.flipped }))
  }

  // Move to the next card
  const nextCard = async (): Promise<void> => {
    const nextIndex = (state.currentIndex + 1) % state.expressions.length
    setState((prev) => ({
      ...prev,
      currentIndex: nextIndex,
      flipped: false
    }))

    // Preload sentences for the next expression if not using mock data
    if (!isUseMockData) {
      const nextExpression = state.expressions[nextIndex]
      if (nextExpression && !state.sentences[nextExpression.id as number]) {
        await loadSentencesForExpression(nextExpression)
      }
    }
  }

  // Move to the previous card
  const prevCard = async (): Promise<void> => {
    const prevIndex = state.currentIndex > 0 ? state.currentIndex - 1 : state.expressions.length - 1

    setState((prev) => ({
      ...prev,
      currentIndex: prevIndex,
      flipped: false
    }))

    // Preload sentences for the previous expression if not using mock data
    if (!isUseMockData) {
      const prevExpression = state.expressions[prevIndex]
      if (prevExpression && !state.sentences[prevExpression.id as number]) {
        await loadSentencesForExpression(prevExpression)
      }
    }
  }

  // Handle expression status update
  const updateStatus = async (status: number): Promise<void> => {
    const currentExpression = state.expressions[state.currentIndex]
    if (!currentExpression || !currentExpression.id) return

    try {
      if (!isUseMockData) {
        await vocabulary.updateExpression(currentExpression.id, { status })
      } else {
        console.log(`Mock update status: Expression ${currentExpression.expression} -> ${status}`)
      }

      // If marking as ignored (-1), move to the next card
      if (status === -1) {
        // Remove from local state
        setState((prev) => ({
          ...prev,
          expressions: prev.expressions.filter((_, index) => index !== prev.currentIndex),
          currentIndex: prev.currentIndex % (prev.expressions.length - 1)
        }))
      }

      // Move to the next card
      await nextCard()
    } catch (error) {
      console.error('Error updating expression status:', error)
    }
  }

  // Render loading state
  if (state.loading) {
    return (
      <div className="flex items-center justify-center w-96 h-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    )
  }

  // Render empty state
  if (state.expressions.length === 0) {
    return (
      <div className="w-96 h-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
          No Flashcards Available
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          You haven&apos;t added any vocabulary words yet. Add some words to start reviewing with
          flashcards.
        </p>
      </div>
    )
  }

  // Get current expression and its sentences
  const currentExpression = state.expressions[state.currentIndex]
  const currentSentences =
    currentExpression && currentExpression.id ? state.sentences[currentExpression.id] || [] : []

  return (
    <div className="w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      {/* Header with counter */}
      <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white">Flashcards</h2>
        <span className="text-sm text-gray-500 dark:text-gray-300">
          {state.currentIndex + 1} / {state.expressions.length}
        </span>
      </div>

      {/* Flashcard */}
      <div
        onClick={flipCard}
        className={`relative w-full h-64 cursor-pointer transition-all duration-500 ${
          state.flipped ? 'bg-gray-50 dark:bg-gray-900' : 'bg-white dark:bg-gray-800'
        }`}
      >
        <div className="absolute inset-0 p-6 flex flex-col justify-center items-center">
          {!state.flipped ? (
            // Front of card - the word/expression
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                {currentExpression.expression}
              </h3>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {currentExpression.t === 'WORD' ? 'Word' : 'Phrase'}
              </div>
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                Click to reveal meaning
              </div>
            </div>
          ) : (
            // Back of card - meaning and examples
            <div className="text-left w-full overflow-y-auto max-h-full">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Meaning:</h4>
              <p className="text-gray-700 dark:text-gray-300 mb-4">{currentExpression.meaning}</p>

              {currentSentences.length > 0 && (
                <>
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                    Examples:
                  </h4>
                  <ul className="space-y-2">
                    {currentSentences.map((sentence) => (
                      <li key={sentence.id} className="text-sm">
                        <p className="text-gray-700 dark:text-gray-300">{sentence.text}</p>
                        <p className="text-gray-500 dark:text-gray-400 italic">{sentence.trans}</p>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 flex justify-between">
        <div className="flex space-x-2">
          <button
            onClick={() => updateStatus(-1)}
            className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Ignore
          </button>
          <button
            onClick={() => updateStatus(1)}
            className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
          >
            Again
          </button>
          <button
            onClick={() => updateStatus(2)}
            className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            Know
          </button>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={prevCard}
            className="px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
          >
            ←
          </button>
          <button
            onClick={nextCard}
            className="px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
          >
            →
          </button>
        </div>
      </div>
    </div>
  )
}

export default FlashcardViewer
