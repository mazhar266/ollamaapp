'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Header } from './header'
import { ChatMessage } from './chat-message'
import { ChatInput } from './chat-input'
import { EmptyState } from './empty-state'
import { Spinner } from '@/components/ui/spinner'
import type { OllamaConfig, Message } from '@/lib/types'
import { 
  getStoredConfig, 
  setStoredConfig, 
  getStoredMessages, 
  setStoredMessages,
  clearStoredMessages 
} from '@/lib/ollama-store'

export function ChatContainer() {
  const [config, setConfig] = useState<OllamaConfig>({ baseUrl: '', model: '', connectionMode: 'direct' })
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const storedConfig = getStoredConfig()
    if (storedConfig) {
      setConfig(storedConfig)
    }
    const storedMessages = getStoredMessages()
    if (storedMessages.length > 0) {
      setMessages(storedMessages)
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleConfigChange = (newConfig: OllamaConfig) => {
    setConfig(newConfig)
    setStoredConfig(newConfig)
  }

  const handleClearChat = () => {
    setMessages([])
    clearStoredMessages()
  }

  const handleStop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setIsStreaming(false)
      setIsLoading(false)
    }
  }, [])

  const handleSend = async (content: string) => {
    if (!config.baseUrl || !config.model) {
      setSettingsOpen(true)
      return
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date()
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setStoredMessages(newMessages)
    setIsLoading(true)

    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      timestamp: new Date()
    }

    try {
      abortControllerRef.current = new AbortController()
      
      const isProxy = config.connectionMode === 'proxy'
      const url = isProxy ? '/api/ollama/chat' : `${config.baseUrl}/api/chat`
      
      const headers: HeadersInit = { 'Content-Type': 'application/json' }
      
      // Add Basic Auth for direct mode
      if (!isProxy && config.username && config.password) {
        const credentials = btoa(`${config.username}:${config.password}`)
        headers['Authorization'] = `Basic ${credentials}`
      }
      
      const body = isProxy 
        ? {
            baseUrl: config.baseUrl,
            model: config.model,
            messages: newMessages.map(m => ({ role: m.role, content: m.content })),
            stream: true,
            username: config.username,
            password: config.password
          }
        : {
            model: config.model,
            messages: newMessages.map(m => ({ role: m.role, content: m.content })),
            stream: true
          }
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      setIsStreaming(true)
      setIsLoading(false)

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No reader available')

      const decoder = new TextDecoder()
      let fullContent = ''

      setMessages(prev => [...prev, assistantMessage])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(line => line.trim())

        for (const line of lines) {
          try {
            const json = JSON.parse(line)
            if (json.message?.content) {
              fullContent += json.message.content
              setMessages(prev => {
                const updated = [...prev]
                const lastIndex = updated.length - 1
                updated[lastIndex] = { ...updated[lastIndex], content: fullContent }
                return updated
              })
            }
          } catch {
            // Skip invalid JSON lines
          }
        }
      }

      setMessages(prev => {
        const final = [...prev]
        const lastIndex = final.length - 1
        final[lastIndex] = { ...final[lastIndex], content: fullContent }
        setStoredMessages(final)
        return final
      })

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Request was cancelled
        return
      }
      
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Failed to get response'}. Please check your Ollama connection.`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsStreaming(false)
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }

  const isConfigured = Boolean(config.baseUrl && config.model)

  return (
    <div className="flex h-screen flex-col bg-background">
      <Header 
        config={config} 
        onConfigChange={handleConfigChange}
        onClearChat={handleClearChat}
        hasMessages={messages.length > 0}
        settingsOpen={settingsOpen}
        onSettingsOpenChange={setSettingsOpen}
      />
      
      <main className="flex flex-1 flex-col overflow-hidden">
        {messages.length === 0 ? (
          <EmptyState 
            isConfigured={isConfigured} 
            onConfigure={() => setSettingsOpen(true)} 
          />
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-3xl">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isLoading && (
                <div className="flex items-center gap-3 px-4 py-6 bg-card/50">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
                    <Spinner className="h-4 w-4" />
                  </div>
                  <span className="text-muted-foreground">Thinking...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}
      </main>

      <ChatInput 
        onSend={handleSend}
        onStop={handleStop}
        disabled={!isConfigured || isLoading}
        isStreaming={isStreaming}
      />
    </div>
  )
}
