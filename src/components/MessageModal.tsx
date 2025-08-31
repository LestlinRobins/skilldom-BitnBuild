import React, { useState, useEffect } from 'react';
import { X, Send, Sparkles } from 'lucide-react';

interface MessageModalProps {
  onClose: () => void;
  recipient?: string;
}

const MessageModal: React.FC<MessageModalProps> = ({ onClose, recipient = 'Community' }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! I saw your profile and I'm interested in learning about React.", sender: 'me', time: '2:30 PM' },
    { id: 2, text: "Hello! I'd be happy to help. What specific aspects of React would you like to focus on?", sender: 'them', time: '2:32 PM' }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      text: message,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');
    
    // Simulate typing indicator
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const response = {
        id: messages.length + 2,
        text: "That sounds great! I can definitely help you with that. When would be a good time for you?",
        sender: 'them',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, response]);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-primary-800 rounded-xl w-full max-w-md h-96 flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-primary-600">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-accent-500 rounded-full flex items-center justify-center">
              <Sparkles className="text-white" size={16} />
            </div>
            <h2 className="text-lg font-bold text-white">{recipient}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-3 py-2 rounded-lg ${
                  msg.sender === 'me'
                    ? 'bg-accent-500 text-white'
                    : 'bg-primary-600 text-gray-200'
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                <p className="text-xs opacity-75 mt-1">{msg.time}</p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-primary-600 text-gray-200 px-3 py-2 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-4 border-t border-primary-600">
          <div className="flex space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 bg-primary-600 border border-primary-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-colors"
            />
            <button
              type="submit"
              disabled={!message.trim()}
              className="bg-accent-500 hover:bg-accent-600 disabled:bg-accent-700 text-white p-2 rounded-lg transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MessageModal;