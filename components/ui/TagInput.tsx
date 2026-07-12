"use client";

import { useState, KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
}

export default function TagInput({
  tags,
  onChange,
  placeholder = "输入标签后按回车...",
  suggestions = [],
}: TagInputProps) {
  const [input, setInput] = useState("");

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput("");
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && !input && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {tags.map((tag, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm bg-amber-100 text-amber-800 border border-amber-300"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(i)}
              className="text-amber-600 hover:text-amber-900 ml-0.5"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => addTag(input)}
        placeholder={placeholder}
        className={cn(
          "w-full px-3 py-2 border border-warm-border rounded-lg",
          "bg-warm-cream text-warm-brown placeholder-warm-muted",
          "focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent",
          "text-sm"
        )}
      />
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          <span className="text-xs text-warm-muted">推荐: </span>
          {suggestions
            .filter((s) => !tags.includes(s))
            .map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addTag(s)}
                className="text-xs px-2 py-0.5 rounded-full bg-warm-cream text-warm-muted border border-warm-border hover:bg-amber-50 hover:text-amber-700 transition-colors"
              >
                + {s}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
