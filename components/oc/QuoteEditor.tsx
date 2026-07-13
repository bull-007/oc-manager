"use client";

import { useState } from "react";

interface Props {
  quotes: string[];
  onChange: (quotes: string[]) => void;
}

export default function QuoteEditor({ quotes, onChange }: Props) {
  const [input, setInput] = useState("");

  const addQuote = () => {
    const trimmed = input.trim();
    if (trimmed && !quotes.includes(trimmed)) {
      onChange([...quotes, trimmed]);
      setInput("");
    }
  };

  const removeQuote = (index: number) => {
    onChange(quotes.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addQuote();
    }
  };

  return (
    <div className="space-y-2">
      {/* Quote list */}
      {quotes.length > 0 && (
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {quotes.map((q, i) => (
            <div
              key={i}
              className="flex items-start gap-2 group p-2 rounded-lg bg-warm-cream border border-warm-border hover:border-amber-200 transition-colors"
            >
              <span className="text-amber-400 mt-0.5 flex-shrink-0">"</span>
              <span className="text-sm text-warm-brown flex-1">{q}</span>
              <button
                type="button"
                onClick={() => removeQuote(i)}
                className="text-warm-muted/30 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入一句语录后按回车..."
          maxLength={200}
          className="flex-1 px-3 py-2 border border-warm-border rounded-lg bg-warm-cream text-sm text-warm-brown placeholder-warm-muted focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
        />
        <button
          type="button"
          onClick={addQuote}
          disabled={!input.trim()}
          className="px-3 py-2 text-sm bg-amber-700 text-white rounded-lg hover:bg-amber-800 disabled:opacity-40 transition-colors flex-shrink-0"
        >
          添加
        </button>
      </div>

      {quotes.length === 0 && (
        <p className="text-xs text-warm-muted">
          还没有语录，点击角色会随机说出一句话
        </p>
      )}
      {quotes.length > 0 && (
        <p className="text-xs text-warm-muted">
          {quotes.length} 条语录 · 点击角色随机播放
        </p>
      )}
    </div>
  );
}
