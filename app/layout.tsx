import type { Metadata } from "next";
import { Ma_Shan_Zheng, Caveat } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const handwriting = Ma_Shan_Zheng({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-hand",
  display: "swap",
});

const handwritingEN = Caveat({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-hand-en",
  display: "swap",
});

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
    <html lang="zh-CN" className={`${handwriting.variable} ${handwritingEN.variable}`}>
      <body className="font-sans text-warm-brown min-h-screen bg-warm-bg">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#FAF7F2",
              color: "#5C554A",
              border: "1px solid #D4CFC6",
              borderRadius: "14px",
              boxShadow: "0 2px 10px rgba(92,85,74,0.08)",
            },
          }}
        />
      </body>
    </html>
  );
}
