'use client'

import { User, Bot, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { Button } from '@/components/ui/button'
import type { Message } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={cn(
      "group flex gap-4 px-4 py-6",
      isUser ? "bg-transparent" : "bg-card/50"
    )}>
      <div className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
        isUser ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground"
      )}>
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div className="flex-1 space-y-2 overflow-hidden">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            {isUser ? 'You' : 'Ollama'}
          </span>
          <span className="text-xs text-muted-foreground">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <MessageContent content={message.content} isUser={isUser} />
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 px-2 text-muted-foreground hover:text-foreground"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 mr-1" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

function MessageContent({ content, isUser }: { content: string; isUser: boolean }) {
  if (isUser) {
    return (
      <p className="text-foreground whitespace-pre-wrap leading-relaxed">{content}</p>
    )
  }

  return (
    <div className="text-foreground leading-relaxed break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ node: _n, ...props }) => <h1 className="mt-6 mb-3 text-2xl font-semibold tracking-tight" {...props} />,
          h2: ({ node: _n, ...props }) => <h2 className="mt-5 mb-3 text-xl font-semibold tracking-tight" {...props} />,
          h3: ({ node: _n, ...props }) => <h3 className="mt-4 mb-2 text-lg font-semibold" {...props} />,
          h4: ({ node: _n, ...props }) => <h4 className="mt-4 mb-2 text-base font-semibold" {...props} />,
          h5: ({ node: _n, ...props }) => <h5 className="mt-3 mb-2 text-sm font-semibold" {...props} />,
          h6: ({ node: _n, ...props }) => <h6 className="mt-3 mb-2 text-sm font-semibold text-muted-foreground" {...props} />,
          p: ({ node: _n, ...props }) => <p className="my-3 first:mt-0 last:mb-0" {...props} />,
          ul: ({ node: _n, ...props }) => <ul className="my-3 list-disc space-y-1 pl-6" {...props} />,
          ol: ({ node: _n, ...props }) => <ol className="my-3 list-decimal space-y-1 pl-6" {...props} />,
          li: ({ node: _n, ...props }) => <li className="leading-relaxed" {...props} />,
          a: ({ node: _n, ...props }) => (
            <a
              className="text-accent underline underline-offset-2 hover:opacity-80"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          strong: ({ node: _n, ...props }) => <strong className="font-semibold text-foreground" {...props} />,
          em: ({ node: _n, ...props }) => <em className="italic" {...props} />,
          blockquote: ({ node: _n, ...props }) => (
            <blockquote className="my-3 border-l-2 border-border pl-4 italic text-muted-foreground" {...props} />
          ),
          hr: ({ node: _n, ...props }) => <hr className="my-6 border-border" {...props} />,
          table: ({ node: _n, ...props }) => (
            <div className="my-3 overflow-x-auto">
              <table className="w-full border-collapse text-sm" {...props} />
            </div>
          ),
          thead: ({ node: _n, ...props }) => <thead className="bg-secondary/50" {...props} />,
          th: ({ node: _n, ...props }) => <th className="border border-border px-3 py-2 text-left font-semibold" {...props} />,
          td: ({ node: _n, ...props }) => <td className="border border-border px-3 py-2" {...props} />,
          code: ({ node: _n, className, children, ...props }) => {
            const isInline = !/language-/.test(className ?? '')
            if (isInline) {
              return (
                <code
                  className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[0.9em] text-foreground"
                  {...props}
                >
                  {children}
                </code>
              )
            }
            return (
              <code className={cn('font-mono text-sm', className)} {...props}>
                {children}
              </code>
            )
          },
          pre: ({ node: _n, ...props }) => (
            <pre
              className="my-3 overflow-x-auto rounded-lg bg-secondary/80 p-4 text-sm"
              {...props}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
