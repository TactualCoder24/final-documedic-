import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './ui/Button';
import { Sparkles, X, SendHorizonal } from './icons/Icons';
import Input from './ui/Input';
import { ChatMessage } from '../types';
import { chatWithShakti } from '../services/gemini';
import Logo from './icons/Logo';

const ShaktiAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      sender: 'ai',
      text: "Hello! I'm Shakti, your AI health assistant. How can I help you with DocuMedic or your wellness questions today?",
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  useEffect(() => {
    // Show tooltip after a delay on first load
    const showTimer = setTimeout(() => {
      setShowTooltip(true);
    }, 3000);

    // Hide tooltip after it has been shown for 10 seconds
    const hideTimer = setTimeout(() => {
      setShowTooltip(false);
    }, 13000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputValue,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const aiResponseText = await chatWithShakti(inputValue);
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiResponseText,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: "I'm sorry, I encountered an error. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChat = () => {
    setIsOpen(prev => !prev);
    // Hide tooltip permanently once user interacts
    setShowTooltip(false);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="w-[calc(100vw-3rem)] max-w-sm h-[70vh] max-h-[500px] bg-card rounded-2xl shadow-2xl border border-border/60 flex flex-col origin-bottom-right"
              role="dialog"
              aria-live="polite"
            >
              <header className="flex items-center justify-between p-4 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-primary/10 rounded-full">
                     <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-bold font-heading">Shakti</h3>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)} aria-label="Close chat">
                  <X className="h-4 w-4" />
                </Button>
              </header>

              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.sender === 'ai' && (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Logo className="w-5 h-5 text-primary" />
                      </div>
                    )}
                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-secondary text-secondary-foreground rounded-bl-none'}`}>
                      {msg.text.split('\n').map((line, index) => {
                          if (line.trim().startsWith('-')) return <p key={index} className="pl-2">{line.trim()}</p>;
                          return <p key={index}>{line}</p>;
                      })}
                    </div>
                  </div>
                ))}
                {isLoading && (
                   <div className="flex items-end gap-2 justify-start">
                     <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                       <Logo className="w-5 h-5 text-primary" />
                     </div>
                     <div className="p-3 rounded-2xl bg-secondary rounded-bl-none">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0s'}}></span>
                            <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                            <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
                        </div>
                     </div>
                   </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              <footer className="p-4 border-t border-border/60">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <Input
                    type="text"
                    placeholder="Ask a question..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    disabled={isLoading}
                    className="flex-1"
                    autoComplete="off"
                  />
                  <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim()} aria-label="Send message">
                    <SendHorizonal className="h-5 w-5" />
                  </Button>
                </form>
              </footer>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
            {!isOpen && showTooltip && (
                <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="absolute bottom-20 right-0 w-max max-w-xs bg-card p-3 rounded-lg shadow-lg border border-border/60 origin-bottom-right"
                    role="tooltip"
                >
                    <p className="text-sm text-foreground">Hi there! Have a question? <span className="font-semibold text-primary">Chat with me!</span></p>
                    <div className="absolute -bottom-2 right-5 w-4 h-4 bg-card border-b border-r border-border/60 transform rotate-45"></div>
                </motion.div>
            )}
        </AnimatePresence>

        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1, duration: 0.3, type: 'spring', stiffness: 200 }}
        >
          <Button
            size="lg"
            className="rounded-full w-16 h-16 shadow-lg shadow-primary/30"
            onClick={toggleChat}
            aria-label={isOpen ? "Close Shakti" : "Open Shakti"}
          >
            <AnimatePresence initial={false} mode="wait">
                 <motion.div
                    key={isOpen ? 'close' : 'open'}
                    initial={{ rotate: -45, opacity: 0, scale: 0.5 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: 45, opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.2 }}
                 >
                    {isOpen ? <X className="h-7 w-7"/> : <Sparkles className="h-7 w-7"/>}
                 </motion.div>
            </AnimatePresence>
          </Button>
        </motion.div>
      </div>
    </>
  );
};

export default ShaktiAssistant;