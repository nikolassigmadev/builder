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
    "Hey! I'm your site editor. Tell me what you'd like to change on your website. For example:\n\n- \"Change the headline to Summer Special\"\n- \"Update the phone number to (212) 555-9999\"\n- \"Add a new class called Spin Cycle\"\n- \"Change the primary color to blue\"\n- \"Show me what the site looked like earlier today\"\n- \"Undo the last change\"",
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
    <div className={`flex flex-col bg-[#0a0a0a] ${className}`} style={style}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              title={msg.timestamp.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
              className={`max-w-[85%] p-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-[#e63946] text-white rounded-2xl rounded-br-sm"
                  : "bg-[#1d3557] text-[#f1faee] rounded-2xl rounded-bl-sm"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#1d3557] text-[#f1faee] p-3 rounded-2xl rounded-bl-sm text-sm">
              <span className="animate-pulse">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick action chips */}
      {messages.length <= 2 && !loading && (
        <div className="px-4 pb-3 flex flex-wrap gap-2">
          {QUICK_CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => useChip(chip)}
              className="text-xs px-3 py-1.5 rounded-full border border-[#1d3557] text-[#f1faee]/60 hover:text-[#e63946] hover:border-[#e63946] transition-all"
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="p-3 border-t border-[#1d355760] flex gap-2 items-end"
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
            placeholder="Tell me what to change... (Enter to send, Shift+Enter for new line)"
            rows={1}
            disabled={loading}
            className="w-full p-3 pr-12 rounded-xl bg-[#1d3557] text-white border border-[#e6394633] focus:outline-none focus:border-[#e63946] resize-none overflow-y-auto text-sm placeholder-[#f1faee]/30 disabled:opacity-50 transition-colors"
            style={{ maxHeight: "120px" }}
          />
          {charCount > 0 && (
            <span
              className={`absolute bottom-2.5 right-2.5 text-xs pointer-events-none ${
                charCount > 400 ? "text-[#e63946]" : "text-[#f1faee]/30"
              }`}
            >
              {charCount}
            </span>
          )}
        </div>
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-4 py-3 rounded-xl bg-[#e63946] text-white font-bold hover:opacity-90 transition-opacity disabled:opacity-40 text-sm self-end flex-shrink-0"
        >
          Send
        </button>
      </form>
    </div>
  );
}
