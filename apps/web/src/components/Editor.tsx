"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface EditorProps {
  initialValue?: string;
  onSave: (html: string) => void;
  saving?: boolean;
}

const PLACEHOLDER_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: system-ui; padding: 16px; }
  </style>
</head>
<body>
  <h1>Hello Mini App!</h1>
  <script>
    // Use __bridge.getData(key) and __bridge.setData(key, value)
    // for private data storage
  </script>
</body>
</html>`;

function LivePreview({ html }: { html: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    setBlobUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [html]);

  if (!blobUrl) return null;

  return (
    <iframe
      ref={iframeRef}
      src={blobUrl}
      className="w-full h-full border-0 bg-white rounded-lg"
      sandbox="allow-scripts"
      title="Preview"
    />
  );
}

function LineNumbers({ lineCount }: { lineCount: number }) {
  return (
    <div
      className="select-none text-right pr-3 pt-3 text-xs leading-relaxed text-gray-500 font-mono"
      aria-hidden
    >
      {Array.from({ length: lineCount }, (_, i) => (
        <div key={i + 1}>{i + 1}</div>
      ))}
    </div>
  );
}

export function Editor({ initialValue, onSave, saving }: EditorProps) {
  const [html, setHtml] = useState(initialValue || PLACEHOLDER_HTML);
  const [mobileTab, setMobileTab] = useState<"code" | "preview">("code");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const lineCount = html.split("\n").length;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Cmd/Ctrl+S to save
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        onSave(html);
        return;
      }
      // Tab inserts two spaces
      if (e.key === "Tab") {
        e.preventDefault();
        const ta = e.currentTarget;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const newVal = html.substring(0, start) + "  " + html.substring(end);
        setHtml(newVal);
        requestAnimationFrame(() => {
          ta.selectionStart = ta.selectionEnd = start + 2;
        });
      }
    },
    [html, onSave]
  );

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-3 py-2 bg-gray-50 border-b border-gray-200">
        {/* Mobile tab toggle */}
        <div className="flex gap-1 lg:hidden">
          <button
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              mobileTab === "code" ? "bg-blue-600 text-white" : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setMobileTab("code")}
          >
            Code
          </button>
          <button
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              mobileTab === "preview" ? "bg-blue-600 text-white" : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setMobileTab("preview")}
          >
            Preview
          </button>
        </div>
        {/* Desktop label */}
        <span className="hidden lg:block text-sm font-medium text-gray-500">
          Editor &mdash; Live Preview
        </span>
        <div className="flex-1" />
        <span className="hidden sm:block text-xs text-gray-400 mr-2">
          {lineCount} line{lineCount !== 1 ? "s" : ""}
        </span>
        <button
          className="px-5 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-md disabled:opacity-50 hover:bg-blue-700 transition-colors"
          onClick={() => onSave(html)}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      {/* Desktop: side-by-side */}
      <div className="hidden lg:flex flex-1 min-h-0">
        {/* Code pane */}
        <div className="flex-1 flex min-w-0 bg-[#1e1e1e] overflow-auto">
          <LineNumbers lineCount={lineCount} />
          <textarea
            ref={textareaRef}
            className="flex-1 font-mono text-sm leading-relaxed p-3 pl-0 bg-transparent text-[#d4d4d4] resize-none outline-none min-w-0"
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            placeholder="Write your HTML here..."
          />
        </div>
        {/* Divider */}
        <div className="w-px bg-gray-200" />
        {/* Preview pane */}
        <div className="flex-1 bg-gray-100 p-3 min-w-0">
          <LivePreview html={html} />
        </div>
      </div>

      {/* Mobile: tabbed */}
      <div className="flex flex-1 min-h-0 lg:hidden">
        {mobileTab === "preview" ? (
          <div className="flex-1 bg-gray-100 p-3">
            <LivePreview html={html} />
          </div>
        ) : (
          <textarea
            className="flex-1 font-mono text-sm leading-relaxed p-3 bg-[#1e1e1e] text-[#d4d4d4] resize-none outline-none"
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            placeholder="Write your HTML here..."
          />
        )}
      </div>
    </div>
  );
}
