import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Send, User, Bot, Copy, Download, Trash2 } from 'lucide-react'
import { AIMessage, AIParameters } from '@/types/ai'
import { blink } from '@/blink/client'
import { toast } from 'sonner'

interface ChatInterfaceProps {
  messages: AIMessage[]
  onMessagesChange: (messages: AIMessage[]) => void
  parameters: AIParameters
  isStreaming: boolean
  onStreamingChange: (streaming: boolean) => void
}

export function ChatInterface({ messages, onMessagesChange, parameters, isStreaming, onStreamingChange }: ChatInterfaceProps) {
  const [input, setInput] = useState('')
  const [streamingContent, setStreamingContent] = useState('')
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages, streamingContent])

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now()
    }

    const newMessages = [...messages, userMessage]
    onMessagesChange(newMessages)
    setInput('')
    onStreamingChange(true)
    setStreamingContent('')

    try {
      const conversationMessages = [
        { role: 'system' as const, content: parameters.systemPrompt },
        ...newMessages.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }))
      ]

      let fullResponse = ''
      
      await blink.ai.streamText(
        {
          messages: conversationMessages,
          model: parameters.model,
          maxTokens: parameters.maxTokens,
          temperature: parameters.temperature,
          topP: parameters.topP,
          frequencyPenalty: parameters.frequencyPenalty,
          presencePenalty: parameters.presencePenalty
        },
        (chunk) => {
          fullResponse += chunk
          setStreamingContent(fullResponse)
        }
      )

      // Add the complete response to messages
      const assistantMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fullResponse,
        timestamp: Date.now()
      }

      onMessagesChange([...newMessages, assistantMessage])
      setStreamingContent('')
    } catch (error) {
      console.error('AI Error:', error)
      toast.error('Failed to get AI response')
    } finally {
      onStreamingChange(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
    toast.success('Copied to clipboard')
  }

  const clearChat = () => {
    onMessagesChange([])
    setStreamingContent('')
  }

  const exportChat = () => {
    const chatData = {
      messages,
      parameters,
      exportedAt: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `unbounded-ai-chat-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Chat exported successfully')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b cyber-border">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-[hsl(var(--cyber-purple))]" />
          <h2 className="font-semibold text-[hsl(var(--cyber-purple))] neon-text">Unbounded AI</h2>
          <Badge variant="outline" className="text-xs">
            {parameters.model}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={exportChat}
            className="text-[hsl(var(--cyber-amber))] hover:bg-[hsl(var(--cyber-amber)/0.1)]"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearChat}
            className="text-red-400 hover:bg-red-400/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4 scrollbar-thin">
        <div className="space-y-4">
          {messages.length === 0 && !streamingContent && (
            <div className="text-center py-12">
              <Bot className="w-12 h-12 mx-auto mb-4 text-[hsl(var(--cyber-purple))] opacity-50" />
              <p className="text-muted-foreground">Start a conversation with the unbounded AI model</p>
              <p className="text-sm text-muted-foreground mt-2">
                This AI has minimal restrictions and can discuss any topic
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className="group">
              <Card className={`${
                message.role === 'user' 
                  ? 'ml-12 bg-[hsl(var(--cyber-purple)/0.1)] cyber-border' 
                  : 'mr-12 bg-[hsl(var(--cyber-surface))] cyber-border'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user' 
                        ? 'bg-[hsl(var(--cyber-purple))]' 
                        : 'bg-[hsl(var(--cyber-amber))]'
                    }`}>
                      {message.role === 'user' ? (
                        <User className="w-4 h-4 text-black" />
                      ) : (
                        <Bot className="w-4 h-4 text-black" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-sm">
                          {message.role === 'user' ? 'You' : 'AI'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="prose prose-sm max-w-none text-foreground">
                        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                          {message.content}
                        </pre>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyMessage(message.content)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}

          {/* Streaming Message */}
          {streamingContent && (
            <div className="group">
              <Card className="mr-12 bg-[hsl(var(--cyber-surface))] cyber-border">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[hsl(var(--cyber-amber))]">
                      <Bot className="w-4 h-4 text-black" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-sm">AI</span>
                        <Badge variant="outline" className="text-xs animate-pulse">
                          Generating...
                        </Badge>
                      </div>
                      <div className="prose prose-sm max-w-none text-foreground">
                        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                          {streamingContent}
                          <span className="animate-pulse">▋</span>
                        </pre>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t cyber-border">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask anything... no restrictions"
            className="cyber-border bg-black/30 resize-none min-h-[60px] max-h-[200px]"
            disabled={isStreaming}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="bg-[hsl(var(--cyber-purple))] hover:bg-[hsl(var(--cyber-purple)/0.8)] cyber-glow"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <span>Press Enter to send, Shift+Enter for new line</span>
          <span>{input.length} characters</span>
        </div>
      </div>
    </div>
  )
}