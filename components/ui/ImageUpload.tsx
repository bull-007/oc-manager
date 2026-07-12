"use client";

import { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  max?: number;
}

export default function ImageUpload({
  images,
  onChange,
  max = 5,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      setUploading(true);
      const newImages: string[] = [...images];

      for (const file of Array.from(files)) {
        if (newImages.length >= max) break;

        const formData = new FormData();
        formData.append("file", file);

        try {
          const res = await fetch("/api/media/upload", {
            method: "POST",
            body: formData,
          });
          if (res.ok) {
            const data = await res.json();
            newImages.push(data.url);
          }
        } catch (error) {
          console.error("Upload failed:", error);
        }
      }

      onChange(newImages);
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    },
    [images, onChange, max]
  );

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-3">
        {images.map((url, i) => (
          <div key={i} className="relative group">
            <img
              src={url}
              alt={`Upload ${i + 1}`}
              className="w-24 h-24 object-cover rounded-lg border-2 border-warm-border shadow-sm"
            />
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
            >
              ×
            </button>
          </div>
        ))}
        {images.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className={cn(
              "w-24 h-24 border-2 border-dashed border-warm-border rounded-lg",
              "flex flex-col items-center justify-center gap-1",
              "text-warm-muted hover:text-amber-700 hover:border-amber-400",
              "transition-colors bg-warm-cream/50",
              uploading && "opacity-50 cursor-wait"
            )}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span className="text-xs">上传</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleUpload}
        className="hidden"
      />
      <p className="text-xs text-warm-muted">
        支持 JPG/PNG，最多 {max} 张
      </p>
    </div>
  );
}
