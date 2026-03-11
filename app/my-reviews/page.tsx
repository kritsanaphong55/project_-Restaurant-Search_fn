// app/my-reviews/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  RefreshCw,
  MessageSquare,
  Search,
  ChevronLeft,
  Store,
  Star,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
} from "lucide-react";
import { apiFetch } from "@/src/lib/api";
import RequireAuth from "@/app/components/RequireAuth";

type MyReview = {
  review_id: number;
  restaurant_id: number;
  restaurant_name: string;
  rating: number;
  comment: string | null;
  review_status: "PENDING" | "APPROVED" | "REJECTED";
  created_at: string;
};

function StatusBadge({ status }: { status: MyReview["review_status"] }) {
  if (status === "APPROVED") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
        <CheckCircle2 className="h-3.5 w-3.5" />
        APPROVED
      </span>
    );
  }

  if (status === "REJECTED") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
        <XCircle className="h-3.5 w-3.5" />
        REJECTED
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
      <AlertTriangle className="h-3.5 w-3.5" />
      PENDING
    </span>
  );
}

export default function MyReviewsPage() {
  const [items, setItems] = useState<MyReview[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setMsg(null);
    setLoading(true);

    try {
      const res = await apiFetch("/api/reviews/mine");
      setItems(res.data || []);
    } catch (e: unknown) {
      setItems([]);
      setMsg(e instanceof Error ? e.message : "โหลดรีวิวไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const summary = useMemo(() => {
    return {
      total: items.length,
      approved: items.filter((r) => r.review_status === "APPROVED").length,
      pending: items.filter((r) => r.review_status === "PENDING").length,
      rejected: items.filter((r) => r.review_status === "REJECTED").length,
    };
  }, [items]);

  return (
    <RequireAuth allow={["USER"]}>
      <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-white px-4 py-8">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-6 rounded-3xl bg-gradient-to-r from-[#1F2937] to-[#374151] px-6 py-6 text-white shadow-lg">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-500/20 text-orange-300 ring-1 ring-orange-400/30">
                  <MessageSquare className="h-7 w-7" />
                </div>

                <div>
                  <div className="inline-flex items-center rounded-full bg-orange-500/20 px-3 py-1 text-xs font-medium text-orange-300 ring-1 ring-orange-400/30">
                    My Reviews
                  </div>
                  <h1 className="mt-3 text-2xl font-bold sm:text-3xl">
                    รีวิวของฉัน
                  </h1>
                  <p className="mt-2 text-sm text-gray-300">
                    หน้านี้แสดงรีวิวของคุณ พร้อมสถานะ{" "}
                    <span className="font-semibold text-amber-300">PENDING</span>,{" "}
                    <span className="font-semibold text-green-300">APPROVED</span>{" "}
                    และ{" "}
                    <span className="font-semibold text-red-300">REJECTED</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => void load()}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-200 disabled:cursor-not-allowed disabled:bg-orange-300"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                {loading ? "กำลังโหลด..." : "Refresh"}
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-500">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">รีวิวทั้งหมด</div>
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
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">รอตรวจสอบ</div>
                  <div className="text-xl font-bold text-[#1F2937]">
                    {summary.pending}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-600">
                  <XCircle className="h-5 w-5" />
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

          <div className="overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-lg">
            <div className="px-6 py-5 sm:px-8">
              {/* Nav */}
              <div className="flex flex-wrap gap-4 border-b border-gray-100 pb-4 text-sm">
                <Link
                  href="/restaurants"
                  className="inline-flex items-center gap-1 font-medium text-orange-500 transition hover:text-orange-600 hover:underline"
                >
                  <Search className="h-4 w-4" />
                  ค้นหาร้านอาหาร
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center gap-1 font-medium text-gray-600 transition hover:text-[#1F2937] hover:underline"
                >
                  <ChevronLeft className="h-4 w-4" />
                  หน้าแรก
                </Link>
              </div>

              {/* Message */}
              {msg && (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {msg}
                </div>
              )}

              {/* Loading */}
              {loading && (
                <div className="mt-6 rounded-2xl border border-orange-100 bg-orange-50 px-4 py-6 text-center text-sm text-gray-600">
                  <div className="inline-flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin text-orange-500" />
                    กำลังโหลดข้อมูลรีวิว...
                  </div>
                </div>
              )}

              {/* Empty state */}
              {!loading && items.length === 0 && (
                <div className="mt-8 rounded-2xl border border-dashed border-orange-200 bg-orange-50/40 px-6 py-10 text-center">
                  <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-orange-500">
                    <MessageSquare className="h-8 w-8" />
                  </div>
                  <h2 className="text-lg font-semibold text-[#1F2937]">
                    คุณยังไม่มีรีวิว
                  </h2>
                  <p className="mt-2 text-sm text-gray-500">
                    เริ่มค้นหาร้านอาหารที่สนใจ แล้วเขียนรีวิวเพื่อแบ่งปันประสบการณ์ได้เลย
                  </p>
                  <div className="mt-5">
                    <Link
                      href="/restaurants"
                      className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
                    >
                      <Search className="h-4 w-4" />
                      ไปค้นหาร้านและรีวิวเลย
                    </Link>
                  </div>
                </div>
              )}

              {/* Review list */}
              {!loading && items.length > 0 && (
                <div className="mt-6 grid gap-5">
                  {items.map((r) => (
                    <div
                      key={r.review_id}
                      className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-orange-200 hover:shadow-md"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Store className="h-5 w-5 text-orange-400" />
                            <h2 className="text-lg font-bold text-[#1F2937]">
                              {r.restaurant_name}
                            </h2>
                          </div>

                          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            <span className="inline-flex items-center gap-1 font-medium text-orange-500">
                              <Star className="h-4 w-4 fill-orange-400 text-orange-400" />
                              {"⭐".repeat(r.rating)}
                            </span>

                            <span className="inline-flex items-center gap-1">
                              <Clock3 className="h-4 w-4 text-orange-400" />
                              {new Date(r.created_at).toLocaleString("th-TH", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>

                        <StatusBadge status={r.review_status} />
                      </div>

                      <div
                        className={`mt-4 rounded-2xl px-4 py-3 text-sm ${
                          r.comment
                            ? "bg-gray-50 text-gray-700"
                            : "bg-gray-50 text-gray-400"
                        }`}
                      >
                        <div className="mb-1 inline-flex items-center gap-1 font-medium text-gray-600">
                          <FileText className="h-4 w-4 text-orange-400" />
                          คอมเมนต์
                        </div>
                        <div>{r.comment || "ไม่มีคอมเมนต์"}</div>
                      </div>

                      {r.review_status === "REJECTED" && (
                        <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                          รีวิวนี้ถูกปฏิเสธโดย Admin
                        </div>
                      )}

                      <div className="mt-4">
                        <Link
                          href={`/restaurants/${r.restaurant_id}`}
                          className="inline-flex items-center gap-1 font-medium text-orange-500 transition hover:text-orange-600 hover:underline"
                        >
                          ไปหน้าร้าน {r.restaurant_name} →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}