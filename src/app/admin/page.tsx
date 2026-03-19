"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hey! I'm your site editor. Tell me what you'd like to change on your website. For example:\n\n- \"Change the headline to Summer Special\"\n- \"Update the phone number to (212) 555-9999\"\n- \"Add a new class called Spin Cycle\"\n- \"Change the primary color to blue\"\n- \"Show me what the site looked like earlier today\"\n- \"Undo the last change\"",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setAuthenticated(true);
      setPasswordError("");
    } else {
      setPasswordError("Wrong password");
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: userMessage }].filter(
            (_, i) => i > 0 // skip the initial greeting
          ),
        }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-6">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm p-8 rounded-sm bg-[#1d3557]"
        >
          <h1 className="text-2xl font-bold mb-6 text-[#e63946]">Admin Access</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full p-3 rounded-sm bg-[#0a0a0a] text-white border border-[#e6394633] mb-4 focus:outline-none focus:border-[#e63946]"
          />
          {passwordError && (
            <p className="text-[#e63946] text-sm mb-4">{passwordError}</p>
          )}
          <button
            type="submit"
            className="w-full p-3 rounded-sm bg-[#e63946] text-white font-bold hover:opacity-90 transition-opacity"
          >
            Enter
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
      {/* Header */}
      <div className="p-4 border-b border-[#1d3557] flex items-center justify-between">
        <h1 className="text-lg font-bold text-[#e63946]">Site Editor</h1>
        <a
          href="/"
          target="_blank"
          className="text-sm text-[#f1faee] opacity-60 hover:opacity-100 underline"
        >
          View live site
        </a>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-sm whitespace-pre-wrap text-sm ${
                msg.role === "user"
                  ? "bg-[#e63946] text-white"
                  : "bg-[#1d3557] text-[#f1faee]"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#1d3557] text-[#f1faee] p-4 rounded-sm text-sm">
              <span className="animate-pulse">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="p-4 border-t border-[#1d3557] flex gap-3"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tell me what to change..."
          className="flex-1 p-3 rounded-sm bg-[#1d3557] text-white border border-[#e6394633] focus:outline-none focus:border-[#e63946]"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 rounded-sm bg-[#e63946] text-white font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
