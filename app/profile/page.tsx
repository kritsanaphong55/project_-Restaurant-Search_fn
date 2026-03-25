// app/profile/page.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  User,
  Mail,
  Phone,
  Lock,
  Crown,
  Store,
  Save,
  RefreshCw,
} from "lucide-react";
import RequireAuth from "@/app/components/RequireAuth";
import { apiFetch } from "@/src/lib/api";

type Me = {
  user_id: number;
  username: string;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  role: "ADMIN" | "OWNER" | "USER";
};

function RoleBadge({ role }: { role: Me["role"] }) {
  if (role === "ADMIN") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
        <Crown className="h-3.5 w-3.5" />
        ADMIN
      </span>
    );
  }
  if (role === "OWNER") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
        <Store className="h-3.5 w-3.5" />
        OWNER
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">
      <User className="h-3.5 w-3.5" />
      USER
    </span>
  );
}

export default function ProfilePage() {
  const [me, setMe] = useState<Me | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loadingInit, setLoadingInit] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const showMsg = (text: string, isSuccess = false) => {
    setSuccess(isSuccess);
    setMsg(text);
    setTimeout(() => setMsg(null), 3000);
  };

  const load = useCallback(async () => {
    setLoadingInit(true);
    try {
      const res = await apiFetch("/api/users/me");
      const user: Me | undefined = res.user;
      if (!user) throw new Error("ไม่พบข้อมูลผู้ใช้");
      setMe(user);
      setFullName(user.full_name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
    } catch (e: unknown) {
      showMsg(e instanceof Error ? e.message : "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoadingInit(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMsg(null);
    if (password && password.length < 4) {
      showMsg("รหัสผ่านใหม่ต้องมีอย่างน้อย 4 ตัวอักษร");
      return;
    }
    setLoadingSubmit(true);
    try {
      await apiFetch("/api/users/me", {
        method: "PATCH",
        body: JSON.stringify({
          full_name: fullName || undefined,
          email: email || undefined,
          phone: phone || undefined,
          password: password || undefined,
        }),
      });
      setPassword("");
      showMsg("✅ บันทึกข้อมูลสำเร็จ", true);
      await load();
    } catch (e: unknown) {
      showMsg(e instanceof Error ? e.message : "บันทึกข้อมูลไม่สำเร็จ");
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-white px-4 py-8">
        <div className="mx-auto max-w-5xl">
          <div className="overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-lg">

            {/* Header */}
            <div className="bg-gradient-to-r from-[#1F2937] to-[#374151] px-6 py-6 text-white sm:px-8">
              <div className="mb-3">
                <Link
                  href="/"
                  className="inline-flex items-center gap-1 text-sm text-gray-300 transition hover:text-white"
                >
                  <ChevronLeft className="h-4 w-4" />
                  หน้าแรก
                </Link>
              </div>
              <h1 className="text-2xl font-bold text-white">โปรไฟล์</h1>
            </div>

            <div className="px-6 py-6 sm:px-8">
              {/* Top profile card */}
              {me && (
                <div className="mb-6 rounded-3xl border border-orange-100 bg-gradient-to-r from-orange-50 to-white p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-500 text-lg font-bold text-white shadow-sm">
                      {me.username?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm text-gray-500">บัญชีผู้ใช้</div>
                      <div className="truncate text-lg font-bold text-[#1F2937]">
                        @{me.username}
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        ID ผู้ใช้: #{me.user_id}
                      </div>
                    </div>
                    <div className="sm:ml-auto">
                      <RoleBadge role={me.role} />
                    </div>
                  </div>
                </div>
              )}

              {/* Message */}
              {msg && (
                <div className={`mb-5 rounded-2xl border px-4 py-3 text-sm ${
                  success
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-red-200 bg-red-50 text-red-600"
                }`}>
                  {msg}
                </div>
              )}

              {/* Loading */}
              {loadingInit ? (
                <div className="rounded-2xl border border-orange-100 bg-orange-50 px-4 py-6 text-center text-sm text-gray-600">
                  <div className="inline-flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin text-orange-500" />
                    กำลังโหลดข้อมูล...
                  </div>
                </div>
              ) : (
                <form onSubmit={save} className="space-y-6">
                  {/* Personal info */}
                  <div className="rounded-3xl border border-gray-100 bg-white p-5">
                    <h2 className="mb-4 text-lg font-bold text-[#1F2937]">ข้อมูลส่วนตัว</h2>
                    <div className="grid gap-5">
                      <div>
                        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                          <User className="h-4 w-4 text-orange-400" />
                          ชื่อ-นามสกุล
                        </label>
                        <input
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="ชื่อ-นามสกุล"
                          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                        />
                      </div>
                      <div>
                        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                          <Mail className="h-4 w-4 text-orange-400" />
                          Email
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="email@example.com"
                          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                        />
                      </div>
                      <div>
                        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                          <Phone className="h-4 w-4 text-orange-400" />
                          เบอร์โทรศัพท์
                        </label>
                        <input
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="0812345678"
                          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password section */}
                  <div className="rounded-3xl border border-gray-100 bg-white p-5">
                    <h2 className="mb-4 text-lg font-bold text-[#1F2937]">เปลี่ยนรหัสผ่าน</h2>
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Lock className="h-4 w-4 text-orange-400" />
                        รหัสผ่านใหม่
                        <span className="font-normal text-gray-400">(ถ้าไม่เปลี่ยน ปล่อยว่างไว้)</span>
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="อย่างน้อย 4 ตัวอักษร"
                        minLength={4}
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                      />
                      <p className="mt-2 text-xs text-gray-500">
                        กรอกรหัสผ่านใหม่เฉพาะเมื่อคุณต้องการเปลี่ยนรหัสผ่าน
                      </p>
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loadingSubmit}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-200 disabled:cursor-not-allowed disabled:bg-orange-300"
                  >
                    <Save className="h-4 w-4" />
                    {loadingSubmit ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}