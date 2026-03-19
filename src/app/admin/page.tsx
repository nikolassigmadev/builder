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
      setSplitRatio(Math.min(Math.max(ratio, 0.25), 0.65));
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
      <div className="min-h-screen flex items-center justify-center bg-[#09090b] px-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-[#e63946]/5 blur-[120px]" />
        </div>
        <form
          onSubmit={handleLogin}
          className="relative w-full max-w-sm p-8 rounded-2xl bg-[#18181b] border border-[#27272a] shadow-2xl"
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-[#e63946] flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white">Site Editor</h1>
          </div>
          <p className="text-zinc-500 text-sm mb-6 ml-10">Enter your password to continue</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            className="w-full p-3 rounded-xl bg-[#09090b] text-white border border-[#27272a] mb-4 focus:outline-none focus:border-[#e63946] focus:ring-1 focus:ring-[#e63946]/30 placeholder-zinc-600 transition-all"
          />
          {passwordError && (
            <p className="text-[#e63946] text-sm mb-4">{passwordError}</p>
          )}
          <button
            type="submit"
            className="w-full p-3 rounded-xl bg-[#e63946] text-white font-semibold hover:bg-[#d42f3c] transition-colors shadow-lg shadow-[#e63946]/20"
          >
            Sign In
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#09090b] overflow-hidden">
      {/* Header */}
      <div className="h-12 flex items-center justify-between px-4 border-b border-[#27272a] flex-shrink-0 bg-[#09090b]">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-[#e63946] flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-white">Site Editor</span>
          <span className="text-[10px] font-medium text-zinc-600 bg-zinc-800/60 px-1.5 py-0.5 rounded">LIVE</span>
        </div>

        {/* Mobile tabs */}
        <div className="flex md:hidden items-center gap-0.5 bg-[#18181b] rounded-lg p-0.5 border border-[#27272a]">
          <button
            onClick={() => setActiveTab("chat")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === "chat"
                ? "bg-[#e63946] text-white shadow-sm"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === "preview"
                ? "bg-[#e63946] text-white shadow-sm"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Preview
          </button>
        </div>

        <a
          href="/"
          target="_blank"
          className="hidden md:flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition-colors"
        >
          <span>Open site</span>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
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
          className="w-[3px] flex-shrink-0 bg-[#27272a] hover:bg-[#e63946] cursor-col-resize transition-colors duration-150 relative group"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-1 h-1 rounded-full bg-white/50" />
            <div className="w-1 h-1 rounded-full bg-white/50" />
            <div className="w-1 h-1 rounded-full bg-white/50" />
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
