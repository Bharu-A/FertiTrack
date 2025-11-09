import React, { useState, useRef, useEffect } from 'react';
import { Send, X, MessageCircle } from 'lucide-react';

export default function ChatBox({ onClose }) {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! How can I help you with your fertilizer needs today?", sender: 'shopkeeper', timestamp: new Date() }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;

    const userMessage = {
      id: messages.length + 1,
      text: newMessage,
      sender: 'farmer',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');

    // Simulate shopkeeper response
    setTimeout(() => {
      const responses = [
        "Thanks for your message! We'll check the availability.",
        "That's a great choice! We have that in stock.",
        "We can deliver that to your farm tomorrow.",
        "Would you like to know more about our organic options?"
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const shopkeeperMessage = {
        id: messages.length + 2,
        text: randomResponse,
        sender: 'shopkeeper',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, shopkeeperMessage]);
    }, 1000);
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
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-xl transition-colors"
        >
          <X size={18} className="text-white" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'farmer' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl p-3 ${
                message.sender === 'farmer'
                  ? 'bg-emerald-500/80 text-white rounded-br-none'
                  : 'bg-white/20 text-white rounded-bl-none'
              }`}
            >
              <p className="text-sm">{message.text}</p>
              <p className="text-xs opacity-60 mt-1">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
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
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
          />
          <button
            onClick={handleSendMessage}
            className="bg-emerald-500/80 hover:bg-emerald-500 text-white p-2 rounded-xl transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}