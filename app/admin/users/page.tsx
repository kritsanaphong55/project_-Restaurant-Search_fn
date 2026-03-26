// app/admin/users/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Users,
  User,
  Mail,
  Phone,
  Pencil,
  Trash2,
  Save,
  X,
  UserCog,
  Crown,
  Store,
} from "lucide-react";
import RequireAuth from "@/app/components/RequireAuth";
import { apiFetch } from "@/src/lib/api";

type UserRow = {
  user_id: number;
  username: string;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  role: "ADMIN" | "OWNER" | "USER";
};

type EditState = {
  full_name: string;
  email: string;
  phone: string;
  role: UserRow["role"];
};

function RoleBadge({ role }: { role: UserRow["role"] }) {
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

export default function AdminUsersPage() {
  const [items, setItems] = useState<UserRow[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [actioningId, setActioningId] = useState<number | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editState, setEditState] = useState<EditState>({
    full_name: "",
    email: "",
    phone: "",
    role: "USER",
  });

  const load = useCallback(async () => {
    setMsg(null);
    setLoading(true);
    try {
      const res = await apiFetch("/api/users");
      setItems(res.data || []);
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "โหลด user ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const startEdit = (u: UserRow) => {
    setEditingId(u.user_id);
    setEditState({
      full_name: u.full_name || "",
      email: u.email || "",
      phone: u.phone || "",
      role: u.role,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (userId: number) => {
    setActioningId(userId);
    setMsg(null);
    try {
      await apiFetch(`/api/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify(editState),
      });
      setEditingId(null);
      await load();
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "แก้ user ไม่สำเร็จ");
    } finally {
      setActioningId(null);
    }
  };

  const remove = async (id: number) => {
    if (!confirm("ลบผู้ใช้นี้?")) return;
    setActioningId(id);
    setMsg(null);
    try {
      await apiFetch(`/api/users/${id}`, { method: "DELETE" });
      await load();
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "ลบ user ไม่สำเร็จ");
    } finally {
      setActioningId(null);
    }
  };

  const summary = useMemo(() => {
    return {
      total: items.length,
      admins: items.filter((u) => u.role === "ADMIN").length,
      owners: items.filter((u) => u.role === "OWNER").length,
      users: items.filter((u) => u.role === "USER").length,
    };
  }, [items]);

  return (
    <RequireAuth allow={["ADMIN"]}>
      <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-white">
        <div className="mx-auto max-w-6xl px-4 py-8">

          {/* Header */}
          <div className="mb-6 rounded-3xl bg-gradient-to-r from-orange-500 to-orange-400 px-6 py-6 text-white shadow-lg">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                <Users className="h-7 w-7" />
              </div>
              <div>
                <div className="mb-2">
                  <Link
                    href="/admin"
                    className="inline-flex items-center gap-1 text-sm text-white/90 transition hover:text-white"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    กลับ Admin Dashboard
                  </Link>
                </div>
                <h1 className="text-3xl font-bold leading-tight">
                  จัดการผู้ใช้
                </h1>
              </div>
            </div>
          </div>

          {/* Summary cards */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-500">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">ผู้ใช้ทั้งหมด</div>
                  <div className="text-xl font-bold text-[#1F2937]">
                    {summary.total}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-600">
                  <Crown className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">ADMIN</div>
                  <div className="text-xl font-bold text-[#1F2937]">
                    {summary.admins}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <Store className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">OWNER</div>
                  <div className="text-xl font-bold text-[#1F2937]">
                    {summary.owners}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-green-100 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-600">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">USER</div>
                  <div className="text-xl font-bold text-[#1F2937]">
                    {summary.users}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          {msg && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {msg}
            </div>
          )}

          {loading && (
            <div className="mb-4 flex items-center gap-2 rounded-2xl border border-orange-100 bg-white px-4 py-3 text-sm text-gray-500">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-orange-400 border-t-transparent" />
              กำลังโหลดข้อมูลผู้ใช้...
            </div>
          )}

          {!loading && items.length === 0 && (
            <div className="rounded-3xl border border-dashed border-orange-200 bg-white px-6 py-14 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                <Users className="h-8 w-8" />
              </div>
              <h2 className="text-lg font-semibold text-[#1F2937]">
                ไม่พบข้อมูลผู้ใช้
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                ตอนนี้ยังไม่มีรายการผู้ใช้ในระบบ
              </p>
            </div>
          )}

          {/* User list */}
          <div className="grid gap-5">
            {items.map((u) => (
              <div
                key={u.user_id}
                className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-orange-200 hover:shadow-md"
              >
                {editingId !== u.user_id ? (
                  <>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-xl font-bold text-[#1F2937]">
                            {u.username}
                          </h2>
                          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-500">
                            #{u.user_id}
                          </span>
                          <RoleBadge role={u.role} />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-2 text-sm text-gray-600">
                      <div className="inline-flex items-center gap-2">
                        <User className="h-4 w-4 text-orange-400" />
                        <span>{u.full_name || "-"}</span>
                      </div>

                      <div className="inline-flex items-center gap-2">
                        <Mail className="h-4 w-4 text-orange-400" />
                        <span>{u.email || "-"}</span>
                      </div>

                      <div className="inline-flex items-center gap-2">
                        <Phone className="h-4 w-4 text-orange-400" />
                        <span>{u.phone || "-"}</span>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        onClick={() => startEdit(u)}
                        disabled={actioningId === u.user_id}
                        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:border-orange-300 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Pencil className="h-4 w-4" />
                        แก้ไข
                      </button>

                      <button
                        onClick={() => void remove(u.user_id)}
                        disabled={actioningId === u.user_id}
                        className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Trash2 className="h-4 w-4" />
                        {actioningId === u.user_id ? "กำลังลบ..." : "ลบ"}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="grid gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <UserCog className="h-5 w-5 text-orange-500" />
                      <h3 className="text-lg font-bold text-[#1F2937]">
                        แก้ไขผู้ใช้: {u.username}
                      </h3>
                    </div>

                    <input
                      value={editState.full_name}
                      onChange={(e) =>
                        setEditState((s) => ({ ...s, full_name: e.target.value }))
                      }
                      placeholder="ชื่อ-นามสกุล"
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                    />

                    <input
                      type="email"
                      value={editState.email}
                      onChange={(e) =>
                        setEditState((s) => ({ ...s, email: e.target.value }))
                      }
                      placeholder="Email"
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                    />

                    <input
                      value={editState.phone}
                      onChange={(e) =>
                        setEditState((s) => ({ ...s, phone: e.target.value }))
                      }
                      placeholder="Phone"
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                    />

                    <select
                      value={editState.role}
                      onChange={(e) =>
                        setEditState((s) => ({
                          ...s,
                          role: e.target.value as UserRow["role"],
                        }))
                      }
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                    >
                      <option value="USER">USER</option>
                      <option value="OWNER">OWNER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>

                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => void saveEdit(u.user_id)}
                        disabled={actioningId === u.user_id}
                        className="inline-flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-medium text-green-700 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Save className="h-4 w-4" />
                        {actioningId === u.user_id ? "กำลังบันทึก..." : "บันทึก"}
                      </button>

                      <button
                        onClick={cancelEdit}
                        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:border-orange-300 hover:text-orange-600"
                      >
                        <X className="h-4 w-4" />
                        ยกเลิก
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </div>
    </RequireAuth>
  );
}