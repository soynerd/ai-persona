"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, RotateCcw, Send, Settings, X } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  sender: "user" | "ai";
  timestamp: Date;
  isError?: boolean;
}

interface ChatSettings {
  temperature: number;
  mode: "auto" | "mentor" | "feedback" | "casual";
}

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-2xl p-6 max-w-sm mx-4 shadow-xl">
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6 text-sm">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-muted hover:bg-accent text-foreground rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const SettingsPanel = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
}: {
  isOpen: boolean;
  onClose: () => void;
  settings: ChatSettings;
  onSettingsChange: (settings: ChatSettings) => void;
}) => {
  if (!isOpen) return null;

  const modes = [
    {
      value: "auto",
      label: "Auto",
      description: "Adapts to conversation context",
    },
    {
      value: "mentor",
      label: "Mentor",
      description: "Provides guidance and advice",
    },
    {
      value: "feedback",
      label: "Feedback",
      description: "Offers constructive feedback",
    },
    {
      value: "casual",
      label: "Casual",
      description: "Relaxed and friendly conversation",
    },
  ] as const;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">
            Chat Settings
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Temperature Setting */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Temperature: {settings.temperature}
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={settings.temperature}
                onChange={(e) =>
                  onSettingsChange({
                    ...settings,
                    temperature: Number.parseFloat(e.target.value),
                  })
                }
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Conservative (0)</span>
                <span>Balanced (1)</span>
                <span>Creative (2)</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Controls response creativity and randomness
            </p>
          </div>

          {/* Mode Setting */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Conversation Mode
            </label>
            <div className="space-y-2">
              {modes.map((mode) => (
                <label
                  key={mode.value}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-accent cursor-pointer transition-colors"
                >
                  <input
                    type="radio"
                    name="mode"
                    value={mode.value}
                    checked={settings.mode === mode.value}
                    onChange={(e) =>
                      onSettingsChange({
                        ...settings,
                        mode: e.target.value as ChatSettings["mode"],
                      })
                    }
                    className="mt-0.5 w-4 h-4 text-orange-500 border-border focus:ring-orange-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-foreground text-sm">
                      {mode.label}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {mode.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const [showNewChatConfirm, setShowNewChatConfirm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<ChatSettings>({
    temperature: 1.0,
    mode: "auto",
  });

  const personaId = params.persona as string;

  const personas = {
    hitesh: {
      name: "Hitesh Choudhary",
      bio: "Full-Stack Developer & Educator with expertise in web development and programming education.",
      image: "/hitesh-choudhary-portrait.jpg",
    },
    piyush: {
      name: "Piyush Garg",
      bio: "Startup Founder & Tech Innovator with a passion for creating innovative solutions and leading successful tech ventures.",
      image: "/piyush-garg-portrait.jpg",
    },
  };

  const currentPersona = personas[personaId as keyof typeof personas];

  const startNewChat = async () => {
    if (!personaId) return;
    setIsTyping(true);
    setMessages([]); // Clear previous messages

    try {
      const res = await fetch("/api/start-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          persona: personaId,
          temperature: settings.temperature,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to start chat");
      }

      const data = await res.json();
      const welcomeMessage: Message = {
        id: "welcome",
        role: "assistant",
        content: data.output,
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        id: "error",
        content: `Error: ${error.message}`,
        sender: "ai",
        role: "assistant",
        timestamp: new Date(),
        isError: true,
      };
      setMessages([errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    startNewChat();
  }, [personaId]); // Re-start chat if persona changes

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          persona: personaId,
          messages: updatedMessages,
          temperature: settings.temperature,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "API request failed");
      }

      const data = await res.json();

      if (data.output) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.output,
          sender: "ai",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        throw new Error("Received an empty response from the AI.");
      }
    } catch (error: any) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Sorry, an error occurred: ${error.message}`,
        sender: "ai",
        role: "assistant",
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleNewChat = () => {
    if (messages.length > 0) {
      setShowNewChatConfirm(true);
    } else {
      startNewChat();
    }
  };

  const confirmNewChat = () => {
    setShowNewChatConfirm(false);
    startNewChat();
  };

  const handleBack = () => {
    if (
      messages.length > 1 ||
      (messages.length === 1 && !messages[0].isError)
    ) {
      setShowBackConfirm(true);
    } else {
      router.push("/");
    }
  };

  const confirmBack = () => {
    setShowBackConfirm(false);
    router.push("/");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!currentPersona) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Persona not found
          </h1>
          <button
            onClick={() => router.push("/")}
            className="text-blue-500 hover:underline"
          >
            Go back to homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-card rounded-3xl shadow-xl overflow-hidden border border-border">
          <div className="bg-card border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-accent rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-foreground" />
              </button>

              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden">
                  <Image
                    src={currentPersona.image || "/placeholder.svg"}
                    alt={currentPersona.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">
                    {currentPersona.name}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {formatTime(new Date())}
                  </p>
                </div>
              </div>

              <button
                onClick={handleNewChat}
                className="p-2 hover:bg-accent rounded-full transition-colors"
                title="Start new chat"
              >
                <RotateCcw className="w-5 h-5 text-foreground" />
              </button>
            </div>
          </div>

          {/* THIS IS THE LINE THAT WAS CHANGED */}
          <div className="h-[500px] overflow-y-auto px-6 py-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id}>
                {message.sender === "ai" ? (
                  <div className="flex items-start gap-3">
                    <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={currentPersona.image || "/placeholder.svg"}
                        alt={currentPersona.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="bg-muted text-foreground px-4 py-3 rounded-2xl rounded-tl-md max-w-xs lg:max-w-md">
                        <p className="text-sm leading-relaxed">
                          {message.content}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {currentPersona.name}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-end">
                    <div className="text-right">
                      <div className="bg-orange-500 text-white px-4 py-3 rounded-2xl rounded-tr-md max-w-xs lg:max-w-md inline-block">
                        <p className="text-sm leading-relaxed">
                          {message.content}
                        </p>
                      </div>
                      <div className="mt-1">
                        <span className="text-xs text-muted-foreground">
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {message.isError && (
                  <div className="flex justify-center mt-2">
                    <span className="text-xs text-red-500 bg-red-500/10 px-3 py-1 rounded-full">
                      {message.content}
                    </span>
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-start gap-3">
                <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={currentPersona.image || "/placeholder.svg"}
                    alt={currentPersona.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="bg-muted px-4 py-3 rounded-2xl rounded-tl-md">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-border px-6 py-4">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 bg-background border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-foreground placeholder:text-muted-foreground"
              />
              <button
                onClick={() => setShowSettings(true)}
                className="p-3 hover:bg-accent rounded-full transition-colors"
                title="Chat settings"
              >
                <Settings className="w-5 h-5 text-muted-foreground" />
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className={`p-3 rounded-full transition-colors ${
                  inputValue.trim()
                    ? "bg-orange-500 text-white hover:bg-orange-600"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showBackConfirm}
        onClose={() => setShowBackConfirm(false)}
        onConfirm={confirmBack}
        title="Leave Chat?"
        message="The current conversation will be lost. Are you sure you want to go back?"
      />

      <ConfirmDialog
        isOpen={showNewChatConfirm}
        onClose={() => setShowNewChatConfirm(false)}
        onConfirm={confirmNewChat}
        title="Start New Chat?"
        message="The current conversation will be lost. Are you sure you want to start a new chat?"
      />

      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSettingsChange={setSettings}
      />
    </div>
  );
}
