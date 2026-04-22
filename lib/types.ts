export type ConnectionMode = 'direct' | 'proxy'

export interface OllamaConfig {
  baseUrl: string
  model: string
  connectionMode: ConnectionMode
  username?: string
  password?: string
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface OllamaModel {
  name: string
  modified_at: string
  size: number
}

export interface OllamaModelsResponse {
  models: OllamaModel[]
}

export interface OllamaChatRequest {
  model: string
  messages: { role: string; content: string }[]
  stream: boolean
}

export interface OllamaChatResponse {
  model: string
  created_at: string
  message: {
    role: string
    content: string
  }
  done: boolean
}
