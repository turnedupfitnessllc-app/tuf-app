import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Loader2 } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "jarvis";
  content: string;
  timestamp: Date;
}

/**
 * JARVIS Chat Interface
 * AI-powered coaching with Panther character
 * Real-time behavioral learning and personalized guidance
 */
export default function JarvisChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "jarvis",
      content: "Hey there! I'm JARVIS, your personal AI coach. I'm here to help you crush your fitness goals. What's on your mind today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate JARVIS response (in real app, this would call Claude API)
    setTimeout(() => {
      const jarvisResponses = [
        "That's a solid goal! Here's what I'd recommend: focus on progressive overload. Add 5 pounds to your lifts or 2 more reps each week.",
        "I'm tracking your progress. You've been consistent this week - that's elite-level discipline. Keep that momentum going.",
        "Your protein intake is looking good at 120g daily. That's exactly where it needs to be for muscle maintenance at 40+.",
        "Let's talk about your recovery. Are you getting 7-9 hours of sleep? That's where the real gains happen.",
        "I notice you've been hitting your workouts hard. Make sure you're not skipping mobility work - that's crucial for joint health.",
      ];

      const response = jarvisResponses[Math.floor(Math.random() * jarvisResponses.length)];

      const jarvisMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "jarvis",
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, jarvisMessage]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">JARVIS Coaching</h1>
        <p className="text-muted-foreground">Your AI coach that grows with you</p>
      </div>

      {/* Chat Container */}
      <Card className="flex flex-col h-[600px] md:h-[700px] bg-card border-border">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-lg ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : "bg-secondary text-secondary-foreground rounded-bl-none border border-border"
                }`}
              >
                <p className="text-sm md:text-base">{message.content}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-secondary text-secondary-foreground px-4 py-3 rounded-lg rounded-bl-none border border-border">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">JARVIS is thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-border p-4 md:p-6 bg-background">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              type="text"
              placeholder="Ask JARVIS anything about your fitness journey..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="flex-1 bg-input border-border text-foreground placeholder-muted-foreground"
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </Card>

      {/* Info Section */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-card border-border">
          <h3 className="font-semibold text-sm mb-2">💪 Strength Focus</h3>
          <p className="text-xs text-muted-foreground">
            Building muscle that protects your joints and supports your metabolism
          </p>
        </Card>
        <Card className="p-4 bg-card border-border">
          <h3 className="font-semibold text-sm mb-2">🧠 Smart Adaptation</h3>
          <p className="text-xs text-muted-foreground">
            JARVIS learns your patterns and adjusts your program in real-time
          </p>
        </Card>
        <Card className="p-4 bg-card border-border">
          <h3 className="font-semibold text-sm mb-2">📊 Progress Tracking</h3>
          <p className="text-xs text-muted-foreground">
            Every workout, meal, and milestone feeds your personalized journey
          </p>
        </Card>
      </div>

      {/* Powered by Grok — minimal attribution */}
      <div className="mt-3 flex items-center justify-center gap-1.5">
        <span className="text-[10px] text-muted-foreground/50">AI powered by</span>
        <a
          href="https://grok-demo.manus.space"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-muted-foreground/60 hover:text-muted-foreground transition-colors font-medium"
        >
          Grok xAI
        </a>
      </div>
    </div>
  );
}
