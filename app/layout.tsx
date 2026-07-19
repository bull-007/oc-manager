import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "OC 管理器 — 原创角色管理系统",
  description: "管理你的原创角色、世界观和故事设定",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="font-sans text-stone-text min-h-screen bg-stone-page">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#E5E4E0",
              color: "#54534E",
              border: "1px solid #D3D2CE",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(84,83,78,0.06)",
            },
          }}
        />
      </body>
    </html>
  );
}
