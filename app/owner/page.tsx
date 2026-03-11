// app/owner/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Store,
  RefreshCw,
  Plus,
  MapPin,
  HandPlatter,
  Clock3,
  Wallet,
  Eye,
  ImageIcon,
  Soup,
  Power,
  CircleDot,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Clock4,
  Ban,
  LayoutDashboard,
} from "lucide-react";
import RequireAuth from "@/app/components/RequireAuth";
import { apiFetch } from "@/src/lib/api";

type FoodType = {
  foodtype_id: number;
  foodtype_name: string;
};

type Restaurant = {
  restaurant_id: number;
  restaurant_name: string;
  address: string;
  status: "APPROVED" | "PENDING" | "REJECTED";
  price_min: number;
  price_max: number;
  food_types?: FoodType[] | null;
  open_time?: string | null;
  close_time?: string | null;
  is_open_now?: number;
  is_active: number;
};

function foodTypesLabel(food_types?: FoodType[] | null): string {
  if (!Array.isArray(food_types) || food_types.length === 0) return "-";
  return food_types.map((ft) => ft.foodtype_name).join(", ");
}

function StatusBadge({ status }: { status: Restaurant["status"] }) {
  if (status === "APPROVED") {
    return (
      <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
        APPROVED
      </span>
    );
  }

  if (status === "REJECTED") {
    return (
      <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
        REJECTED
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
      PENDING
    </span>
  );
}

export default function OwnerPage() {
  const [items, setItems] = useState<Restaurant[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [actioningId, setActioningId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setMsg(null);
    setLoading(true);

    try {
      const res = await apiFetch("/api/restaurants/mine");
      setItems(res.data || []);
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "โหลดร้านไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const toggleActive = async (restaurantId: number) => {
    if (actioningId !== null) return;

    setMsg(null);
    setActioningId(restaurantId);

    try {
      await apiFetch(`/api/restaurants/${restaurantId}/toggle-active`, {
        method: "PATCH",
      });
      await load();
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "เปลี่ยนสถานะร้านไม่สำเร็จ");
    } finally {
      setActioningId(null);
    }
  };

  const summary = useMemo(() => {
    const total = items.length;
    const approved = items.filter((r) => r.status === "APPROVED").length;
    const pending = items.filter((r) => r.status === "PENDING").length;
    const rejected = items.filter((r) => r.status === "REJECTED").length;

    return { total, approved, pending, rejected };
  }, [items]);

  return (
    <RequireAuth allow={["OWNER"]}>
      <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-white">
        <div className="mx-auto max-w-6xl px-4 py-8">
          {/* Header */}
          <div className="mb-6 rounded-3xl bg-gradient-to-r from-orange-500 to-orange-400 px-6 py-6 text-white shadow-lg">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                  <LayoutDashboard className="h-7 w-7" />
                </div>

                <div>
                  <h1 className="text-3xl font-bold leading-tight">
                    Owner Dashboard
                  </h1>
                  <p className="mt-1 text-sm text-orange-50">
                    จัดการร้านอาหาร เมนู รูปภาพ และสถานะการเปิดให้บริการ
                  </p>
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs text-white/90">
                    <Store className="h-3.5 w-3.5" />
                    พื้นที่สำหรับเจ้าของร้าน
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => void load()}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-orange-600 shadow-sm transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                  รีเฟรช
                </button>

                <Link
                  href="/owner/new-restaurant"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/15 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
                >
                  <Plus className="h-4 w-4" />
                  เพิ่มร้านใหม่
                </Link>
              </div>
            </div>
          </div>

          {/* Summary cards */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-500">
                  <Store className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">ร้านทั้งหมด</div>
                  <div className="text-xl font-bold text-[#1F2937]">
                    {summary.total}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-green-100 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">อนุมัติแล้ว</div>
                  <div className="text-xl font-bold text-[#1F2937]">
                    {summary.approved}
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
                  <div className="text-sm text-gray-500">รออนุมัติ</div>
                  <div className="text-xl font-bold text-[#1F2937]">
                    {summary.pending}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-600">
                  <Ban className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">ถูกปฏิเสธ</div>
                  <div className="text-xl font-bold text-[#1F2937]">
                    {summary.rejected}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Error */}
          {msg && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {msg}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="mb-4 flex items-center gap-2 rounded-2xl border border-orange-100 bg-white px-4 py-3 text-sm text-gray-500">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-orange-400 border-t-transparent" />
              กำลังโหลดข้อมูลร้าน...
            </div>
          )}

          {/* Empty state */}
          {!loading && items.length === 0 && (
            <div className="rounded-3xl border border-dashed border-orange-200 bg-white px-6 py-14 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                <Store className="h-8 w-8" />
              </div>
              <h2 className="text-lg font-semibold text-[#1F2937]">
                ยังไม่มีร้านอาหาร
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                เริ่มเพิ่มร้านแรกของคุณเพื่อให้ผู้ใช้งานสามารถค้นหาและดูข้อมูลร้านได้
              </p>
              <div className="mt-5">
                <Link
                  href="/owner/new-restaurant"
                  className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
                >
                  <Plus className="h-4 w-4" />
                  เพิ่มร้านแรกของคุณ
                </Link>
              </div>
            </div>
          )}

          {/* Restaurant list */}
          <div className="grid gap-5">
            {items.map((r) => {
              const isActioning = actioningId === r.restaurant_id;

              return (
                <div
                  key={r.restaurant_id}
                  className={`rounded-3xl border bg-white p-5 shadow-sm transition ${
                    isActioning
                      ? "border-orange-200 opacity-70"
                      : "border-gray-100 hover:border-orange-200 hover:shadow-md"
                  }`}
                >
                  {/* Top row */}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-bold text-[#1F2937]">
                          {r.restaurant_name}
                        </h2>
                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-500">
                          #{r.restaurant_id}
                        </span>
                      </div>
                    </div>

                    <StatusBadge status={r.status} />
                  </div>

                  {/* Info */}
                  <div className="mt-4 grid gap-2 text-sm text-gray-600">
                    <div className="inline-flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" />
                      <span>{r.address}</span>
                    </div>

                    <div className="inline-flex items-start gap-2">
                      <HandPlatter className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" />
                      <span>{foodTypesLabel(r.food_types)}</span>
                    </div>

                    <div className="inline-flex items-center gap-2">
                      <Clock3 className="h-4 w-4 shrink-0 text-orange-400" />
                      <span>
                        {r.open_time || "-"} – {r.close_time || "-"}
                      </span>
                    </div>

                    <div className="inline-flex items-center gap-2">
                      <Wallet className="h-4 w-4 shrink-0 text-orange-400" />
                      <span>
                        {r.price_min} – {r.price_max} บาท
                      </span>
                    </div>
                  </div>

                  {/* Status row */}
                  <div className="mt-4 flex flex-wrap gap-3 text-sm">
                    <div className="inline-flex items-center gap-2 rounded-full bg-gray-50 px-3 py-1.5">
                      <Power className="h-4 w-4 text-orange-400" />
                      <span className="text-gray-600">สถานะร้าน:</span>
                      <span
                        className={`font-semibold ${
                          r.is_active ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {r.is_active ? "เปิดให้บริการ" : "ปิดชั่วคราว"}
                      </span>
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-full bg-gray-50 px-3 py-1.5">
                      <CircleDot className="h-4 w-4 text-orange-400" />
                      <span className="text-gray-600">ตอนนี้:</span>
                      <span
                        className={`font-semibold ${
                          r.is_open_now ? "text-green-600" : "text-gray-500"
                        }`}
                      >
                        {r.is_open_now ? "เปิดอยู่" : "ปิดอยู่"}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      onClick={() => void toggleActive(r.restaurant_id)}
                      disabled={actioningId !== null}
                      className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                        actioningId !== null
                          ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                          : r.is_active
                          ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                          : "border-green-200 bg-green-50 text-green-600 hover:bg-green-100"
                      }`}
                    >
                      <Power className="h-4 w-4" />
                      {isActioning
                        ? "กำลังดำเนินการ..."
                        : r.is_active
                        ? "ปิดร้านชั่วคราว"
                        : "เปิดร้าน"}
                    </button>

                    <Link
                      href={`/owner/${r.restaurant_id}/menu`}
                      className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:border-orange-300 hover:text-orange-600"
                    >
                      <Soup className="h-4 w-4" />
                      จัดการเมนู
                    </Link>

                    <Link
                      href={`/owner/${r.restaurant_id}/images`}
                      className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:border-orange-300 hover:text-orange-600"
                    >
                      <ImageIcon className="h-4 w-4" />
                      จัดการรูปภาพ
                    </Link>

                    <Link
                      href={`/restaurants/${r.restaurant_id}`}
                      className="inline-flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-2.5 text-sm font-medium text-orange-600 transition hover:bg-orange-100"
                    >
                      <Eye className="h-4 w-4" />
                      ดูหน้าร้าน
                    </Link>
                  </div>

                  {/* Notices */}
                  {r.status === "PENDING" && (
                    <div className="mt-4 inline-flex w-full items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>ร้านนี้รอ Admin อนุมัติ ยังไม่แสดงในระบบค้นหา</span>
                    </div>
                  )}

                  {r.status === "REJECTED" && (
                    <div className="mt-4 inline-flex w-full items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>ร้านนี้ถูกปฏิเสธโดย Admin กรุณาติดต่อผู้ดูแลระบบ</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}