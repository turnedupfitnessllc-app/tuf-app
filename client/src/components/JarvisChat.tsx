import React, { useState, useRef, useEffect } from "react"
import { Send, Loader, Bot, User } from "lucide-react"
import { AngleButton } from "./ui/angle-button"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface PantherChatWidgetProps {
  className?: string
}

export const PantherChatWidget: React.FC<PantherChatWidgetProps> = ({ className = "" }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hey there! I'm The Panther System, your AI coach. I'm here to help you with workouts, nutrition, and personalized coaching. What can I help you with today?",
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

    // Add user message
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
      // Call Claude API via backend
      const response = await fetch("/api/jarvis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          conversationHistory: messages,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response from The Panther System")
      }

      const data = await response.json()

      // Add assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error:", error)
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const quickActions = [
    { label: "Workout Plan", prompt: "Create a 30-minute chest workout for me" },
    { label: "Meal Plan", prompt: "I need a 2000 calorie meal plan with 150g protein" },
    { label: "Form Tips", prompt: "How do I improve my squat form?" },
    { label: "Progress", prompt: "How can I track my fitness progress?" },
  ]

  return (
    <div className={`flex flex-col h-screen bg-gray-950 rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">PANTHER</h2>
            <p className="text-sm text-red-100">Your AI Fitness Coach</p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 1 && (
          <div className="flex flex-col gap-3">
            <p className="text-gray-400 text-sm mb-4">Quick actions:</p>
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => setInput(action.prompt)}
                className="text-left p-3 rounded-lg bg-gray-900 hover:bg-gray-800 transition-colors border border-gray-800 hover:border-red-600"
              >
                <p className="text-white font-semibold text-sm">{action.label}</p>
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
              <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
            )}

            <div
              className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-lg ${
                message.role === "user"
                  ? "bg-red-600 text-white rounded-br-none"
                  : "bg-gray-900 text-gray-100 rounded-bl-none border border-gray-800"
              }`}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>
              <p className={`text-xs mt-2 ${message.role === "user" ? "text-red-100" : "text-gray-500"}`}>
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
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
            <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-gray-900 text-gray-100 px-4 py-3 rounded-lg border border-gray-800 rounded-bl-none">
              <div className="flex items-center gap-2">
                <Loader className="w-4 h-4 animate-spin" />
                <span className="text-sm">Panther System is analyzing...</span>
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
            placeholder="Ask The Panther System anything about fitness, nutrition, or workouts..."
            className="flex-1 px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:border-red-600 focus:outline-none transition-colors"
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

export default PantherChatWidget
