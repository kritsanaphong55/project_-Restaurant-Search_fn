// app/register/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import {
  UserPlus,
  User,
  Lock,
  Mail,
  Phone,
  IdCard,
  UtensilsCrossed,
  Search,
  Store,
  ShieldCheck,
} from "lucide-react";
import { apiFetch } from "@/src/lib/api";

export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [full_name, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMsg(null);

    if (password.length < 4) {
      setMsg("รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร");
      return;
    }

    setLoading(true);

    try {
      await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          username,
          password,
          full_name,
          email,
          phone,
          role,
        }),
      });

      const loginData = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      localStorage.setItem("token", loginData.token);
      localStorage.setItem("user", JSON.stringify(loginData.user));
      window.dispatchEvent(new Event("auth-changed"));

      if (loginData.user?.role === "OWNER") {
        router.replace("/owner/new-restaurant");
      } else {
        router.replace("/restaurants");
      }
    } catch (err: unknown) {
      setMsg(err instanceof Error ? err.message : "สมัครไม่สำเร็จ");
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
                สร้างบัญชีใหม่
                <span className="block text-orange-400">เพื่อเริ่มใช้งานระบบ</span>
              </h1>

              <p className="mt-4 max-w-md text-sm leading-6 text-gray-300">
                สมัครสมาชิกเพื่อค้นหาร้านอาหาร ดูข้อมูลร้าน รีวิว และใช้งานระบบได้อย่างครบถ้วน
                หากสมัครเป็นเจ้าของร้าน จะสามารถจัดการข้อมูลร้านอาหารของตนเองได้
              </p>
            </div>

            <div className="mt-10 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start gap-3">
                  <Search className="mt-0.5 h-5 w-5 text-orange-300" />
                  <p className="text-sm text-gray-300">
                    ผู้ใช้ทั่วไปสามารถค้นหา ดูรายละเอียด และรีวิวร้านอาหารได้
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start gap-3">
                  <Store className="mt-0.5 h-5 w-5 text-orange-300" />
                  <p className="text-sm text-gray-300">
                    เจ้าของร้านสามารถเพิ่มและจัดการข้อมูลร้านอาหารของตนเองได้
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 text-orange-300" />
                  <p className="text-sm text-gray-300">
                    ระบบออกแบบให้ใช้งานง่ายและเหมาะกับทั้งมือถือและคอมพิวเตอร์
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
                  <UserPlus className="h-7 w-7" />
                </div>

                <h2 className="text-3xl font-bold text-[#1F2937]">สมัครสมาชิก</h2>
                <p className="mt-2 text-sm text-gray-500">
                  กรอกข้อมูลเพื่อสร้างบัญชีใหม่
                </p>
              </div>

              <form onSubmit={onSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                    <User className="h-4 w-4 text-orange-400" />
                    Username *
                  </label>
                  <input
                    type="text"
                    placeholder="ตัวอย่าง: john123"
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
                    รหัสผ่าน * (อย่างน้อย 4 ตัวอักษร)
                  </label>
                  <input
                    type="password"
                    placeholder="รหัสผ่าน"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={4}
                    disabled={loading}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                    <IdCard className="h-4 w-4 text-orange-400" />
                    ชื่อ-นามสกุล
                  </label>
                  <input
                    type="text"
                    placeholder="ชื่อ-นามสกุล"
                    value={full_name}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={loading}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Mail className="h-4 w-4 text-orange-400" />
                    Email *
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
                    <Phone className="h-4 w-4 text-orange-400" />
                    เบอร์โทรศัพท์
                  </label>
                  <input
                    type="text"
                    placeholder="0812345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={loading}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Store className="h-4 w-4 text-orange-400" />
                    สมัครในฐานะ
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    disabled={loading}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                  >
                    <option value="USER">USER — ผู้ใช้ทั่วไป (ค้นหาและรีวิวร้าน)</option>
                    <option value="OWNER">OWNER — เจ้าของร้าน (จัดการร้านอาหาร)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-200 disabled:cursor-not-allowed disabled:bg-orange-300"
                >
                  <UserPlus className="h-4 w-4" />
                  {loading ? "กำลังสมัคร..." : "สมัครสมาชิก"}
                </button>
              </form>

              {msg && (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {msg}
                </div>
              )}

              <div className="mt-6 rounded-2xl border border-orange-100 bg-orange-50/50 px-4 py-4 text-sm">
                <div className="text-gray-600">
                  มีบัญชีแล้ว?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-orange-500 transition hover:text-orange-600 hover:underline"
                  >
                    Login
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