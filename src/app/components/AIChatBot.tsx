import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { motion, AnimatePresence } from "framer-motion";

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_MODEL = "google/gemma-3-27b-it:free";
const SYSTEM_PROMPT = "You are Techsathi, an AI assistant for the Smart Tech Service Portal (STS). You help customers with computer repair advice, laptop maintenance, booking services, tracking orders, and general tech queries. Keep responses concise, friendly, and helpful. Avoid markdown formatting."

type Message = {
  id: string;
  sender: "user" | "ai";
  text: string;
  feedback?: "up" | "down";
};

type OpenRouterMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export function AIChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "ai",
      text: "Hi! I'm Smart Tech Service Portal. Ask me about laptop maintenance, performance issues, or general tech advice!",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Conversation history sent to OpenRouter on each request
  const historyRef = useRef<OpenRouterMessage[]>([]);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, isTyping]);

  const handleFeedback = (messageId: string, type: "up" | "down") => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, feedback: type } : msg
      )
    );
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userText = inputText.trim();
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: userText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");

    if (!OPENROUTER_API_KEY) {
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: "⚠️ OpenRouter API key is missing! Please add VITE_OPENROUTER_API_KEY to your .env file and restart the server.",
      }]);
      return;
    }

    // Append user turn to history
    historyRef.current.push({ role: "user", content: userText });

    setIsTyping(true);
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin,
          "X-Title": "Smart Tech Service Portal",
        },
        body: JSON.stringify({
          model: OPENROUTER_MODEL,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...historyRef.current,
          ],
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const assistantText: string = data.choices?.[0]?.message?.content ?? "No response received.";

      // Append assistant turn to history
      historyRef.current.push({ role: "assistant", content: assistantText });

      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: assistantText,
      }]);
    } catch (error: unknown) {
      console.error("OpenRouter API Error:", error);
      const errMsg = error instanceof Error ? error.message : "Unknown error";
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: "Sorry, I encountered an error: " + errMsg,
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-4 w-80 sm:w-96"
          >
            <Card className="shadow-2xl border-purple-200 overflow-hidden flex flex-col h-[450px]">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  <CardTitle className="text-lg">Smart Tech Service Portal</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20 rounded-full w-8 h-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>
              
              <CardContent className="flex-1 p-0 flex flex-col bg-gray-50 overflow-hidden">
                <div className="flex-1 p-4 overflow-y-auto" ref={scrollRef}>
                  <div className="flex flex-col gap-3">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-2 max-w-[85%] ${
                          msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                        }`}
                      >
                        <div
                          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            msg.sender === "user"
                              ? "bg-blue-600 text-white"
                              : "bg-purple-100 text-purple-600"
                          }`}
                        >
                          {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                        </div>
                        <div className="flex flex-col gap-1">
                          <div
                            className={`p-3 rounded-2xl text-sm whitespace-pre-wrap ${
                              msg.sender === "user"
                                ? "bg-blue-600 text-white rounded-tr-sm"
                                : "bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm"
                            }`}
                          >
                            {msg.text}
                          </div>
                          {msg.sender === "ai" && (
                            <div className="flex items-center gap-1 ml-1">
                              <button
                                onClick={() => handleFeedback(msg.id, "up")}
                                className={`p-1 rounded-full transition-colors ${
                                  msg.feedback === "up"
                                    ? "text-green-600 bg-green-100"
                                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-200"
                                }`}
                                title="Helpful"
                              >
                                <ThumbsUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleFeedback(msg.id, "down")}
                                className={`p-1 rounded-full transition-colors ${
                                  msg.feedback === "down"
                                    ? "text-red-600 bg-red-100"
                                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-200"
                                }`}
                                title="Not Helpful"
                              >
                                <ThumbsDown className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex gap-2 max-w-[85%] mr-auto">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                          <Bot className="w-4 h-4" />
                        </div>
                        <div className="p-3 rounded-2xl text-sm bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-3 bg-white border-t flex gap-2 items-center">
                  <Input
                    placeholder="Ask about laptop tech..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isTyping}
                    className="flex-1 rounded-full bg-gray-100 border-transparent focus-visible:ring-purple-500"
                  />
                  <Button
                    onClick={handleSend}
                    size="icon"
                    className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90 w-10 h-10 flex-shrink-0"
                    disabled={!inputText.trim() || isTyping}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-colors ${
            isOpen 
              ? "bg-gray-800 hover:bg-gray-700 text-white" 
              : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          }`}
        >
          {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        </Button>
      </motion.div>
    </div>
  );
}
