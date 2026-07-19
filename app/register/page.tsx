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
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "注册失败");
        setLoading(false);
        return;
      }

      toast.success("注册成功！正在登录...");

      // Auto-login after registration
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.ok) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      toast.error("注册失败，请稍后重试");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-warm-bg relative overflow-hidden">
      {/* Background watercolor blobs */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
        style={{
          background: "radial-gradient(ellipse 55% 45% at 80% 20%, rgba(200,146,107,0.07) 0%, transparent 60%), radial-gradient(ellipse 50% 45% at 15% 70%, rgba(160,184,160,0.06) 0%, transparent 55%)",
        }} />

      <div className="w-full max-w-md animate-slide-up relative">
        <div className="text-center mb-8">
          <Link href="/" className="text-4xl relative inline-block">
            <span className="absolute inset-0 rounded-full opacity-40"
              style={{
                background: "radial-gradient(circle, rgba(200,146,107,0.15) 0%, transparent 70%)",
                transform: "scale(1.5)",
              }} />
            <span className="relative">📖</span>
          </Link>
          <h1 className="text-2xl font-serif font-bold text-warm-brown mt-2">
            创建账号
          </h1>
          <p className="text-warm-muted text-sm mt-1">
            开始管理你的 OC 宇宙
          </p>
        </div>

        <div className="watercolor-card corners-floral p-6">
          <form onSubmit={handleSubmit} className="space-y-4 relative">
            <div>
              <label className="block text-sm font-medium text-warm-brown mb-1">
                用户名
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="sketch-input w-full"
                placeholder="你的名字"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-warm-brown mb-1">
                邮箱
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="sketch-input w-full"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-warm-brown mb-1">
                密码
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="sketch-input w-full"
                placeholder="至少6位字符"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 text-warm-cream font-medium transition-all shadow-sm hover:shadow-md disabled:opacity-50 relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #8A5D3E 0%, #6B4830 100%)",
                borderRadius: "18px 5px 18px 5px / 15px 4px 15px 4px",
              }}
            >
              <span className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
                style={{ background: "radial-gradient(ellipse 60% 40% at 50% 30%, rgba(255,255,255,0.12) 0%, transparent 60%)" }} />
              <span className="relative">{loading ? "注册中..." : "注册"}</span>
            </button>
          </form>

          <p className="text-center text-sm text-warm-muted mt-4">
            已有账号？{" "}
            <Link
              href="/login"
              className="text-amber-700 hover:text-amber-800 font-medium"
            >
              登录
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
