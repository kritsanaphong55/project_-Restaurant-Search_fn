// app/admin/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  
  Users,
  Store,
  MessageSquare,
  CheckCircle2,
  Clock4,
  MapPin,
  Wallet,
  Eye,
  XCircle,
  BadgeCheck,
  AlertTriangle,
  LayoutDashboard,
} from "lucide-react";
import { apiFetch } from "@/src/lib/api";
import RequireAuth from "@/app/components/RequireAuth";

type Restaurant = {
  restaurant_id: number;
  restaurant_name: string;
  address: string;
  status: string;
  price_min: number;
  price_max: number;
  owner_id?: number;
};

export default function AdminPage() {
  const [pendingRestaurants, setPendingRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<number | null>(null);

  const loadPending = async () => {
    setMsg(null);
    setLoading(true);

    try {
      const res = await apiFetch("/api/restaurants?status=PENDING");
      setPendingRestaurants(res.data || []);
    } catch (err: unknown) {
      setMsg(err instanceof Error ? err.message : "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const approveRestaurant = async (id: number) => {
    if (!confirm(`ยืนยันอนุมัติร้าน #${id}?`)) return;

    setActioningId(id);
    try {
      await apiFetch(`/api/restaurants/${id}/approve`, {
        method: "PATCH",
        body: JSON.stringify({ note: "" }),
      });
      await loadPending();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "อนุมัติไม่สำเร็จ");
    } finally {
      setActioningId(null);
    }
  };

  const rejectRestaurant = async (id: number) => {
    if (!confirm(`ยืนยันไม่อนุมัติร้าน #${id}?`)) return;

    setActioningId(id);
    try {
      await apiFetch(`/api/restaurants/${id}/reject`, {
        method: "PATCH",
        body: JSON.stringify({ note: "" }),
      });
      await loadPending();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "ไม่อนุมัติไม่สำเร็จ");
    } finally {
      setActioningId(null);
    }
  };

  useEffect(() => {
    void loadPending();
  }, []);

  const summary = useMemo(() => {
    return {
      pending: pendingRestaurants.length,
    };
  }, [pendingRestaurants]);

  return (
    <RequireAuth allow={["ADMIN"]}>
      <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-white">
        <div className="mx-auto max-w-6xl px-4 py-8">

          {/* Header */}
          <div className="mb-6 rounded-3xl bg-gradient-to-r from-orange-500 to-orange-400 px-6 py-6 text-white shadow-lg">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                <LayoutDashboard className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-3xl font-bold leading-tight">
                  Admin Dashboard
                </h1>
              </div>
            </div>
          </div>

          {/* Nav links */}
          <div className="mb-6 flex flex-wrap gap-3">
            <Link
              href="/admin/reviews"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:border-orange-300 hover:text-orange-600"
            >
              <MessageSquare className="h-4 w-4" />
              ไปหน้าจัดการรีวิว
            </Link>

            <Link
              href="/admin/users"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:border-orange-300 hover:text-orange-600"
            >
              <Users className="h-4 w-4" />
              จัดการผู้ใช้
            </Link>

            <Link
              href="/admin/restaurants"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:border-orange-300 hover:text-orange-600"
            >
              <Store className="h-4 w-4" />
              จัดการร้าน
            </Link>
          </div>

          {/* Summary */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-500">
                  <Store className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">ร้านที่รออนุมัติ</div>
                  <div className="text-xl font-bold text-[#1F2937]">
                    {summary.pending}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                  <Clock4 className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">สถานะหลัก</div>
                  <div className="text-xl font-bold text-[#1F2937]">รอตรวจสอบ</div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-green-100 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-600">
                  <BadgeCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">งานของ Admin</div>
                  <div className="text-xl font-bold text-[#1F2937]">อนุมัติร้าน</div>
                </div>
              </div>
            </div>
          </div>

          {/* Pending section */}
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <h2 className="text-2xl font-bold text-[#1F2937]">ร้านที่รออนุมัติ</h2>
          </div>

          <p className="mb-4 text-sm text-gray-500">
            หน้านี้ไว้สำหรับอนุมัติหรือไม่อนุมัติร้านอาหารที่มีสถานะ{" "}
            <span className="font-semibold text-amber-600">รอการตรวจสอบ</span>
          </p>

          {loading && (
            <div className="mb-4 flex items-center gap-2 rounded-2xl border border-orange-100 bg-white px-4 py-3 text-sm text-gray-500">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-orange-400 border-t-transparent" />
              กำลังโหลดข้อมูล...
            </div>
          )}

          {msg && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {msg}
            </div>
          )}

          {!loading && pendingRestaurants.length === 0 && (
            <div className="rounded-3xl border border-dashed border-orange-200 bg-white px-6 py-14 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="text-lg font-semibold text-[#1F2937]">
                ไม่มีร้านที่รออนุมัติ
              </h2>
              <p className="mt-2 text-sm text-gray-500">ตอนนี้รายการอนุมัติว่างอยู่ ✅</p>
            </div>
          )}

          <div className="grid gap-5">
            {pendingRestaurants.map((r) => (
              <div
                key={r.restaurant_id}
                className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-orange-200 hover:shadow-md"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-bold text-[#1F2937]">
                        {r.restaurant_name}
                      </h3>
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-500">
                        #{r.restaurant_id}
                      </span>
                    </div>
                  </div>

                  <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                    รอการตรวจสอบ
                  </span>
                </div>

                <div className="mt-4 grid gap-2 text-sm text-gray-600">
                  <div className="inline-flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" />
                    <span>{r.address}</span>
                  </div>

                  <div className="inline-flex items-center gap-2">
                    <Wallet className="h-4 w-4 shrink-0 text-orange-400" />
                    <span>
                      ราคา {r.price_min} - {r.price_max} บาท
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    onClick={() => void approveRestaurant(r.restaurant_id)}
                    disabled={actioningId === r.restaurant_id}
                    className="inline-flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-medium text-green-700 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {actioningId === r.restaurant_id ? "กำลังดำเนินการ..." : "อนุมัติ"}
                  </button>

                  <button
                    onClick={() => void rejectRestaurant(r.restaurant_id)}
                    disabled={actioningId === r.restaurant_id}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <XCircle className="h-4 w-4" />
                    {actioningId === r.restaurant_id ? "กำลังดำเนินการ..." : "ไม่อนุมัติ"}
                  </button>

                  <Link
                    href={`/restaurants/${r.restaurant_id}`}
                    className="inline-flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-2.5 text-sm font-medium text-orange-600 transition hover:bg-orange-100"
                  >
                    <Eye className="h-4 w-4" />
                    ดูหน้าร้าน
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </RequireAuth>
  );
}