import { useLiveQuery } from 'dexie-react-hooks'
import { useCallback } from 'react'
import db, { Expression, Sentence } from '../services/db'

interface VocabularyHook {
  expressions: Expression[] | undefined
  getExpressionById: (id: number) => Promise<Expression | undefined>
  getExpressionByText: (expressionText: string) => Promise<Expression | undefined>
  findOrCreateExpression: (expressionText: string) => Promise<Expression>
  updateExpression: (id: number, changes: Partial<Expression>) => Promise<number>
  findOrCreateSentence: (
    sentenceText: string,
    translation?: string,
    origin?: string
  ) => Promise<Sentence>
  addSentenceToExpression: (
    expressionId: number,
    sentenceText: string,
    translation?: string,
    origin?: string
  ) => Promise<Sentence>
  getSentencesForExpression: (expression: Expression) => Promise<Sentence[]>
  updateSentence: (id: number, changes: Partial<Sentence>) => Promise<number>
  createDefaultExpression: () => Omit<Expression, 'id'>
  createDefaultSentence: () => Omit<Sentence, 'id'>
}

export function useVocabulary(): VocabularyHook {
  // Default values for new expressions and sentences
  const createDefaultExpression = (): Omit<Expression, 'id'> => ({
    expression: '',
    meaning: '',
    status: 1,
    t: 'WORD',
    date: Date.now(),
    notes: [],
    sentences: [],
    connections: {}
  })

  const createDefaultSentence = (): Omit<Sentence, 'id'> => ({
    text: '',
    trans: '',
    origin: 'manual'
  })

  // Get all expressions
  const expressions = useLiveQuery(() => db.expressions.toArray())

  // Get expression by ID
  const getExpressionById = useCallback(async (id: number) => {
    return await db.expressions.get(id)
  }, [])

  // Find expression by text
  const getExpressionByText = useCallback(async (expressionText: string) => {
    return await db.findExpressionByText(expressionText)
  }, [])

  // Find or create expression by text
  const findOrCreateExpression = useCallback(
    async (expressionText: string): Promise<Expression> => {
      const existing = await db.findExpressionByText(expressionText)
      if (existing) {
        return existing
      }

      // Create new expression
      const newExpression = {
        ...createDefaultExpression(),
        expression: expressionText
      }

      const id = await db.addExpression(newExpression)
      return { ...newExpression, id }
    },
    []
  )

  // Update expression
  const updateExpression = useCallback(async (id: number, changes: Partial<Expression>) => {
    return await db.updateExpression(id, { ...changes, date: Date.now() })
  }, [])

  // Find or create sentence
  const findOrCreateSentence = useCallback(
    async (
      sentenceText: string,
      translation: string = '',
      origin: string = 'manual'
    ): Promise<Sentence> => {
      const existing = await db.findSentenceByText(sentenceText)
      if (existing) {
        return existing
      }

      // Create new sentence
      const newSentence = {
        text: sentenceText,
        trans: translation,
        origin
      }

      const id = await db.addSentence(newSentence)
      return { ...newSentence, id }
    },
    []
  )

  // Add or update a sentence for an expression
  const addSentenceToExpression = useCallback(
    async (
      expressionId: number,
      sentenceText: string,
      translation: string = '',
      origin: string = 'manual'
    ) => {
      // Find or create the sentence
      const sentence = await findOrCreateSentence(sentenceText, translation, origin)

      // Add the sentence reference to the expression
      if (sentence.id) {
        await db.addSentenceToExpression(expressionId, sentence.id)
      }

      return sentence
    },
    [findOrCreateSentence]
  )

  // Get sentences for an expression
  const getSentencesForExpression = useCallback(async (expression: Expression) => {
    return await db.getSentencesForExpression(expression)
  }, [])

  // Update a sentence
  const updateSentence = useCallback(async (id: number, changes: Partial<Sentence>) => {
    return await db.updateSentence(id, changes)
  }, [])

  return {
    expressions,
    getExpressionById,
    getExpressionByText,
    findOrCreateExpression,
    updateExpression,
    findOrCreateSentence,
    addSentenceToExpression,
    getSentencesForExpression,
    updateSentence,
    createDefaultExpression,
    createDefaultSentence
  }
}

export default useVocabulary
