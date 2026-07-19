"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signIn("credentials", { email: form.email, password: form.password, redirect: false });
      if (result?.error) { toast.error(result.error); }
      else { toast.success("登录成功！"); router.push("/dashboard"); router.refresh(); }
    } catch { toast.error("登录失败"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-warm-bg">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="text-center mb-8">
          <Link href="/" className="text-4xl">📖</Link>
          <h1 className="text-2xl font-hand text-warm-brown mt-3">欢迎回来</h1>
          <p className="text-warm-muted text-sm mt-1">登录你的 OC 管理器</p>
        </div>

        <div className="bg-warm-paper border border-warm-border p-6 shadow-sm"
          style={{ borderRadius: "22px 6px 22px 6px / 18px 5px 18px 5px" }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-warm-brown mb-1">邮箱</label>
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="sketch-input" placeholder="your@email.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-warm-brown mb-1">密码</label>
              <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="sketch-input" placeholder="输入密码" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-2.5 text-warm-cream font-medium transition-all shadow-sm hover:shadow-md disabled:opacity-50"
              style={{ background: "#B8977E", borderRadius: "18px 5px 18px 5px / 15px 4px 15px 4px" }}>
              {loading ? "登录中..." : "登录"}
            </button>
          </form>
          <p className="text-center text-sm text-warm-muted mt-4">
            还没有账号？ <Link href="/register" className="text-amber-700 hover:text-amber-800 font-medium">注册</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
