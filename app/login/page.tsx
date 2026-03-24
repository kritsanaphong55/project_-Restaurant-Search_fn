// app/login/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LogIn,
  User,
  Lock,
  UtensilsCrossed,
  Search,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { apiFetch } from "@/src/lib/api";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");
    const rawUser = localStorage.getItem("user");

    if (!token || !rawUser) return;

    try {
      const user = JSON.parse(rawUser);

      if (user.role === "ADMIN") {
        router.replace("/admin");
      } else if (user.role === "OWNER") {
        router.replace("/owner");
      } else {
        router.replace("/restaurants");
      }
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }, [router]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    try {
      const data = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("auth-changed"));

      if (data.user?.role === "ADMIN") {
        router.replace("/admin");
      } else if (data.user?.role === "OWNER") {
        router.replace("/owner");
      } else {
        router.replace("/restaurants");
      }
    } catch (err: unknown) {
      setMsg(err instanceof Error ? err.message : "Login ไม่สำเร็จ");
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
                Restaurant search system in Walailak Road area
              </div>

              <h1 className="mt-6 text-4xl font-bold leading-tight">
                ค้นหาร้านอาหาร
                <span className="block text-orange-400">ได้ง่ายและรวดเร็ว</span>
              </h1>

              <p className="mt-4 max-w-md text-sm leading-6 text-gray-300">
                เข้าสู่ระบบเพื่อค้นหาร้านอาหาร ดูรายละเอียดเมนู ราคา รีวิว
                และเลือกสถานที่ที่เหมาะกับคุณได้สะดวกยิ่งขึ้น
              </p>
            </div>

            <div className="mt-10 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start gap-3">
                  <Search className="mt-0.5 h-5 w-5 text-orange-300" />
                  <p className="text-sm text-gray-300">
                    ค้นหาร้านอาหารตามประเภทอาหาร และช่วงราคาได้สะดวก
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 text-orange-300" />
                  <p className="text-sm text-gray-300">
                    ดูร้านตามตำแหน่งที่ตั้งและเลือกสถานที่ที่เหมาะกับคุณ
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 text-orange-300" />
                  <p className="text-sm text-gray-300">
                    ใช้งานง่าย รองรับทั้งมือถือและคอมพิวเตอร์
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
                  <LogIn className="h-7 w-7" />
                </div>

                <h2 className="text-3xl font-bold text-[#1F2937]">Login</h2>
                <p className="mt-2 text-sm text-gray-500">
                  เข้าสู่ระบบเพื่อค้นหาร้านอาหาร
                </p>
              </div>

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
                    <Lock className="h-4 w-4 text-orange-400" />
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="กรอกรหัสผ่าน"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-200 disabled:cursor-not-allowed disabled:bg-orange-300"
                >
                  <LogIn className="h-4 w-4" />
                  {loading ? "กำลัง Login..." : "เข้าสู่ระบบ"}
                </button>
              </form>

              {msg && (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {msg}
                </div>
              )}

              <div className="mt-6 rounded-2xl border border-orange-100 bg-orange-50/50 px-4 py-4 text-sm">
                <div className="text-gray-600">
                  ยังไม่มีบัญชี?{" "}
                  <Link
                    href="/register"
                    className="font-semibold text-orange-500 transition hover:text-orange-600 hover:underline"
                  >
                    สมัครสมาชิก
                  </Link>
                </div>

                <div className="mt-2">
                  <Link
                    href="/forgot-password"
                    className="text-gray-500 transition hover:text-[#1F2937] hover:underline"
                  >
                    ลืมรหัสผ่าน?
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}