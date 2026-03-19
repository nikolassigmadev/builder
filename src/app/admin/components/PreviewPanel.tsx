"use client";

import { useRef, useState, forwardRef, useImperativeHandle } from "react";

type ViewportSize = "mobile" | "tablet" | "desktop";

export interface PreviewPanelRef {
  triggerAutoRefresh: () => void;
}

interface PreviewPanelProps {
  className?: string;
}

const PreviewPanel = forwardRef<PreviewPanelRef, PreviewPanelProps>(
  function PreviewPanel({ className = "" }, ref) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [status, setStatus] = useState<"loading" | "live" | "pending">("loading");
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [viewport, setViewport] = useState<ViewportSize>("desktop");

    function handleRefresh() {
      if (isRefreshing) return;
      setIsRefreshing(true);
      setStatus("loading");
      if (iframeRef.current) {
        iframeRef.current.src = "/";
      }
      setTimeout(() => setIsRefreshing(false), 2000);
    }

    useImperativeHandle(ref, () => ({
      triggerAutoRefresh: () => {
        setStatus("pending");
        setTimeout(() => handleRefresh(), 1200);
      },
    }));

    const iframeStyle: React.CSSProperties =
      viewport === "desktop"
        ? { width: "100%" }
        : { width: viewport === "mobile" ? 375 : 768, maxWidth: "100%" };

    return (
      <div className={`flex flex-col bg-[#0a0a0a] ${className}`}>
        {/* Preview header */}
        <div className="h-12 flex items-center justify-between px-3 border-b border-[#27272a] flex-shrink-0 gap-2">
          {/* Status badge */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div
              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                status === "live"
                  ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]"
                  : status === "pending"
                  ? "bg-amber-400 animate-pulse"
                  : "bg-[#e63946] animate-pulse"
              }`}
            />
            <span className="text-xs font-medium text-zinc-500">
              {status === "live" ? "Live Preview" : status === "pending" ? "Updating..." : "Loading..."}
            </span>
          </div>

          {/* URL bar */}
          <div className="hidden md:flex items-center px-3 py-1 rounded-lg bg-[#18181b] border border-[#27272a] font-mono text-[11px] text-zinc-500 flex-1 min-w-0 mx-3">
            <svg className="w-3 h-3 mr-1.5 text-zinc-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="truncate">localhost:3000</span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Viewport toggles */}
            <div className="hidden lg:flex items-center bg-[#18181b] border border-[#27272a] rounded-lg overflow-hidden mr-1">
              {(["mobile", "tablet", "desktop"] as ViewportSize[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setViewport(v)}
                  title={v.charAt(0).toUpperCase() + v.slice(1)}
                  className={`px-2.5 py-1.5 text-xs transition-all ${
                    viewport === v
                      ? "bg-[#e63946] text-white"
                      : "text-zinc-500 hover:text-white"
                  }`}
                >
                  {v === "mobile" ? (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  ) : v === "tablet" ? (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              ))}
            </div>

            {/* Refresh */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Refresh preview"
              className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-[#18181b] disabled:opacity-30 transition-all"
            >
              <svg
                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>

            {/* Open in new tab */}
            <button
              onClick={() => window.open("/", "_blank")}
              title="Open in new tab"
              className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-[#18181b] transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* iframe */}
        <div className="flex-1 overflow-auto flex justify-center bg-[#0a0a0a]">
          <iframe
            ref={iframeRef}
            src="/"
            onLoad={() => setStatus("live")}
            style={iframeStyle}
            className="h-full border-0 transition-all duration-300"
            title="Live site preview"
          />
        </div>
      </div>
    );
  }
);

export default PreviewPanel;
