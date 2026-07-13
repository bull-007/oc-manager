"use client";

import { useState } from "react";
import toast from "react-hot-toast";

interface Props {
  imageUrl: string;
  onCutoutComplete: (cutoutUrl: string) => void;
  onClose: () => void;
}

export default function BackgroundRemover({ imageUrl, onCutoutComplete, onClose }: Props) {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

  const handleRemove = async () => {
    setProcessing(true);
    setProgress("正在下载模型...");

    try {
      // Dynamically import the heavy library
      const { removeBackground } = await import("@imgly/background-removal");

      setProgress("AI 正在抠图...");

      // Process the image - converts to blob with transparent background
      const resultBlob = await removeBackground(imageUrl, {
        progress: (key, current, total) => {
          const percent = Math.round((current / total) * 100);
          setProgress(`处理中... ${percent}%`);
        },
      });

      setProgress("上传中...");

      // Upload the cutout to Qiniu
      const formData = new FormData();
      formData.append("file", resultBlob, "cutout.png");

      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("上传失败");
      const data = await res.json();

      setPreview(data.url);
      onCutoutComplete(data.url);
      toast.success("抠图完成！");
      setProcessing(false);
    } catch (err: any) {
      toast.error(err.message || "抠图失败，请重试");
      setProcessing(false);
    }
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

        {/* Result / Processing */}
        <div className="flex-1">
          <p className="text-xs text-warm-muted mb-1">
            {preview ? "抠图结果" : "预览"}
          </p>
          <div className="aspect-square rounded-lg overflow-hidden border border-warm-border bg-[repeating-conic-gradient(#e5e5e5_0%_25%,#fff_0%_50%)_50%/16px_16px] flex items-center justify-center">
            {processing ? (
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs text-warm-muted">{progress}</p>
              </div>
            ) : preview ? (
              <img
                src={preview}
                alt="抠图结果"
                className="w-full h-full object-contain"
              />
            ) : (
              <p className="text-xs text-warm-muted">等待处理</p>
            )}
          </div>
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
        {!preview ? (
          <button
            onClick={handleRemove}
            disabled={processing}
            className="px-4 py-2 text-sm bg-amber-700 text-warm-cream rounded-lg hover:bg-amber-800 disabled:opacity-50 flex items-center gap-2"
          >
            {processing ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {progress}
              </>
            ) : (
              "开始抠图"
            )}
          </button>
        ) : (
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-amber-700 text-warm-cream rounded-lg hover:bg-amber-800"
          >
            完成
          </button>
        )}
      </div>
    </div>
  );
}
