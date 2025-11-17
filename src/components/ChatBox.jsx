// src/components/ChatBox.jsx

import React, { useState, useRef, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Send, X, MessageCircle } from "lucide-react";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

async function getSmartReply(message) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(message);
    return result.response.text();
  } catch (error) {
    console.error("Error generating reply:", error);
    return "Sorry, I couldn't understand that.";
  }
}

export default function ChatBox({ onClose }) {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! How can I assist you today?",
      sender: "bot",
    },
  ]);

  const messagesEndRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message handler
  const handleSend = async () => {
    if (!newMessage.trim()) return;

    const userMsg = {
      id: Date.now(),
      text: newMessage,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMsg]);
    const query = newMessage;
    setNewMessage("");

    // Wait for Gemini
    const reply = await getSmartReply(query);

    const botMsg = {
      id: Date.now() + 1,
      text: reply,
      sender: "bot",
    };

    setMessages((prev) => [...prev, botMsg]);
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[500px] backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl shadow-2xl flex flex-col z-50">

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
            <MessageCircle size={20} className="text-emerald-300" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Farm Support</h3>
            <p className="text-white/60 text-xs">Online - Ready to help</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl">
          <X size={18} className="text-white" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl p-3 ${
                msg.sender === "user"
                  ? "bg-emerald-500/80 text-white rounded-br-none"
                  : "bg-white/20 text-white rounded-bl-none"
              }`}
            >
              <p className="text-sm">{msg.text}</p>
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/20">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your message..."
            className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-white/60 focus:outline-none"
          />
          <button
            onClick={handleSend}
            className="bg-emerald-500/80 hover:bg-emerald-500 text-white p-2 rounded-xl"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
