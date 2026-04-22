'use client'

import { Bot, Sparkles, Zap, Shield } from 'lucide-react'

interface EmptyStateProps {
  isConfigured: boolean
  onConfigure: () => void
}

export function EmptyState({ isConfigured, onConfigure }: EmptyStateProps) {
  if (!isConfigured) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
            <Bot className="h-8 w-8 text-foreground" />
          </div>
          <h2 className="mb-2 text-2xl font-semibold text-foreground">Welcome to Ollama Chat</h2>
          <p className="mb-6 text-muted-foreground">
            Connect to your local Ollama instance to start chatting with AI models.
          </p>
          <button
            onClick={onConfigure}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Configure Connection
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4">
      <div className="max-w-2xl text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
          <Bot className="h-8 w-8 text-foreground" />
        </div>
        <h2 className="mb-2 text-2xl font-semibold text-foreground">How can I help you today?</h2>
        <p className="mb-8 text-muted-foreground">
          Start a conversation with your local Ollama model
        </p>
        
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-4 text-left">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
              <Sparkles className="h-5 w-5 text-accent" />
            </div>
            <h3 className="mb-1 font-medium text-foreground">Creative</h3>
            <p className="text-sm text-muted-foreground">
              Generate ideas, write stories, or brainstorm solutions
            </p>
          </div>
          
          <div className="rounded-xl border border-border bg-card p-4 text-left">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
              <Zap className="h-5 w-5 text-accent" />
            </div>
            <h3 className="mb-1 font-medium text-foreground">Fast</h3>
            <p className="text-sm text-muted-foreground">
              Get instant responses running locally on your machine
            </p>
          </div>
          
          <div className="rounded-xl border border-border bg-card p-4 text-left">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
              <Shield className="h-5 w-5 text-accent" />
            </div>
            <h3 className="mb-1 font-medium text-foreground">Private</h3>
            <p className="text-sm text-muted-foreground">
              Your data stays on your device, 100% local
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
