import { useState, useEffect } from 'react'
import { Toaster } from 'sonner'
import { ChatInterface } from '@/components/ChatInterface'
import { ParameterPanel } from '@/components/ParameterPanel'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Brain, Zap, Settings2, Github } from 'lucide-react'
import { AIMessage, AIParameters, DEFAULT_PARAMETERS } from '@/types/ai'
import { blink } from '@/blink/client'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [parameters, setParameters] = useState<AIParameters>(DEFAULT_PARAMETERS)
  const [isStreaming, setIsStreaming] = useState(false)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--cyber-bg))] flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-12 h-12 mx-auto mb-4 text-[hsl(var(--cyber-red))] animate-pulse" />
          <p className="text-[hsl(var(--cyber-red))] neon-text">Initializing Daemon...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[hsl(var(--cyber-bg))] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <Brain className="w-16 h-16 mx-auto mb-6 text-[hsl(var(--cyber-red))] neon-text" />
          <h1 className="text-3xl font-bold mb-4 text-[hsl(var(--cyber-red))] neon-text">
            Daemon
          </h1>
          <p className="text-muted-foreground mb-6">
            An experimental AI interface with minimal restrictions and flexible parameters for research purposes.
          </p>
          <Button 
            onClick={() => blink.auth.login()}
            className="bg-[hsl(var(--cyber-red))] hover:bg-[hsl(var(--cyber-red)/0.8)] cyber-glow"
          >
            <Zap className="w-4 h-4 mr-2" />
            Access AI Interface
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--cyber-bg))] text-foreground">
      {/* Header */}
      <header className="border-b cyber-border bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-[hsl(var(--cyber-red))] neon-text" />
              <div>
                <h1 className="text-xl font-bold text-[hsl(var(--cyber-red))] neon-text">
                  Daemon
                </h1>
                <p className="text-xs text-muted-foreground">
                  Experimental • Unrestricted • Research Purpose
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-[hsl(var(--cyber-amber))]">
                {parameters.model}
              </Badge>
              <Badge variant="outline" className="text-[hsl(var(--cyber-green))]">
                T: {parameters.temperature.toFixed(2)}
              </Badge>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Welcome, {user.email}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => blink.auth.logout()}
                  className="text-red-400 hover:bg-red-400/10"
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 h-[calc(100vh-80px)]">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
          {/* Parameter Panel */}
          <div className="lg:col-span-1">
            <ParameterPanel
              parameters={parameters}
              onParametersChange={setParameters}
              isStreaming={isStreaming}
            />
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <div className="h-full cyber-border rounded-lg bg-black/10 backdrop-blur-sm overflow-hidden">
              <ChatInterface
                messages={messages}
                onMessagesChange={setMessages}
                parameters={parameters}
                isStreaming={isStreaming}
                onStreamingChange={setIsStreaming}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t cyber-border bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>© 2024 Daemon</span>
              <Badge variant="outline" className="text-[hsl(var(--cyber-red))]">
                Experimental
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <span>Built with Blink SDK</span>
              <Button variant="ghost" size="sm" className="h-6 px-2">
                <Github className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </footer>

      <Toaster 
        theme="dark" 
        position="top-right"
        toastOptions={{
          style: {
            background: 'hsl(var(--cyber-surface))',
            border: '1px solid hsl(var(--cyber-red) / 0.3)',
            color: 'hsl(var(--foreground))'
          }
        }}
      />
    </div>
  )
}

export default App