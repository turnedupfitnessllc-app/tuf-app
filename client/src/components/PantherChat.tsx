import React, { useState, useRef, useEffect } from "react"
import { Send, Loader, User } from "lucide-react"
import { AngleButton } from "./ui/angle-button"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface PantherChatProps {
  className?: string
}

export const PantherChat: React.FC<PantherChatProps> = ({ className = "" }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "IDENTIFY THE WEAK LINK.\n\nThe Panther System is online. I assess, diagnose, and prescribe — no fluff, no filler. Tell me what's going on with your body or your training.\n\n→ Be specific. Precise problem, precise fix.",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/panther", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error("The Panther System is temporarily unavailable")
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Panther System error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "SYSTEM TEMPORARILY OFFLINE.\n\nThe Panther System encountered an error. Check your connection and try again.\n\n→ If the problem persists, reload the app.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const quickActions = [
    { label: "Shoulder Pain", prompt: "I have anterior shoulder pain when pressing overhead. What's the root cause?" },
    { label: "Knee Collapse", prompt: "My knees cave inward when I squat. What's causing this?" },
    { label: "Lower Back", prompt: "I have lower back pain after deadlifts. What's the issue?" },
    { label: "40+ Training", prompt: "I'm 47 and want to start strength training. Where do I begin?" },
  ]

  return (
    <div className={`flex flex-col h-screen bg-gray-950 rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-black p-6 text-white border-b border-orange-600/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-600/20 border border-orange-600/50 flex items-center justify-center">
            <span className="text-orange-500 font-black text-sm">PS</span>
          </div>
          <div>
            <h2 className="text-xl font-black tracking-widest text-white">THE PANTHER SYSTEM</h2>
            <p className="text-xs text-orange-400 tracking-wider">CLINICAL COACHING INTELLIGENCE · ADULTS 40+</p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 1 && (
          <div className="flex flex-col gap-3">
            <p className="text-gray-500 text-xs tracking-widest uppercase mb-2">Common diagnostics:</p>
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => setInput(action.prompt)}
                className="text-left p-3 rounded-lg bg-gray-900 hover:bg-gray-800 transition-colors border border-gray-800 hover:border-orange-600/50"
              >
                <p className="text-orange-400 font-bold text-xs tracking-wider uppercase">{action.label}</p>
                <p className="text-gray-400 text-xs mt-1">{action.prompt}</p>
              </button>
            ))}
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {message.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-orange-600/20 border border-orange-600/40 flex items-center justify-center flex-shrink-0">
                <span className="text-orange-500 font-black text-xs">PS</span>
              </div>
            )}

            <div
              className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-lg ${
                message.role === "user"
                  ? "bg-orange-600 text-white rounded-br-none"
                  : "bg-gray-900 text-gray-100 rounded-bl-none border border-gray-800 whitespace-pre-line"
              }`}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>
              <p className={`text-xs mt-2 ${message.role === "user" ? "text-orange-100" : "text-gray-600"}`}>
                {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>

            {message.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-600/20 border border-orange-600/40 flex items-center justify-center flex-shrink-0">
              <span className="text-orange-500 font-black text-xs">PS</span>
            </div>
            <div className="bg-gray-900 text-gray-100 px-4 py-3 rounded-lg border border-gray-800 rounded-bl-none">
              <div className="flex items-center gap-2">
                <Loader className="w-4 h-4 animate-spin text-orange-500" />
                <span className="text-sm text-gray-400 tracking-wider">ANALYZING...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-800 p-6 bg-gray-900">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your pain, movement issue, or training question..."
            className="flex-1 px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-600 border border-gray-700 focus:border-orange-600 focus:outline-none transition-colors text-sm"
            disabled={isLoading}
          />
          <AngleButton
            type="submit"
            variant="primary"
            size="md"
            disabled={isLoading || !input.trim()}
            icon={<Send className="w-4 h-4" />}
            iconPosition="right"
          >
            Send
          </AngleButton>
        </form>
      </div>
    </div>
  )
}

// Legacy export alias for backward compatibility
export const PantherChatWidget = PantherChat

export default PantherChat
