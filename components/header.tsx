'use client'

import { Bot, MessageSquarePlus, Github } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SettingsDialog } from './settings-dialog'
import type { OllamaConfig } from '@/lib/types'

interface HeaderProps {
  config: OllamaConfig
  onConfigChange: (config: OllamaConfig) => void
  onClearChat: () => void
  hasMessages: boolean
  settingsOpen: boolean
  onSettingsOpenChange: (open: boolean) => void
}

export function Header({ 
  config, 
  onConfigChange, 
  onClearChat, 
  hasMessages,
  settingsOpen,
  onSettingsOpenChange
}: HeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-border bg-card/50 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
          <Bot className="h-5 w-5 text-foreground" />
        </div>
        <div>
          <h1 className="font-semibold text-foreground">Ollama Chat</h1>
          {config.model && (
            <p className="text-xs text-muted-foreground">
              Model: {config.model}
            </p>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="text-muted-foreground hover:text-foreground"
        >
          <a 
            href="https://github.com/ollama/ollama" 
            target="_blank" 
            rel="noopener noreferrer"
            title="Ollama GitHub"
          >
            <Github className="h-5 w-5" />
            <span className="sr-only">Ollama GitHub</span>
          </a>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearChat}
          disabled={!hasMessages}
          className="gap-1.5 text-muted-foreground hover:text-foreground disabled:opacity-40"
          title="Start a new chat"
        >
          <MessageSquarePlus className="h-4 w-4" />
          <span className="hidden sm:inline">New chat</span>
          <span className="sr-only sm:hidden">New chat</span>
        </Button>
        
        <SettingsDialog 
          config={config} 
          onConfigChange={onConfigChange}
          open={settingsOpen}
          onOpenChange={onSettingsOpenChange}
        />
      </div>
    </header>
  )
}
