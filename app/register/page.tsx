"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      const res = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "注册失败"); setLoading(false); return; }
      toast.success("注册成功！正在登录...");
      const result = await signIn("credentials", { email: form.email, password: form.password, redirect: false });
      if (result?.ok) { router.push("/dashboard"); router.refresh(); }
    } catch { toast.error("注册失败"); setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-stone-page">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-serif font-medium text-stone-text mb-1">创建账号</h1>
          <p className="text-stone-muted text-sm">开始管理你的 OC 宇宙</p>
        </div>
        <div className="bg-stone-card border border-stone-border p-6" style={{ borderRadius: "12px" }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-text mb-1">用户名</label>
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="sketch-input" placeholder="你的名字" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-text mb-1">邮箱</label>
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="sketch-input" placeholder="your@email.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-text mb-1">密码</label>
              <input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="sketch-input" placeholder="至少6位字符" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
              style={{ background: "#869087", color: "#fff", borderRadius: "8px" }}>
              {loading ? "注册中..." : "注册"}
            </button>
          </form>
          <p className="text-center text-sm text-stone-muted mt-4">
            已有账号？ <Link href="/login" className="text-sage-600 hover:text-sage-700 font-medium">登录</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
