"use client";

import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";

interface Props {
  imageUrl: string;
  onCutoutComplete: (cutoutUrl: string) => void;
  onClose: () => void;
}

export default function BackgroundRemover({
  imageUrl,
  onCutoutComplete,
  onClose,
}: Props) {
  const [processing, setProcessing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [tolerance, setTolerance] = useState(40);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Load image and do initial preview
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      processImage(img, tolerance).then(setPreview);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const processImage = (
    img: HTMLImageElement,
    tol: number
  ): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const { data } = imageData;

      // Sample background color from 4 corners
      const corners = [
        [0, 0],
        [canvas.width - 1, 0],
        [0, canvas.height - 1],
        [canvas.width - 1, canvas.height - 1],
      ];
      const bg: number[] = [0, 0, 0];
      corners.forEach(([x, y]) => {
        const i = (y * canvas.width + x) * 4;
        bg[0] += data[i];
        bg[1] += data[i + 1];
        bg[2] += data[i + 2];
      });
      bg[0] = Math.round(bg[0] / 4);
      bg[1] = Math.round(bg[1] / 4);
      bg[2] = Math.round(bg[2] / 4);

      // Remove pixels close to background color
      for (let i = 0; i < data.length; i += 4) {
        const dr = data[i] - bg[0];
        const dg = data[i + 1] - bg[1];
        const db = data[i + 2] - bg[2];
        const dist = Math.sqrt(dr * dr + dg * dg + db * db);

        // Feather edge: gradually reduce alpha
        const feather = 20;
        if (dist < tol) {
          data[i + 3] = 0; // Fully transparent
        } else if (dist < tol + feather) {
          const alpha = ((dist - tol) / feather) * 255;
          data[i + 3] = Math.round(alpha);
        }
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    });
  };

  const handleReprocess = async () => {
    if (!imgRef.current) return;
    const dataUrl = await processImage(imgRef.current, tolerance);
    setPreview(dataUrl);
  };

  const handleApply = async () => {
    if (!preview) return;
    setProcessing(true);

    try {
      // Convert dataURL to blob
      const res = await fetch(preview);
      const blob = await res.blob();

      // Upload
      const formData = new FormData();
      formData.append("file", blob, "cutout.png");
      const uploadRes = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("上传失败");
      const data = await uploadRes.json();
      onCutoutComplete(data.url);
      toast.success("抠图完成！");
    } catch {
      toast.error("上传失败");
    }
    setProcessing(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        {/* Original */}
        <div className="flex-1">
          <p className="text-xs text-warm-muted mb-1">原图</p>
          <div className="aspect-square rounded-lg overflow-hidden border border-warm-border bg-gray-100">
            <img
              src={imageUrl}
              alt="原始图片"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Preview */}
        <div className="flex-1">
          <p className="text-xs text-warm-muted mb-1">结果预览</p>
          <div className="aspect-square rounded-lg overflow-hidden border border-warm-border bg-[repeating-conic-gradient(#ddd_0%_25%,#fff_0%_50%)_50%/12px_12px]">
            {preview ? (
              <img
                src={preview}
                alt="抠图结果"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-xs text-warm-muted">处理中...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tolerance slider */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs text-warm-muted">
            容差：{tolerance}
          </label>
          <button
            onClick={handleReprocess}
            className="text-xs text-amber-700 hover:text-amber-800"
          >
            重新处理
          </button>
        </div>
        <input
          type="range"
          min="10"
          max="120"
          value={tolerance}
          onChange={(e) => setTolerance(Number(e.target.value))}
          onMouseUp={handleReprocess}
          onTouchEnd={handleReprocess}
          className="w-full accent-amber-600"
        />
        <div className="flex justify-between text-[10px] text-warm-muted">
          <span>更透明</span>
          <span>更保留</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          disabled={processing}
          className="px-4 py-2 text-sm text-warm-muted hover:text-warm-brown border border-warm-border rounded-lg disabled:opacity-50"
        >
          取消
        </button>
        <button
          onClick={handleApply}
          disabled={processing}
          className="px-4 py-2 text-sm bg-amber-700 text-warm-cream rounded-lg hover:bg-amber-800 disabled:opacity-50"
        >
          {processing ? "上传中..." : "确认使用"}
        </button>
      </div>
    </div>
  );
}
