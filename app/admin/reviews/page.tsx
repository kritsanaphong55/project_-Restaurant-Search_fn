// app/admin/reviews/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Eye,
  User,
  Star,
  Store,
  Clock3,
  AlertTriangle,
} from "lucide-react";
import { apiFetch } from "@/src/lib/api";
import RequireAuth from "@/app/components/RequireAuth";

type PendingReview = {
  review_id: number;
  restaurant_id: number;
  restaurant_name: string;
  user_id: number;
  username: string;
  rating: number;
  comment: string | null;
  review_status: "PENDING" | "APPROVED" | "REJECTED";
  created_at: string;
};

export default function AdminReviewsPage() {
  const [items, setItems] = useState<PendingReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setMsg(null);
    setLoading(true);

    try {
      const data = await apiFetch("/api/reviews/pending");
      setItems(data.data || []);
    } catch (err: unknown) {
      setItems([]);
      setMsg(err instanceof Error ? err.message : "โหลดรีวิวไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, []);

  const approveReview = async (reviewId: number) => {
    setActioningId(reviewId);
    setMsg(null);

    try {
      await apiFetch(`/api/reviews/${reviewId}/approve`, {
        method: "PATCH",
        body: JSON.stringify({ note: "approved by admin" }),
      });
      await load();
    } catch (err: unknown) {
      setMsg(err instanceof Error ? err.message : "อนุมัติรีวิวไม่สำเร็จ");
    } finally {
      setActioningId(null);
    }
  };

  const rejectReview = async (reviewId: number) => {
    setActioningId(reviewId);
    setMsg(null);

    try {
      await apiFetch(`/api/reviews/${reviewId}/reject`, {
        method: "PATCH",
        body: JSON.stringify({ note: "rejected by admin" }),
      });
      await load();
    } catch (err: unknown) {
      setMsg(err instanceof Error ? err.message : "ปฏิเสธรีวิวไม่สำเร็จ");
    } finally {
      setActioningId(null);
    }
  };

  useEffect(() => {
    void load();
  }, [load]);

  const summary = useMemo(() => {
    return {
      pending: items.length,
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
                <MessageSquare className="h-7 w-7" />
              </div>
              <div>
                <div className="mb-2">
                  <Link
                    href="/admin"
                    className="inline-flex items-center gap-1 text-sm text-white/90 transition hover:text-white"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    กลับ Admin
                  </Link>
                </div>
                <h1 className="text-3xl font-bold leading-tight">
                  รีวิวที่รออนุมัติ
                </h1>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-500">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">รีวิวรออนุมัติ</div>
                  <div className="text-xl font-bold text-[#1F2937]">
                    {summary.pending}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">สถานะรีวิว</div>
                  <div className="text-xl font-bold text-[#1F2937]">รอตรวจสอบ</div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-green-100 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">งานของ Admin</div>
                  <div className="text-xl font-bold text-[#1F2937]">กลั่นกรองรีวิว</div>
                </div>
              </div>
            </div>
          </div>

          {/* Message */}
          {msg && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {msg}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="mb-4 flex items-center gap-2 rounded-2xl border border-orange-100 bg-white px-4 py-3 text-sm text-gray-500">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-orange-400 border-t-transparent" />
              กำลังโหลดรีวิว...
            </div>
          )}

          {/* Empty */}
          {!loading && items.length === 0 && (
            <div className="rounded-3xl border border-dashed border-orange-200 bg-white px-6 py-14 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="text-lg font-semibold text-[#1F2937]">
                ไม่มีรีวิวที่รออนุมัติ
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                ตอนนี้ไม่มีรายการรีวิวที่ต้องตรวจสอบ ✅
              </p>
            </div>
          )}

          {/* Review list */}
          <div className="grid gap-5">
            {items.map((r) => {
              const isActioning = actioningId === r.review_id;

              return (
                <div
                  key={r.review_id}
                  className={`rounded-3xl border bg-white p-5 shadow-sm transition ${
                    isActioning
                      ? "border-orange-200 opacity-70"
                      : "border-gray-100 hover:border-orange-200 hover:shadow-md"
                  }`}
                >
                  {/* Top row */}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-bold text-[#1F2937]">
                          รีวิว #{r.review_id}
                        </h2>
                        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                          รอตรวจสอบ
                        </span>
                      </div>

                      <div className="mt-2 inline-flex items-center gap-2 text-sm text-gray-600">
                        <Store className="h-4 w-4 text-orange-400" />
                        <Link
                          href={`/restaurants/${r.restaurant_id}`}
                          className="font-medium text-orange-600 transition hover:text-orange-700 hover:underline"
                        >
                          {r.restaurant_name}
                        </Link>
                      </div>
                    </div>

                    <div className="text-xs text-gray-400">
                      <div className="inline-flex items-center gap-1">
                        <Clock3 className="h-3.5 w-3.5" />
                        {new Date(r.created_at).toLocaleString("th-TH", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="mt-4 grid gap-2 text-sm text-gray-600">
                    <div className="inline-flex items-center gap-2">
                      <User className="h-4 w-4 text-orange-400" />
                      <span>
                        <span className="font-medium">ผู้รีวิว:</span> {r.username}
                      </span>
                    </div>

                    <div className="inline-flex items-center gap-2">
                      <Star className="h-4 w-4 fill-orange-400 text-orange-400" />
                      <span>
                        <span className="font-medium">คะแนน:</span>{" "}
                        {"⭐".repeat(r.rating)} ({r.rating}/5)
                      </span>
                    </div>
                  </div>

                  {/* Comment */}
                  <div className="mt-4 rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-700">
                    <span className="font-medium text-gray-800">คอมเมนต์:</span>{" "}
                    {r.comment || <span className="text-gray-400">-</span>}
                  </div>

                  {/* Actions */}
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      onClick={() => void approveReview(r.review_id)}
                      disabled={actioningId === r.review_id}
                      className="inline-flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-medium text-green-700 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {actioningId === r.review_id ? "กำลังดำเนินการ..." : "อนุมัติ"}
                    </button>

                    <button
                      onClick={() => void rejectReview(r.review_id)}
                      disabled={actioningId === r.review_id}
                      className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <XCircle className="h-4 w-4" />
                      {actioningId === r.review_id ? "กำลังดำเนินการ..." : "ไม่อนุมัติ"}
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
              );
            })}
          </div>

        </div>
      </div>
    </RequireAuth>
  );
}