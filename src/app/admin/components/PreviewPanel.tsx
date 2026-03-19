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
      <div className={`flex flex-col bg-[#111111] ${className}`}>
        {/* Preview header */}
        <div className="h-12 flex items-center justify-between px-3 border-b border-[#1d355760] flex-shrink-0 gap-2">
          {/* Status badge */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div
              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                status === "live"
                  ? "bg-green-500"
                  : status === "pending"
                  ? "bg-amber-400 animate-pulse"
                  : "bg-[#e63946] animate-pulse"
              }`}
            />
            <span className="text-xs text-[#f1faee]/60 whitespace-nowrap">
              {status === "live" ? "Live" : status === "pending" ? "Refreshing..." : "Loading..."}
            </span>
          </div>

          {/* URL bar */}
          <div className="hidden md:flex items-center px-2 py-1 rounded bg-[#0a0a0a] border border-[#1d355760] font-mono text-xs text-[#f1faee]/40 flex-1 min-w-0 mx-2">
            <span className="truncate">localhost:3000</span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Viewport toggles */}
            <div className="hidden lg:flex items-center border border-[#1d355760] rounded overflow-hidden mr-1">
              {(["mobile", "tablet", "desktop"] as ViewportSize[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setViewport(v)}
                  title={v.charAt(0).toUpperCase() + v.slice(1)}
                  className={`px-2 py-1 text-xs transition-colors ${
                    viewport === v
                      ? "bg-[#e63946] text-white"
                      : "text-[#f1faee]/40 hover:text-[#f1faee]/80 hover:bg-[#1d3557]"
                  }`}
                >
                  {v === "mobile" ? "📱" : v === "tablet" ? "⬜" : "🖥️"}
                </button>
              ))}
            </div>

            {/* Refresh */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Refresh preview"
              className="p-1.5 rounded text-[#f1faee]/60 hover:text-[#f1faee] hover:bg-[#1d3557] disabled:opacity-30 transition-all"
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
              className="p-1.5 rounded text-[#f1faee]/60 hover:text-[#f1faee] hover:bg-[#1d3557] transition-all"
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
        <div className="flex-1 overflow-auto flex justify-center bg-[#0d0d0d]">
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
