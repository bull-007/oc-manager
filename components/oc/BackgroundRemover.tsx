"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

interface Props {
  imageUrl: string;
  onCutoutComplete: (cutoutUrl: string) => void;
  onClose: () => void;
}

export default function BackgroundRemover({ imageUrl, onCutoutComplete, onClose }: Props) {
  const [processing, setProcessing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [tolerance, setTolerance] = useState(40);
  const [mode, setMode] = useState<"auto" | "manual">("auto");
  const [brushSize, setBrushSize] = useState(20);
  const [tool, setTool] = useState<"erase" | "restore">("erase");
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const imgDataRef = useRef<ImageData | null>(null);
  const origDataRef = useRef<ImageData | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      autoCutout(img, tolerance).then((url) => {
        setPreview(url);
        loadToCanvas(url);
      });
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const autoCutout = (img: HTMLImageElement, tol: number): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const { data } = imageData;
      const corners = [[0,0],[canvas.width-1,0],[0,canvas.height-1],[canvas.width-1,canvas.height-1]];
      const bg = [0,0,0];
      corners.forEach(([x,y]) => { const i = (y*canvas.width+x)*4; bg[0]+=data[i]; bg[1]+=data[i+1]; bg[2]+=data[i+2]; });
      bg[0]=Math.round(bg[0]/4); bg[1]=Math.round(bg[1]/4); bg[2]=Math.round(bg[2]/4);
      for (let i=0; i<data.length; i+=4) {
        const dr=data[i]-bg[0], dg=data[i+1]-bg[1], db=data[i+2]-bg[2];
        const dist=Math.sqrt(dr*dr+dg*dg+db*db);
        const feather=20;
        if (dist<tol) data[i+3]=0;
        else if (dist<tol+feather) data[i+3]=Math.round(((dist-tol)/feather)*255);
      }
      ctx.putImageData(imageData,0,0);
      resolve(canvas.toDataURL("image/png"));
    });
  };

  const loadToCanvas = (dataUrl: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const img = new Image();
    img.onload = () => {
      const maxW = 500;
      const scale = Math.min(1, maxW / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctxRef.current = ctx;
      imgDataRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
      origDataRef.current = new ImageData(
        new Uint8ClampedArray(imgDataRef.current.data),
        canvas.width, canvas.height
      );
    };
    img.src = dataUrl;
  };

  const handleReprocess = async () => {
    if (!imgRef.current) return;
    const url = await autoCutout(imgRef.current, tolerance);
    setPreview(url);
    loadToCanvas(url);
  };

  // Reload canvas when switching to manual mode
  useEffect(() => {
    if (mode === "manual" && preview) {
      setTimeout(() => loadToCanvas(preview), 100);
    }
  }, [mode]);

  const getCanvasPos = (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    return {
      x: ((clientX - rect.left) / rect.width) * canvas.width,
      y: ((clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    const pos = getCanvasPos(e);
    if (pos) drawAt(pos.x, pos.y);
  };

  const moveDraw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const pos = getCanvasPos(e);
    if (pos) drawAt(pos.x, pos.y);
  };

  const stopDraw = () => setIsDrawing(false);

  const drawAt = useCallback(
    (cx: number, cy: number) => {
      const ctx = ctxRef.current;
      const imgData = imgDataRef.current;
      const origData = origDataRef.current;
      if (!ctx || !imgData || !origData) return;

      const w = imgData.width;
      const h = imgData.height;
      const r = brushSize;

      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (dx * dx + dy * dy > r * r) continue;
          const px = Math.round(cx + dx);
          const py = Math.round(cy + dy);
          if (px < 0 || py < 0 || px >= w || py >= h) continue;
          const i = (py * w + px) * 4;
          if (tool === "erase") {
            imgData.data[i + 3] = 0;
          } else {
            imgData.data[i + 3] = origData.data[i + 3];
          }
        }
      }
      ctx.putImageData(imgData, 0, 0);
    },
    [brushSize, tool]
  );

  const handleApply = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setProcessing(true);
    try {
      const dataUrl = canvas.toDataURL("image/png");
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const formData = new FormData();
      formData.append("file", blob, "cutout.png");
      const uploadRes = await fetch("/api/media/upload", { method: "POST", body: formData });
      if (!uploadRes.ok) throw new Error("上传失败");
      const data = await uploadRes.json();
      onCutoutComplete(data.url);
      toast.success("抠图完成！");
    } catch { toast.error("上传失败"); }
    setProcessing(false);
  };

  return (
    <div className="space-y-3">
      {/* Mode tabs */}
      <div className="flex gap-1 bg-warm-cream border border-warm-border rounded-lg p-0.5">
        <button
          onClick={() => setMode("auto")}
          className={`flex-1 py-1.5 text-xs rounded-md transition-colors ${
            mode === "auto" ? "bg-amber-100 text-amber-800 font-medium" : "text-warm-muted"
          }`}
        >自动抠图</button>
        <button
          onClick={() => setMode("manual")}
          className={`flex-1 py-1.5 text-xs rounded-md transition-colors ${
            mode === "manual" ? "bg-amber-100 text-amber-800 font-medium" : "text-warm-muted"
          }`}
        >手动修图</button>
      </div>

      {/* Always visible result preview + manual canvas */}
      <div className="flex gap-4">
        <div className="flex-1">
          <p className="text-xs text-warm-muted mb-1">原图</p>
          <div className="aspect-square rounded-lg overflow-hidden border border-warm-border bg-gray-100">
            <img src={imageUrl} alt="原始" className="w-full h-full object-contain" />
          </div>
        </div>
        <div className="flex-1">
          <p className="text-xs text-warm-muted mb-1">
            {mode === "manual" ? `手动修图 ${isDrawing ? "●" : ""}` : "结果预览"}
          </p>
          <div className={`aspect-square rounded-lg overflow-hidden border bg-[repeating-conic-gradient(#ddd_0%_25%,#fff_0%_50%)_50%/12px_12px] ${
            mode === "manual" ? "border-amber-300" : "border-warm-border"
          }`}>
            {/* Canvas always mounted for manual mode */}
            <canvas
              ref={canvasRef}
              className={`w-full h-full object-contain cursor-crosshair ${mode === "auto" ? "hidden" : ""}`}
              onMouseDown={startDraw}
              onMouseMove={moveDraw}
              onMouseUp={stopDraw}
              onMouseLeave={stopDraw}
              onTouchStart={startDraw}
              onTouchMove={moveDraw}
              onTouchEnd={stopDraw}
            />
            {/* Preview image for auto mode */}
            {mode === "auto" && (
              preview ? (
                <img src={preview} alt="结果" className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-xs text-warm-muted">处理中...</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Auto tolerance slider */}
      {mode === "auto" && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-warm-muted">容差：{tolerance}</label>
            <button onClick={handleReprocess} className="text-xs text-amber-700 hover:text-amber-800">重新处理</button>
          </div>
          <input type="range" min="10" max="120" value={tolerance}
            onChange={(e) => setTolerance(Number(e.target.value))}
            onMouseUp={handleReprocess} onTouchEnd={handleReprocess}
            className="w-full accent-amber-600" />
          <div className="flex justify-between text-[10px] text-warm-muted">
            <span>更透明</span><span>更保留</span>
          </div>
        </div>
      )}

      {/* Manual toolbar */}
      {mode === "manual" && (
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-1 bg-warm-cream border border-warm-border rounded-lg p-0.5">
            <button onClick={() => setTool("erase")}
              className={`px-3 py-1 text-xs rounded-md ${tool === "erase" ? "bg-red-100 text-red-700 font-medium" : "text-warm-muted"}`}
            >🧹 擦除</button>
            <button onClick={() => setTool("restore")}
              className={`px-3 py-1 text-xs rounded-md ${tool === "restore" ? "bg-green-100 text-green-700 font-medium" : "text-warm-muted"}`}
            >↩ 恢复</button>
          </div>
          <div className="flex items-center gap-1 flex-1">
            <span className="text-xs text-warm-muted">笔刷</span>
            <input type="range" min="4" max="60" value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="flex-1 accent-amber-600" />
            <span className="text-xs text-warm-muted w-6">{brushSize}</span>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button onClick={onClose} disabled={processing}
          className="px-4 py-2 text-sm text-warm-muted hover:text-warm-brown border border-warm-border rounded-lg disabled:opacity-50">
          取消
        </button>
        <button onClick={handleApply} disabled={processing}
          className="px-4 py-2 text-sm bg-amber-700 text-warm-cream rounded-lg hover:bg-amber-800 disabled:opacity-50">
          {processing ? "上传中..." : "确认使用"}
        </button>
      </div>
    </div>
  );
}
