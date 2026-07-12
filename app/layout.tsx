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
      <body className="font-sans text-warm-brown min-h-screen bg-warm-bg">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#FFFBF0",
              color: "#3D2B1F",
              border: "1px solid #D4C8B8",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(61, 43, 31, 0.1)",
            },
          }}
        />
      </body>
    </html>
  );
}
