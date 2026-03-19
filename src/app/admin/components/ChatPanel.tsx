"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

const QUICK_CHIPS = [
  "Change the headline",
  "Update phone number",
  "Add a new class",
  "Change primary color",
  "Show version history",
  "Undo last change",
];

const INITIAL_MESSAGE: Message = {
  role: "assistant",
  content:
    "Hey! I'm your site editor. Tell me what you'd like to change — I'll update the site and you'll see it live in the preview.\n\nTry things like:\n- \"Change the headline to Summer Special\"\n- \"Update the phone number\"\n- \"Add a new class called Spin Cycle\"\n- \"Change the primary color to blue\"",
  timestamp: new Date(),
};

interface ChatPanelProps {
  onContentChanged?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export default function ChatPanel({ onContentChanged, className = "", style }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function autoResize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }

  async function handleSend(e?: React.FormEvent) {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const newMsg: Message = { role: "user", content: userMessage, timestamp: new Date() };
    setMessages((prev) => [...prev, newMsg]);
    setLoading(true);

    try {
      const allMessages = [...messages, newMsg];
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: allMessages
            .filter((_, i) => i > 0)
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response, timestamp: new Date() },
      ]);

      if (data.changed) {
        onContentChanged?.();
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function useChip(text: string) {
    setInput(text + " ");
    setTimeout(() => {
      textareaRef.current?.focus();
      autoResize();
    }, 0);
  }

  const charCount = input.length;

  return (
    <div className={`flex flex-col bg-[#09090b] ${className}`} style={style}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className={`flex items-start gap-2 max-w-[88%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                  msg.role === "user"
                    ? "bg-[#e63946] text-white"
                    : "bg-[#27272a] text-zinc-400"
                }`}
              >
                {msg.role === "user" ? "U" : "AI"}
              </div>
              <div
                title={msg.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                className={`p-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-[#e63946] text-white rounded-2xl rounded-tr-lg"
                    : "bg-[#18181b] text-zinc-300 rounded-2xl rounded-tl-lg border border-[#27272a]"
                }`}
              >
                {msg.content}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex items-start gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold bg-[#27272a] text-zinc-400 flex-shrink-0 mt-0.5">
                AI
              </div>
              <div className="bg-[#18181b] border border-[#27272a] text-zinc-400 p-3 rounded-2xl rounded-tl-lg text-sm flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span>Updating site...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick action chips */}
      {messages.length <= 2 && !loading && (
        <div className="px-4 pb-3 flex flex-wrap gap-1.5">
          {QUICK_CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => useChip(chip)}
              className="text-xs px-3 py-1.5 rounded-full bg-[#18181b] border border-[#27272a] text-zinc-400 hover:text-white hover:border-[#e63946]/50 hover:bg-[#e63946]/10 transition-all"
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="p-3 border-t border-[#27272a] flex gap-2 items-end bg-[#09090b]"
      >
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              autoResize();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Describe your changes..."
            rows={1}
            disabled={loading}
            className="w-full p-3 pr-12 rounded-xl bg-[#18181b] text-white border border-[#27272a] focus:outline-none focus:border-[#e63946] focus:ring-1 focus:ring-[#e63946]/20 resize-none overflow-y-auto text-sm placeholder-zinc-600 disabled:opacity-50 transition-all"
            style={{ maxHeight: "120px" }}
          />
          {charCount > 0 && (
            <span
              className={`absolute bottom-2.5 right-2.5 text-[10px] pointer-events-none ${
                charCount > 400 ? "text-[#e63946]" : "text-zinc-600"
              }`}
            >
              {charCount}
            </span>
          )}
        </div>
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-3 rounded-xl bg-[#e63946] text-white hover:bg-[#d42f3c] transition-colors disabled:opacity-30 disabled:hover:bg-[#e63946] flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </form>
    </div>
  );
}
