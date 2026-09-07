import { useState, useRef, useEffect } from "react";
import api from "../api/axios";

const BOT_AVATAR = "✦";
const USER_AVATAR = "◈";

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-3">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-teal-500/30 border border-teal-400/50 flex items-center justify-center text-teal-300 text-xs">
        {BOT_AVATAR}
      </div>
      <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-slate-800/80 border border-slate-700/60 backdrop-blur-sm">
        <div className="flex gap-1 items-center h-4">
          <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}

function ChatMessage({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex items-end gap-2 mb-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div
        className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border
          ${isUser
            ? "bg-teal-600/40 border-teal-500/60 text-teal-200"
            : "bg-slate-700/60 border-slate-600/60 text-teal-300"
          }`}
      >
        {isUser ? USER_AVATAR : BOT_AVATAR}
      </div>
      <div
        className={`max-w-[78%] px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words
          ${isUser
            ? "bg-teal-700/50 border border-teal-500/40 text-teal-50 rounded-2xl rounded-br-sm"
            : "bg-slate-800/80 border border-slate-700/60 text-slate-200 rounded-2xl rounded-bl-sm"
          } backdrop-blur-sm`}
      >
        {msg.text}
      </div>
    </div>
  );
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hey there! 👋 I'm an AI assistant for this portfolio. Ask me anything about skills, projects, or experience!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 100);
      setHasNewMessage(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (!isOpen && messages.length > 1) {
      setHasNewMessage(true);
    }
  }, [messages]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg = { role: "user", text: trimmed };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    // Build history for context (exclude the greeting message from history sent to backend)
    const history = newMessages.slice(1, -1).map((m) => ({
      role: m.role,
      text: m.text,
    }));

    try {
      const { data } = await api.post("/chat", {
        message: trimmed,
        history,
      });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.reply },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Sorry, I encountered an error. Please try again in a moment.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        text: "Hey there! 👋 I'm an AI assistant for this portfolio. Ask me anything about skills, projects, or experience!",
      },
    ]);
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-1 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Chat Panel */}
      <div
        className={`fixed top-50 right-20 z-1 flex flex-col
          w-[340px] sm:w-[380px] h-[520px] max-h-[80vh]
          rounded-2xl border border-teal-700/50 shadow-2xl overflow-hidden
          bg-gradient-to-b from-slate-900/95 via-teal-950/95 to-slate-900/95
          backdrop-blur-xl
          transition-all duration-300 ease-out
          ${isOpen ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" : "opacity-0 scale-95 translate-y-4 pointer-events-none"}
        `}
        style={{
          boxShadow: isOpen
            ? "0 0 0 1px rgba(20,184,166,0.15), 0 25px 50px -12px rgba(0,0,0,0.7), 0 0 60px rgba(20,184,166,0.07)"
            : undefined,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-teal-800/50 bg-slate-900/60 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-slate-900 font-bold text-sm shadow-lg shadow-teal-500/30">
                ✦
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-900 animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white font-sub-header-text tracking-wide">Portfolio AI</p>
              <p className="text-[10px] text-teal-400/80 -mt-0.5">Always online</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={clearChat}
              title="Clear chat"
              className="p-1.5 rounded-lg text-slate-400 hover:text-teal-300 hover:bg-teal-900/40 transition-colors duration-150"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10" /><polyline points="23 20 23 14 17 14" />
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
              </svg>
            </button>
            <button
              onClick={() => setIsOpen(false)}
              title="Close"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-900/20 transition-colors duration-150"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 scrollable space-y-1">
          {messages.map((msg, i) => (
            <ChatMessage key={i} msg={msg} />
          ))}
          {isLoading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-3 py-3 border-t border-teal-800/50 bg-slate-900/60 flex-shrink-0">
          <div className="flex items-end gap-2 bg-slate-800/60 border border-slate-700/60 rounded-xl px-3 py-2 focus-within:border-teal-600/60 focus-within:shadow-[0_0_0_2px_rgba(20,184,166,0.15)] transition-all duration-200">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything…"
              rows={1}
              disabled={isLoading}
              className="flex-1 resize-none bg-transparent text-sm text-slate-200 placeholder-slate-500 outline-none leading-relaxed max-h-28 scrollable disabled:opacity-50"
              style={{ fieldSizing: "content" }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="flex-shrink-0 w-8 h-8 rounded-lg bg-teal-600 hover:bg-teal-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-white transition-all duration-150 hover:shadow-md hover:shadow-teal-500/30 active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
          <p className="text-[10px] text-slate-600 text-center mt-1.5">Press Enter to send · Shift+Enter for newline</p>
        </div>
      </div>

      {/* Floating Toggle Button */}
      <button
        id="ai-chatbot-toggle"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`fixed top-100 right-4 z-1 w-14 h-14 rounded-full flex items-center justify-center
          shadow-lg transition-all duration-300 ease-out
          hover:scale-110 active:scale-95
          ${isOpen
            ? "bg-slate-700 hover:bg-slate-600 shadow-slate-900/50"
            : "bg-gradient-to-br from-teal-500 to-teal-700 hover:from-teal-400 hover:to-teal-600 shadow-teal-700/50"
          }`}
        style={{
          boxShadow: isOpen
            ? undefined
            : "0 4px 20px rgba(20,184,166,0.4), 0 2px 8px rgba(0,0,0,0.3)",
        }}
        aria-label={isOpen ? "Close AI chat" : "Open AI chat"}
      >
        {/* Ping ring when closed */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-teal-500/40 animate-ping" />
        )}
        {/* Notification dot */}
        {!isOpen && hasNewMessage && (
          <span className="absolute top-1 right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900 z-10" />
        )}

        <span
          className={`transition-all duration-300 ${isOpen ? "rotate-90 scale-90" : "rotate-0 scale-100"}`}
        >
          {isOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-slate-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          )}
        </span>
      </button>
    </>
  );
}
