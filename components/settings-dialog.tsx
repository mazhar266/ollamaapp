'use client'

import { useState, useEffect } from 'react'
import { Settings, RefreshCw, Check, AlertCircle, HelpCircle, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { OllamaConfig, OllamaModel, ConnectionMode } from '@/lib/types'

interface SettingsDialogProps {
  config: OllamaConfig
  onConfigChange: (config: OllamaConfig) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function SettingsDialog({ config, onConfigChange, open, onOpenChange }: SettingsDialogProps) {
  const [localConfig, setLocalConfig] = useState(config)
  const [models, setModels] = useState<OllamaModel[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    setLocalConfig(config)
  }, [config])

  const fetchModels = async (url?: string, mode?: ConnectionMode) => {
    const baseUrl = url || localConfig.baseUrl
    const connectionMode = mode || localConfig.connectionMode
    if (!baseUrl) return

    setLoading(true)
    setError(null)

    try {
      let response: Response
      
      if (connectionMode === 'proxy') {
        const params = new URLSearchParams({ baseUrl })
        if (localConfig.username) params.set('username', localConfig.username)
        if (localConfig.password) params.set('password', localConfig.password)
        response = await fetch(`/api/ollama/models?${params.toString()}`)
      } else {
        const headers: HeadersInit = { 'Content-Type': 'application/json' }
        if (localConfig.username && localConfig.password) {
          const credentials = btoa(`${localConfig.username}:${localConfig.password}`)
          headers['Authorization'] = `Basic ${credentials}`
        }
        response = await fetch(`${baseUrl}/api/tags`, { headers })
      }
      
      if (!response.ok) throw new Error('Failed to fetch models')
      
      const data = await response.json()
      setModels(data.models || [])
      setConnectionStatus('success')
      
      if (data.models?.length > 0 && !localConfig.model) {
        setLocalConfig(prev => ({ ...prev, model: data.models[0].name }))
      }
    } catch {
      const modeText = connectionMode === 'direct' 
        ? 'Make sure Ollama has CORS enabled (set OLLAMA_ORIGINS).'
        : 'Make sure Ollama is running on the same machine as this app.'
      setError(`Could not connect to Ollama. ${modeText}`)
      setConnectionStatus('error')
      setModels([])
    } finally {
      setLoading(false)
    }
  }

  const handleSave = () => {
    onConfigChange(localConfig)
    onOpenChange?.(false)
  }

  const handleUrlChange = (url: string) => {
    setLocalConfig(prev => ({ ...prev, baseUrl: url }))
    setConnectionStatus('idle')
    setModels([])
  }

  const handleModeChange = (mode: ConnectionMode) => {
    setLocalConfig(prev => ({ ...prev, connectionMode: mode }))
    setConnectionStatus('idle')
    setModels([])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Settings className="h-5 w-5" />
          <span className="sr-only">Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Ollama Settings</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Configure your Ollama API connection
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="connectionMode" className="text-foreground">Connection Mode</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs bg-popover border-border text-popover-foreground">
                    <p className="font-semibold mb-1">Direct Mode</p>
                    <p className="text-sm mb-2">Browser connects directly to Ollama. Requires CORS to be enabled on Ollama.</p>
                    <p className="font-semibold mb-1">Proxy Mode</p>
                    <p className="text-sm">Requests go through Next.js server. Only works when running locally on the same machine as Ollama.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select
              value={localConfig.connectionMode}
              onValueChange={(value) => handleModeChange(value as ConnectionMode)}
            >
              <SelectTrigger className="bg-input border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="direct" className="text-popover-foreground">
                  Direct (Browser to Ollama)
                </SelectItem>
                <SelectItem value="proxy" className="text-popover-foreground">
                  Proxy (via Server - Local only)
                </SelectItem>
              </SelectContent>
            </Select>
            {localConfig.connectionMode === 'direct' && (
              <div className="rounded-md bg-secondary/50 p-3 text-xs text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">Enable CORS on Ollama:</p>
                <code className="block bg-background/50 rounded px-2 py-1 text-accent">
                  OLLAMA_ORIGINS=* ollama serve
                </code>
                <p>Or set the environment variable permanently.</p>
              </div>
            )}
            {localConfig.connectionMode === 'proxy' && (
              <p className="text-xs text-muted-foreground">
                Proxy mode only works when this app runs on the same machine as Ollama (e.g., local development).
              </p>
            )}
          </div>

          <div className="space-y-4 rounded-lg border border-border bg-secondary/20 p-4">
            <div className="flex items-center gap-2">
              <Label className="text-foreground text-sm font-medium">HTTP Basic Authentication</Label>
              <span className="text-xs text-muted-foreground">(Optional)</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="username" className="text-xs text-muted-foreground">Username</Label>
                <Input
                  id="username"
                  placeholder="username"
                  value={localConfig.username || ''}
                  onChange={(e) => setLocalConfig(prev => ({ ...prev, username: e.target.value }))}
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  autoComplete="username"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password" className="text-xs text-muted-foreground">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="password"
                    value={localConfig.password || ''}
                    onChange={(e) => setLocalConfig(prev => ({ ...prev, password: e.target.value }))}
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground pr-10"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Only needed if your Ollama instance is behind a reverse proxy with authentication.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="baseUrl" className="text-foreground">Ollama API URL</Label>
            <div className="flex gap-2">
              <Input
                id="baseUrl"
                placeholder="http://localhost:11434"
                value={localConfig.baseUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => fetchModels()}
                disabled={loading || !localConfig.baseUrl}
                className="border-border hover:bg-secondary"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            {connectionStatus === 'success' && (
              <p className="text-sm text-green-500 flex items-center gap-1">
                <Check className="h-3 w-3" /> Connected successfully
              </p>
            )}
            {error && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {error}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Default: http://localhost:11434
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="model" className="text-foreground">Model</Label>
            <Select
              value={localConfig.model}
              onValueChange={(value) => setLocalConfig(prev => ({ ...prev, model: value }))}
              disabled={models.length === 0}
            >
              <SelectTrigger className="bg-input border-border text-foreground">
                <SelectValue placeholder={models.length === 0 ? "Connect to fetch models" : "Select a model"} />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {models.map((model) => (
                  <SelectItem key={model.name} value={model.name} className="text-popover-foreground">
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {models.length > 0 
                ? `${models.length} model${models.length > 1 ? 's' : ''} available`
                : 'Click refresh to load available models'
              }
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange?.(false)} className="border-border">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!localConfig.baseUrl || !localConfig.model}>
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
