// app/forgot-password/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  KeyRound,
  User,
  Mail,
  Lock,
  UtensilsCrossed,
  ShieldCheck,
  RefreshCw,
  ChevronLeft,
} from "lucide-react";
import { apiFetch } from "@/src/lib/api";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMsg(null);

    if (newPassword.length < 4) {
      setMsg("รหัสผ่านใหม่ต้องมีอย่างน้อย 4 ตัวอักษร");
      return;
    }

    setLoading(true);

    try {
      await apiFetch("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({
          username,
          email,
          new_password: newPassword,
        }),
      });

      setSuccess(true);
      setMsg("เปลี่ยนรหัสผ่านสำเร็จ ✅ กำลังพาไปหน้า Login...");
      setUsername("");
      setEmail("");
      setNewPassword("");

      setTimeout(() => {
        router.replace("/login");
      }, 2000);
    } catch (err: unknown) {
      setMsg(err instanceof Error ? err.message : "เปลี่ยนรหัสผ่านไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-white px-4">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center py-10">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-xl lg:grid-cols-2">
          {/* Left Section */}
          <div className="hidden flex-col justify-between bg-[#1F2937] p-10 text-white lg:flex">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/20 px-4 py-1 text-sm font-medium text-orange-300 ring-1 ring-orange-400/30">
                <UtensilsCrossed className="h-4 w-4" />
                Restaurant Finder
              </div>

              <h1 className="mt-6 text-4xl font-bold leading-tight">
                รีเซ็ตรหัสผ่าน
                <span className="block text-orange-400">เพื่อกลับเข้าสู่ระบบ</span>
              </h1>

              <p className="mt-4 max-w-md text-sm leading-6 text-gray-300">
                หากคุณลืมรหัสผ่าน สามารถกรอกข้อมูลที่ใช้สมัครไว้
                เพื่อกำหนดรหัสผ่านใหม่และกลับไปใช้งานระบบค้นหาร้านอาหารได้ทันที
              </p>
            </div>

            <div className="mt-10 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start gap-3">
                  <User className="mt-0.5 h-5 w-5 text-orange-300" />
                  <p className="text-sm text-gray-300">
                    ใช้ Username และ Email ที่ตรงกับข้อมูลบัญชีเดิมของคุณ
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 text-orange-300" />
                  <p className="text-sm text-gray-300">
                    ตั้งรหัสผ่านใหม่ให้ปลอดภัยและจดจำได้ง่ายสำหรับการใช้งานครั้งถัดไป
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center justify-center bg-white px-6 py-10 sm:px-10">
            <div className="w-full max-w-md">
              <div className="mb-8 text-center lg:text-left">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-500 lg:mx-0">
                  <KeyRound className="h-7 w-7" />
                </div>

                <h2 className="text-3xl font-bold text-[#1F2937]">ลืมรหัสผ่าน</h2>
                <p className="mt-2 text-sm text-gray-500">
                  กรอกข้อมูลเพื่อเปลี่ยนรหัสผ่านใหม่
                </p>
              </div>

              {!success && (
                <form onSubmit={onSubmit} className="space-y-5">
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                      <User className="h-4 w-4 text-orange-400" />
                      Username
                    </label>
                    <input
                      type="text"
                      placeholder="กรอก username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      disabled={loading}
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Mail className="h-4 w-4 text-orange-400" />
                      Email ที่ใช้สมัคร
                    </label>
                    <input
                      type="email"
                      placeholder="email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Lock className="h-4 w-4 text-orange-400" />
                      รหัสผ่านใหม่
                    </label>
                    <input
                      type="password"
                      placeholder="รหัสผ่านใหม่ (อย่างน้อย 4 ตัวอักษร)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={4}
                      disabled={loading}
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-200 disabled:cursor-not-allowed disabled:bg-orange-300"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        กำลังบันทึก...
                      </>
                    ) : (
                      <>
                        <KeyRound className="h-4 w-4" />
                        เปลี่ยนรหัสผ่าน
                      </>
                    )}
                  </button>
                </form>
              )}

              {msg && (
                <div
                  className={`mt-5 rounded-xl border px-4 py-3 text-sm ${
                    success
                      ? "border-green-200 bg-green-50 text-green-700"
                      : "border-red-200 bg-red-50 text-red-600"
                  }`}
                >
                  {msg}
                </div>
              )}

              <div className="mt-6 rounded-2xl border border-orange-100 bg-orange-50/50 px-4 py-4 text-sm">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 font-medium text-orange-500 transition hover:text-orange-600 hover:underline"
                >
                  <ChevronLeft className="h-4 w-4" />
                  กลับไปหน้า Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}