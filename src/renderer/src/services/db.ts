import Dexie, { Table } from 'dexie'

// Interfaces for data models
export interface Expression {
  id?: number // Database ID (optional)
  expression: string // The word or phrase itself
  meaning: string // Definition/translation
  status: number // Status flag (>0 for active, -1 for ignored)
  t: string // Type ("WORD" or "PHRASE")
  date: number // Unix timestamp when added/updated
  notes: string[] // Array of notes about this word
  sentences: number[] // Array of IDs referencing example sentences
  connections: Record<string, string> // Related words/expressions
}

export interface Sentence {
  id?: number // Database ID (optional)
  text: string // The sentence text
  trans: string // Translation of the sentence
  origin: string // Source of the sentence
}

// Database class definition
class VocabularyDatabase extends Dexie {
  expressions!: Table<Expression, number>
  sentences!: Table<Sentence, number>

  constructor() {
    super('VocabularyDatabase')
    this.version(1).stores({
      expressions: '++id, expression, status, t, date',
      sentences: '++id, text'
    })
  }

  // Find an expression by its text
  async findExpressionByText(expressionText: string): Promise<Expression | undefined> {
    return this.expressions.where('expression').equals(expressionText).first()
  }

  // Find a sentence by its text
  async findSentenceByText(sentenceText: string): Promise<Sentence | undefined> {
    return this.sentences.where('text').equals(sentenceText).first()
  }

  // Add new expression
  async addExpression(expression: Expression): Promise<number> {
    return this.expressions.add(expression)
  }

  // Add new sentence
  async addSentence(sentence: Sentence): Promise<number> {
    return this.sentences.add(sentence)
  }

  // Update an expression
  async updateExpression(id: number, changes: Partial<Expression>): Promise<number> {
    return this.expressions.update(id, changes)
  }

  // Update a sentence
  async updateSentence(id: number, changes: Partial<Sentence>): Promise<number> {
    return this.sentences.update(id, changes)
  }

  // Get a sentence by id
  async getSentence(id: number): Promise<Sentence | undefined> {
    return this.sentences.get(id)
  }

  // Get sentences for an expression
  async getSentencesForExpression(expression: Expression): Promise<Sentence[]> {
    if (!expression.sentences || expression.sentences.length === 0) {
      return []
    }

    return this.sentences.where('id').anyOf(expression.sentences).toArray()
  }

  // Add a sentence to an expression
  async addSentenceToExpression(expressionId: number, sentenceId: number): Promise<number> {
    const expression = await this.expressions.get(expressionId)
    if (!expression) throw new Error('Expression not found')

    // Convert Set to array for storage
    const sentenceIds = expression.sentences || []

    // Only add if not already present
    if (!sentenceIds.includes(sentenceId)) {
      sentenceIds.push(sentenceId)
      return this.expressions.update(expressionId, { sentences: sentenceIds })
    }

    return expressionId
  }
}

export const db = new VocabularyDatabase()

export default db
