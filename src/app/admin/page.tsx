"use client";

import { useState, useRef, useCallback } from "react";
import ChatPanel from "./components/ChatPanel";
import PreviewPanel, { PreviewPanelRef } from "./components/PreviewPanel";

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [activeTab, setActiveTab] = useState<"chat" | "preview">("chat");

  // Split panel drag state
  const [splitRatio, setSplitRatio] = useState(0.42);
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<PreviewPanelRef>(null);

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

  const handleContentChanged = useCallback(() => {
    previewRef.current?.triggerAutoRefresh();
  }, []);

  function handleDividerMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    function onMove(ev: MouseEvent) {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const ratio = (ev.clientX - rect.left) / rect.width;
      setSplitRatio(Math.min(Math.max(ratio, 0.28), 0.72));
    }

    function onUp() {
      isDragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-6">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm p-8 rounded-xl bg-[#1d3557]"
        >
          <h1 className="text-2xl font-bold mb-2 text-[#e63946]">Site Editor</h1>
          <p className="text-[#f1faee]/50 text-sm mb-6">Enter your admin password to continue</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            className="w-full p-3 rounded-lg bg-[#0a0a0a] text-white border border-[#e6394633] mb-4 focus:outline-none focus:border-[#e63946] placeholder-[#f1faee]/30"
          />
          {passwordError && (
            <p className="text-[#e63946] text-sm mb-4">{passwordError}</p>
          )}
          <button
            type="submit"
            className="w-full p-3 rounded-lg bg-[#e63946] text-white font-bold hover:opacity-90 transition-opacity"
          >
            Enter
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#0a0a0a] overflow-hidden">
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-[#1d355760] flex-shrink-0 bg-[#0a0a0a]">
        <h1 className="text-base font-bold text-[#e63946] tracking-wide">Site Editor</h1>

        {/* Mobile tabs */}
        <div className="flex md:hidden items-center gap-1 bg-[#1d3557]/40 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("chat")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === "chat"
                ? "bg-[#e63946] text-white"
                : "text-[#f1faee]/60 hover:text-[#f1faee]"
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === "preview"
                ? "bg-[#e63946] text-white"
                : "text-[#f1faee]/60 hover:text-[#f1faee]"
            }`}
          >
            Preview
          </button>
        </div>

        <a
          href="/"
          target="_blank"
          className="hidden md:inline text-xs text-[#f1faee]/50 hover:text-[#f1faee] underline transition-colors"
        >
          Open live site ↗
        </a>
      </div>

      {/* Mobile: single panel based on active tab */}
      <div className="flex md:hidden flex-1 overflow-hidden">
        {activeTab === "chat" ? (
          <ChatPanel
            className="flex-1"
            onContentChanged={handleContentChanged}
          />
        ) : (
          <PreviewPanel ref={previewRef} className="flex-1" />
        )}
      </div>

      {/* Desktop: split panels */}
      <div
        ref={containerRef}
        className="hidden md:flex flex-1 overflow-hidden"
      >
        {/* Chat panel */}
        <ChatPanel
          className="flex-shrink-0 overflow-hidden"
          style={{ width: `${splitRatio * 100}%` }}
          onContentChanged={handleContentChanged}
        />

        {/* Draggable divider */}
        <div
          onMouseDown={handleDividerMouseDown}
          className="w-1 flex-shrink-0 bg-[#1d355760] hover:bg-[#e63946] cursor-col-resize transition-colors flex items-center justify-center group"
        >
          <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-1 h-1 rounded-full bg-white/40" />
            <div className="w-1 h-1 rounded-full bg-white/40" />
            <div className="w-1 h-1 rounded-full bg-white/40" />
          </div>
        </div>

        {/* Preview panel */}
        <PreviewPanel
          ref={previewRef}
          className="flex-1 overflow-hidden"
        />
      </div>
    </div>
  );
}
