import React, { useState, useEffect } from 'react'
import useVocabulary from '../hooks/useVocabulary'
import { Expression, Sentence } from '../services/db'

interface SentenceWithIndex extends Sentence {
  index: number
}

interface RightPanelProps {
  isOpen: boolean
  selectedExpression?: string | null
  selectedSentence?: string | null
  wordLookupRequestKey?: string
}

const RightPanel: React.FC<RightPanelProps> = ({
  isOpen,
  selectedExpression,
  selectedSentence,
  wordLookupRequestKey
}) => {
  const vocabulary = useVocabulary()

  // Current expression
  const [currentExpression, setCurrentExpression] = useState<Expression | null>(null)
  const [expressionText, setExpressionText] = useState<string>('')
  const [meaning, setMeaning] = useState<string>('')
  const [isWordType, setIsWordType] = useState<boolean>(true)

  // Sentences
  const [sentences, setSentences] = useState<SentenceWithIndex[]>([])

  // Loading states
  const [isSaving, setIsSaving] = useState<boolean>(false)

  // update expression and sentences when a word is selected
  useEffect(() => {
    if (selectedExpression) {
      setExpressionText(selectedExpression)

      //check if the expression already exists in the database
      vocabulary.getExpressionByText(selectedExpression).then((expression) => {
        //if the expression exists, set the current expression's meaning and current sentences plus the sentences of the expression from the database
        if (expression) {
          setMeaning(expression.meaning)
          setCurrentExpression(expression)
          vocabulary.getSentencesForExpression(expression).then((sentences) => {
            //if the current sentence is not in the sentences then add it to the sentences
            console.log('sentences and selected sentence==>', sentences, selectedSentence)
            if (
              !sentences.find((sentence) => sentence.text === selectedSentence) &&
              selectedSentence
            ) {
              sentences.push({
                text: selectedSentence,
                trans: '',
                origin: ''
              })
            }

            //set the sentences to the local state plus the index
            setSentences(
              sentences.map((sentence, index) => ({
                ...sentence,
                index
              }))
            )
          })
        } else {
          //if the expression does not exist, create a new expression
          const newExpression: Expression = {
            expression: selectedExpression,
            meaning: '',
            status: 1,
            t: 'WORD',
            date: Date.now(),
            notes: [],
            sentences: [],
            connections: {}
          }
          setCurrentExpression(newExpression)
          setSentences([])
        }
      })
    }
  }, [selectedExpression])

  // Add sentence when selected
  useEffect(() => {
    if (selectedSentence && currentExpression) {
      // Add sentence to local state only
      const newSentence: SentenceWithIndex = {
        text: selectedSentence,
        trans: '',
        origin: 'context',
        index: sentences.length
      }
      setSentences((prev) => [...prev, newSentence])
    }
  }, [selectedSentence, currentExpression])

  // Add a new empty sentence
  const addNewSentence = async (): Promise<void> => {
    const newSentence: SentenceWithIndex = {
      text: '',
      trans: '',
      origin: 'manual',
      index: sentences.length
    }
    setSentences((prev) => [...prev, newSentence])
  }

  // Update current sentence text
  const updateSentenceText = (text: string): void => {
    const updatedSentences = [...sentences]
    updatedSentences[0] = {
      ...updatedSentences[0],
      text
    }
    setSentences(updatedSentences)
  }

  // Update current sentence translation
  const updateSentenceTranslation = (trans: string): void => {
    const updatedSentences = [...sentences]
    updatedSentences[0] = {
      ...updatedSentences[0],
      trans
    }
    setSentences(updatedSentences)
  }

  // Save expression changes
  const saveExpression = async (): Promise<void> => {
    if (!currentExpression) return

    setIsSaving(true)
    try {
      // Create or update expression in database
      let expressionId: number
      if (currentExpression.id) {
        // Update existing expression
        expressionId = await vocabulary.updateExpression(currentExpression.id, {
          expression: expressionText,
          meaning,
          t: isWordType ? 'WORD' : 'PHRASE'
        })
      } else {
        // Create new expression
        const newExpression = await vocabulary.findOrCreateExpression(expressionText)
        expressionId = newExpression.id as number
      }

      // Save sentences
      const nonEmptySentences = sentences
        .filter((sentence) => sentence.text.trim() !== '')
        .map((sentence) => ({
          id: String(sentence.id || ''),
          text: sentence.text,
          trans: sentence.trans
        }))

      // Save sentences to database
      for (const sentence of nonEmptySentences) {
        await vocabulary.addSentenceToExpression(
          expressionId,
          sentence.text,
          sentence.trans,
          'context'
        )
      }

      // Update local state with saved data
      const savedExpression = await vocabulary.getExpressionById(expressionId)
      if (savedExpression) {
        setCurrentExpression(savedExpression)
        const savedSentences = await vocabulary.getSentencesForExpression(savedExpression)
        const sentencesWithIndex = savedSentences.map((s, index) => ({
          ...s,
          index
        }))
        setSentences(sentencesWithIndex)
      }
    } catch (error) {
      console.error('Error saving expression:', error)
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="flex flex-col relative h-full w-64 bg-gray-200 border-1 border-gray-300 dark:border-gray-700 dark:bg-gray-900 text-black dark:text-white shadow-lg">
      {/* Expression bar */}
      <div className="w-full px-2 py-1 bg-gray-200 dark:bg-gray-900 text-black dark:text-white border-gray-300 dark:border-gray-700">
        <div className="flex justify-between items-center mb-1">
          <div className="font-medium">Expression</div>
        </div>
        <input
          type="text"
          value={expressionText}
          onChange={(e) => setExpressionText(e.target.value)}
          placeholder="Enter a word or phrase..."
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
          {isSaving && (
            <div className="absolute right-2 top-2">
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
          )}
        </div>
      </div>

      {/* Type switcher */}
      <div className="w-full p-2 bg-gray-200 dark:bg-gray-900 text-black dark:text-white border-gray-300 dark:border-gray-700">
        <div className="flex justify-between items-center mb-1">
          <div className="font-medium">Type</div>
        </div>
        <div className="flex justify-start items-center">
          <button
            onClick={() => setIsWordType(true)}
            className={`px-2 py-1 mx-1 text-xs rounded-md whitespace-nowrap ${
              isWordType ? 'bg-blue-500 text-white' : 'bg-gray-300 dark:bg-gray-700'
            }`}
          >
            Word
          </button>
          <button
            onClick={() => setIsWordType(false)}
            className={`px-2 py-1 text-xs rounded-md whitespace-nowrap ${
              isWordType ? 'bg-gray-300 dark:bg-gray-700' : 'bg-blue-500 text-white'
            }`}
          >
            Phrase
          </button>
        </div>
      </div>

      {/* Sentence display & edit */}
      <div className="p-2 bg-gray-200 dark:bg-gray-900 text-black dark:text-white border-gray-300 dark:border-gray-700">
        <div className="flex justify-between items-center mb-1">
          <div className="font-medium">Example Sentences</div>
          <button
            onClick={addNewSentence}
            className="bg-blue-500 rounded-sm text-white hover:text-blue-700 text-sm px-1"
          >
            + Add
          </button>
        </div>

        {isSaving ? (
          <div className="justify-center py-2">
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        ) : (
          <div className="h-80 overflow-y-auto p-1">
            {sentences.map((sentence, index) => (
              <div key={sentence.id || index} className="text-xs">
                <textarea
                  value={sentence.text}
                  onChange={(e) => updateSentenceText(e.target.value)}
                  className="box-border w-full b-b-0 p-1 bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-600 rounded-t-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px] resize-none"
                ></textarea>
                <textarea
                  value={sentence.trans}
                  onChange={(e) => updateSentenceTranslation(e.target.value)}
                  className="box-border w-full b-t-0 p-1 bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-600 rounded-b-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px] resize-none"
                ></textarea>
              </div>
            ))}

            {sentences.length === 0 && (
              <div className="text-xs italic text-gray-500 py-1">
                No sentences yet. Add one with the + button.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Submit button */}
      <div className="w-full p-2 absolute bottom-0 left-0 bg-gray-200 dark:bg-gray-900 text-black dark:text-white border-gray-300 dark:border-gray-700">
        <div className="flex justify-between items-center mb-1">
          <button
            onClick={saveExpression}
            disabled={isSaving}
            className={`px-2 py-1 rounded-md w-full ${
              isSaving
                ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                : 'bg-blue-500 text-white dark:bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {isSaving ? 'Saving...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default RightPanel
