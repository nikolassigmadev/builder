"use client";

import { useState, useRef, useEffect, useCallback } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

const QUICK_CHIPS = [
  { label: "Apply dark luxury theme", category: "themes" },
  { label: "Apply bold athletic theme", category: "themes" },
  { label: "Apply bright minimal theme", category: "themes" },
  { label: "Switch font to Oswald", category: "style" },
  { label: "Make cards look like glass", category: "style" },
  { label: "Add scroll animations", category: "style" },
  { label: "Add a hero image", category: "content" },
  { label: "Add a testimonials section", category: "content" },
  { label: "Change the primary color", category: "style" },
  { label: "Show version history", category: "tools" },
];

const INITIAL_MESSAGE: Message = {
  role: "assistant",
  content: `Hey! I'm your AI site designer. I can customize **anything** on this website — content, colors, fonts, layouts, animations, and full design themes.

**Quick examples:**
- "Apply the dark luxury theme"
- "Change the hero to a split layout with an image on the right"
- "Make all cards use a glass effect"
- "Switch to Oswald font and make it feel more athletic"
- "Add a gradient background to the pricing section"
- "Search for gym photos and add them to the gallery"
- "Make the site more minimal and professional"
- "Add custom CSS to make the hero text glow"

What would you like to change?`,
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
  const [uploading, setUploading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setMessages(prev => [...prev, newMsg]);
    setLoading(true);

    try {
      const allMessages = [...messages, newMsg];
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: allMessages.filter((_, i) => i > 0).map(m => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.response, timestamp: new Date() }]);

      if (data.changed) onContentChanged?.();
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Something went wrong. Please try again.", timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (data.url) {
        const msg = input.trim()
          ? `${input.trim()} (image: ${data.url})`
          : `Use this image: ${data.url}`;
        setInput(msg);
        setTimeout(() => { textareaRef.current?.focus(); autoResize(); }, 0);
      } else {
        setMessages(prev => [...prev, { role: "assistant", content: `Upload failed: ${data.error ?? "unknown error"}`, timestamp: new Date() }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Upload failed. Please try again.", timestamp: new Date() }]);
    } finally {
      setUploading(false);
    }
  }, [input]);

  function useChip(text: string) {
    setInput(text);
    setTimeout(() => { textareaRef.current?.focus(); autoResize(); }, 0);
  }

  const showChips = messages.length <= 2 && !loading;
  const categories = [...new Set(QUICK_CHIPS.map(c => c.category))];
  const filteredChips = activeCategory ? QUICK_CHIPS.filter(c => c.category === activeCategory) : QUICK_CHIPS.slice(0, 6);

  // Format assistant messages with basic markdown-like bold
  function formatMessage(content: string) {
    return content.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  }

  const charCount = input.length;

  return (
    <div className={`flex flex-col bg-[#09090b] ${className}`} style={style}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`flex items-start gap-2 max-w-[90%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${msg.role === "user" ? "bg-[#e63946] text-white" : "bg-[#27272a] text-zinc-400"}`}>
                {msg.role === "user" ? "U" : "AI"}
              </div>
              <div
                title={msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                className={`p-3 text-sm leading-relaxed whitespace-pre-wrap ${msg.role === "user" ? "bg-[#e63946] text-white rounded-2xl rounded-tr-lg" : "bg-[#18181b] text-zinc-300 rounded-2xl rounded-tl-lg border border-[#27272a]"}`}
              >
                {msg.role === "assistant" ? formatMessage(msg.content) : msg.content}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex items-start gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold bg-[#27272a] text-zinc-400 flex-shrink-0 mt-0.5">AI</div>
              <div className="bg-[#18181b] border border-[#27272a] text-zinc-400 p-3 rounded-2xl rounded-tl-lg text-sm flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span>Designing...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick chips */}
      {showChips && (
        <div className="px-4 pb-3">
          {/* Category filter */}
          <div className="flex gap-1.5 mb-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveCategory(null)}
              className={`text-[10px] px-2 py-1 rounded-full whitespace-nowrap transition-all ${!activeCategory ? "bg-[#e63946] text-white" : "bg-[#18181b] border border-[#27272a] text-zinc-500 hover:text-white"}`}
            >all</button>
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                className={`text-[10px] px-2 py-1 rounded-full whitespace-nowrap transition-all ${activeCategory === cat ? "bg-[#e63946] text-white" : "bg-[#18181b] border border-[#27272a] text-zinc-500 hover:text-white"}`}>
                {cat}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {filteredChips.map(chip => (
              <button key={chip.label} onClick={() => useChip(chip.label)}
                className="text-xs px-3 py-1.5 rounded-full bg-[#18181b] border border-[#27272a] text-zinc-400 hover:text-white hover:border-[#e63946]/50 hover:bg-[#e63946]/10 transition-all">
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 border-t border-[#27272a] flex gap-2 items-end bg-[#09090b]">
        {/* Hidden file input */}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
        {/* Upload button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading || uploading}
          title="Upload image"
          className="p-3 rounded-xl bg-[#18181b] border border-[#27272a] text-zinc-400 hover:text-white hover:border-[#e63946]/50 transition-colors disabled:opacity-30 flex-shrink-0"
        >
          {uploading ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
        </button>
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => { setInput(e.target.value); autoResize(); }}
            onKeyDown={handleKeyDown}
            placeholder="Describe a design change or ask anything..."
            rows={1}
            disabled={loading}
            className="w-full p-3 pr-12 rounded-xl bg-[#18181b] text-white border border-[#27272a] focus:outline-none focus:border-[#e63946] focus:ring-1 focus:ring-[#e63946]/20 resize-none overflow-y-auto text-sm placeholder-zinc-600 disabled:opacity-50 transition-all"
            style={{ maxHeight: "120px" }}
          />
          {charCount > 0 && (
            <span className={`absolute bottom-2.5 right-2.5 text-[10px] pointer-events-none ${charCount > 400 ? "text-[#e63946]" : "text-zinc-600"}`}>{charCount}</span>
          )}
        </div>
        <button type="submit" disabled={loading || !input.trim()}
          className="p-3 rounded-xl bg-[#e63946] text-white hover:bg-[#d42f3c] transition-colors disabled:opacity-30 disabled:hover:bg-[#e63946] flex-shrink-0">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </form>
    </div>
  );
}
