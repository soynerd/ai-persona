"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, Settings, RotateCcw, Users } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: string;
  isUser: boolean;
}

interface OnlineUser {
  id: string;
  name: string;
  avatar: string;
  isActive: boolean;
}

export default function TapariGroupChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Welcome to Chai Tapari! ☕ Hitesh and Piyush have joined the chat. Say hello!",
      sender: "Tapari Host",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isUser: false,
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [mode, setMode] = useState("casual");
  const [onlineUsers] = useState<OnlineUser[]>([
    {
      id: "1",
      name: "Hitesh",
      avatar: "/hitesh-choudhary-portrait.jpg",
      isActive: true,
    },
    {
      id: "2",
      name: "Piyush",
      avatar: "/piyush-garg-portrait.jpg",
      isActive: true,
    },
    { id: "3", name: "You", avatar: "/you.jpg", isActive: true },
    {
      id: "4",
      name: "Priya",
      avatar: "/female-developer.png",
      isActive: false,
    },
    { id: "5", name: "System", avatar: "/logo.png", isActive: false },
    { id: "6", name: "Tapari Host", avatar: "/logo.png", isActive: false },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: "You",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isUser: true,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputMessage("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/group-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          temperature: temperature,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "API request failed");
      }

      const data = await res.json();

      if (data.output && data.sender) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.output,
          sender: data.sender, // Dynamic sender from the API
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isUser: false,
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        throw new Error("Received an invalid response from the server.");
      }
    } catch (error: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Sorry, an error occurred: ${error.message}`,
        sender: "System",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isUser: false,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleBack = () => {
    if (messages.length > 1) {
      setShowConfirmDialog(true);
    } else {
      router.push("/");
    }
  };

  const confirmBack = () => {
    router.push("/");
  };

  const handleNewChat = () => {
    if (messages.length > 1) {
      setShowConfirmDialog(true);
    }
  };

  const confirmNewChat = () => {
    setMessages([messages[0]]); // Keep welcome message
    setShowConfirmDialog(false);
  };

  const modes = [
    { id: "auto", name: "Auto", description: "Balanced responses" },
    { id: "mentor", name: "Mentor", description: "Guidance focused" },
    { id: "feedback", name: "Feedback", description: "Constructive criticism" },
    { id: "casual", name: "Casual", description: "Friendly conversation" },
  ];

  return (
    <div className="flex flex-col h-screen bg-background w-4/5 mx-auto border border-border rounded-2xl shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <button
          onClick={handleBack}
          className="p-2 hover:bg-accent rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
            <span className="text-white text-lg">🫖</span>
          </div>
          <div>
            <h1 className="font-semibold text-foreground">Chai Tapari</h1>
            <p className="text-sm text-muted-foreground flex items-center">
              <Users className="w-3 h-3 mr-1" />
              {onlineUsers.filter((u) => u.isActive).length} online
            </p>
          </div>
        </div>

        <button
          onClick={handleNewChat}
          className="p-2 hover:bg-accent rounded-lg transition-colors"
        >
          <RotateCcw className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Online Users Bar */}
      <div className="flex items-center space-x-2 p-3 bg-card border-b border-border overflow-x-auto">
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          Online:
        </span>
        {onlineUsers
          .filter((user) => user.isActive)
          .map((user) => (
            <div
              key={user.id}
              className="flex items-center space-x-1 bg-accent px-2 py-1 rounded-full whitespace-nowrap"
            >
              <div className="w-6 h-6 rounded-full overflow-hidden">
                <img
                  src={user.avatar || "/placeholder.svg"}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs text-foreground">{user.name}</span>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.isUser ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md ${
                message.isUser ? "order-2" : "order-1"
              }`}
            >
              {!message.isUser && (
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-6 h-6 rounded-full overflow-hidden">
                    <img
                      src={
                        onlineUsers.find((u) => u.name === message.sender)
                          ?.avatar || "/placeholder.svg"
                      }
                      alt={message.sender}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {message.sender}
                  </span>
                </div>
              )}
              <div
                className={`px-4 py-2 rounded-2xl ${
                  message.isUser
                    ? "bg-orange-500 text-white"
                    : "bg-card text-card-foreground border border-border"
                }`}
              >
                <p className="text-sm">{message.text}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-1 text-right">
                {message.timestamp}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-6 h-6 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"></div>
                  <div
                    className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">
                Charcha Comming...
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Share your thoughts with the group..."
              className="w-full px-4 py-3 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-foreground placeholder-muted-foreground"
            />
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-3 hover:bg-accent rounded-2xl transition-colors"
          >
            <Settings className="w-5 h-5 text-muted-foreground" />
          </button>
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="p-3 bg-orange-500 hover:bg-orange-600 disabled:bg-muted disabled:cursor-not-allowed rounded-2xl transition-colors"
          >
            <Send className="w-5 h-5 text-gray-300" />
          </button>
        </div>
      </div>

      {/* Settings Panel and Dialogs would go here, no changes needed for them */}
      {/* ... (keep the existing SettingsPanel and ConfirmDialog components) ... */}
    </div>
  );
}
