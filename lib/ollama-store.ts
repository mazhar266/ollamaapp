'use client'

import type { OllamaConfig, Message } from './types'

const CONFIG_KEY = 'ollama-config'
const MESSAGES_KEY = 'ollama-messages'

export function getStoredConfig(): OllamaConfig | null {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem(CONFIG_KEY)
  return stored ? JSON.parse(stored) : null
}

export function setStoredConfig(config: OllamaConfig): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config))
}

export function getStoredMessages(): Message[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(MESSAGES_KEY)
  if (!stored) return []
  const messages = JSON.parse(stored)
  return messages.map((m: Message) => ({
    ...m,
    timestamp: new Date(m.timestamp)
  }))
}

export function setStoredMessages(messages: Message[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages))
}

export function clearStoredMessages(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(MESSAGES_KEY)
}
