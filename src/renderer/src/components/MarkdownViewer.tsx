import React, { useEffect, useState } from 'react'
import { useMarkdown } from '@/hooks/useMarkdown'
import { MdEdit, MdVisibility } from 'react-icons/md'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface MarkdownViewerProps {
  filePath?: string
  onWordSelect?: (word: string, sentence?: string) => void
}

const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ filePath, onWordSelect }) => {
  const { currentDocument, isLoading, error, openFile, saveFile, findSentenceWithWord } =
    useMarkdown()

  const [content, setContent] = useState<string>('')
  const [isEditMode, setIsEditMode] = useState<boolean>(false)
  const [editContent, setEditContent] = useState<string>('')
  const [selectedWord, setSelectedWord] = useState<string>('')

  useEffect(() => {
    if (filePath) {
      console.log('opening file in viewer', filePath)
      openFile(filePath)
      setIsEditMode(false)
    }
  }, [filePath, openFile])

  useEffect(() => {
    if (currentDocument) {
      setContent(currentDocument.content)
      setEditContent(currentDocument.content)
    }
  }, [currentDocument])

  const handleEditClick = (): void => {
    setIsEditMode(true)
    setEditContent(content)
  }

  const handleViewClick = async (): Promise<void> => {
    // Auto-save when switching to view mode
    const success = await saveFile(editContent)
    if (success) {
      setContent(editContent)
    }
    setIsEditMode(false)
  }

  const handleWordClick = (e: React.MouseEvent<HTMLSpanElement>, word: string): void => {
    if (!isEditMode && onWordSelect) {
      // Clean the word from punctuation
      const cleanWord = word.replace(/[^\w\s']/g, '').trim()
      if (cleanWord.length > 0) {
        setSelectedWord(cleanWord.toLowerCase())
        const sentence = findSentenceWithWord(content, word)
        onWordSelect(cleanWord, sentence)
      }
    }
  }

  // Splits text into words and makes each clickable
  const renderClickableText = (text: string): JSX.Element => {
    if (!text) return <></>

    // Split text into words but preserve punctuation and spaces
    const wordPattern = /(\w+[-']\w+|\w+|[^\w\s]+|\s+)/g
    const tokens = text.match(wordPattern) || []

    return (
      <>
        {tokens.map((token, index) => {
          // If it's a word (not punctuation or whitespace), make it clickable
          if (/^\w+[-']\w+$|^\w+$/.test(token)) {
            const isSelected = selectedWord && token.toLowerCase() === selectedWord
            return (
              <span
                key={index}
                onClick={(e) => handleWordClick(e, token)}
                className={`cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 border-2 
                  ${
                    isSelected
                      ? 'border-green-500 bg-green-200 dark:bg-green-800 dark:border-green-400'
                      : 'border-gray-400 dark:border-gray-500 bg-gray-400 dark:bg-gray-500'
                  } 
                  hover:rounded px-0.5 transition-colors rounded-md`}
              >
                {token}
              </span>
            )
          }
          // Otherwise return the token as is (punctuation, whitespace)
          return <span key={index}>{token}</span>
        })}
      </>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <p className="text-xl text-gray-600 dark:text-gray-300">Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <p className="text-xl text-red-500">{error}</p>
      </div>
    )
  }

  if (!currentDocument) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <p className="text-xl text-gray-600 dark:text-gray-300">Select a file to view</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full h-full bg-white dark:bg-gray-800 text-black dark:text-white">
      {/* Header with title and buttons */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold">
          {currentDocument.metadata.title || currentDocument.filename}
        </h1>
        <div className="flex space-x-2">
          {isEditMode ? (
            <button
              onClick={handleViewClick}
              className="flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              <MdVisibility className="mr-1" /> Read
            </button>
          ) : (
            <button
              onClick={handleEditClick}
              className="flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              <MdEdit className="mr-1" /> Edit
            </button>
          )}
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 p-4 overflow-auto">
        {isEditMode ? (
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full h-full p-2 bg-white dark:bg-gray-700 text-black dark:text-white border border-gray-300 dark:border-gray-600 rounded-md resize-none font-mono text-sm"
          />
        ) : (
          <div
            className="prose prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg 
           prose-h4:text-base prose-h5:text-sm prose-h6:text-xs prose-a:text-blue-600 prose-p:my-3
           prose-ul:pl-6 prose-ol:pl-6 prose-li:my-1 prose-img:rounded-md prose-sm 
           dark:prose-invert dark:prose-a:text-blue-400 max-w-none"
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ ...props }) => <h1 className="text-2xl font-bold mt-6 mb-4" {...props} />,
                h2: ({ ...props }) => <h2 className="text-xl font-bold mt-5 mb-3" {...props} />,
                h3: ({ ...props }) => <h3 className="text-lg font-bold mt-4 mb-2" {...props} />,
                h4: ({ ...props }) => <h4 className="text-base font-bold mt-3 mb-2" {...props} />,
                h5: ({ ...props }) => <h5 className="text-sm font-bold mt-3 mb-1" {...props} />,
                h6: ({ ...props }) => <h6 className="text-xs font-bold mt-3 mb-1" {...props} />,
                // Make paragraph text clickable
                p: ({ children, ...props }) => (
                  <p className="my-3" {...props}>
                    {typeof children === 'string' ? renderClickableText(children) : children}
                  </p>
                ),
                // Make list items clickable
                li: ({ children, ...props }) => (
                  <li className="my-1" {...props}>
                    {typeof children === 'string' ? renderClickableText(children) : children}
                  </li>
                ),
                ul: ({ ...props }) => <ul className="list-disc pl-6 my-3" {...props} />,
                ol: ({ ...props }) => <ol className="list-decimal pl-6 my-3" {...props} />,
                a: ({ ...props }) => (
                  <a className="text-blue-600 dark:text-blue-400 hover:underline" {...props} />
                ),
                blockquote: ({ ...props }) => (
                  <blockquote
                    className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic my-3"
                    {...props}
                  />
                ),
                // @ts-ignore - the types from react-markdown are not properly exposed
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '')
                  return match ? (
                    <SyntaxHighlighter style={tomorrow} language={match[1]} PreTag="div" {...props}>
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  )
                }
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  )
}

export default MarkdownViewer
