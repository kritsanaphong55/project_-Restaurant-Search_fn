// app/restaurants/page.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  UtensilsCrossed,
  Filter,
  HandPlatter,
  Wallet,
  Clock3,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { apiFetch } from "@/src/lib/api";
import RequireAuth from "@/app/components/RequireAuth";

type FoodType = {
  foodtype_id: number;
  foodtype_name: string;
};

type PriceOption = {
  value: string;
  label: string;
  price_min: number;
  price_max: number;
};

type Restaurant = {
  restaurant_id: number;
  restaurant_name: string;
  price_min: number;
  price_max: number;
  avg_rating?: number;
  review_count?: number;
  cover_image?: string | null;
  food_types?: FoodType[] | null;
  open_time?: string | null;
  close_time?: string | null;
  is_open_now?: number;
};

function foodTypesLabel(food_types?: FoodType[] | null): string {
  if (!Array.isArray(food_types) || food_types.length === 0) return "-";
  return food_types.map((ft) => ft.foodtype_name).join(", ");
}

const PAGE_SIZE = 6;

export default function RestaurantsPage() {
  const [items, setItems] = useState<Restaurant[]>([]);
  const [foodTypes, setFoodTypes] = useState<FoodType[]>([]);
  const [priceOptions, setPriceOptions] = useState<PriceOption[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [q, setQ] = useState("");
  const [foodtypeId, setFoodtypeId] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [openNow, setOpenNow] = useState(false);
  const [page, setPage] = useState(1);

  const loadFoodTypes = useCallback(async () => {
    try {
      const res = await apiFetch("/api/categories");
      setFoodTypes(res.data || []);
    } catch (e: unknown) {
      console.error("โหลดประเภทอาหารไม่สำเร็จ:", e);
    }
  }, []);

  const loadPriceOptions = useCallback(async (selectedFoodtypeId?: string) => {
    try {
      const path = selectedFoodtypeId
        ? `/api/restaurants/price-options?foodtype_id=${selectedFoodtypeId}`
        : "/api/restaurants/price-options";
      const res = await apiFetch(path);
      setPriceOptions(res.data || []);
    } catch {
      setPriceOptions([]);
    }
  }, []);

  const load = useCallback(async () => {
    setMsg(null);
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.append("q", q.trim());
      if (foodtypeId) params.append("foodtype_id", foodtypeId);
      if (openNow) params.append("open_now", "1");
      if (priceRange) {
        const [min, max] = priceRange.split("-");
        if (min) params.append("min", min);
        if (max) params.append("max", max);
      }
      const path =
        params.toString().length > 0
          ? `/api/restaurants/search?${params.toString()}`
          : `/api/restaurants?status=APPROVED`;
      const res = await apiFetch(path);
      // ✅ เรียงตามคะแนนรีวิวจากมากไปน้อย
      const sorted = (res.data || []).sort(
        (a: Restaurant, b: Restaurant) =>
          Number(b.avg_rating || 0) - Number(a.avg_rating || 0)
      );
      setItems(sorted);
      setPage(1);
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "โหลดร้านไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, [q, foodtypeId, priceRange, openNow]);

  useEffect(() => { void loadFoodTypes(); }, [loadFoodTypes]);
  useEffect(() => { void loadPriceOptions(foodtypeId); setPriceRange(""); }, [foodtypeId, loadPriceOptions]);
  useEffect(() => { void load(); }, [load]);

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));

  const pagedItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return items.slice(start, start + PAGE_SIZE);
  }, [items, page]);

  return (
    <RequireAuth allow={["USER"]}>
      <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-white">
        <div className="mx-auto max-w-5xl px-4 py-8">

          {/* Header */}
          <div className="mb-8 rounded-3xl bg-gradient-to-r from-orange-500 to-orange-400 px-6 py-6 text-white shadow-lg">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                <UtensilsCrossed className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-3xl font-bold leading-tight">ค้นหาร้านอาหาร</h1>
                <p className="mt-1 text-sm text-orange-50">
                  ค้นหาร้านอาหารในพื้นที่ถนนวลัยลักษณ์
                </p>
              </div>
            </div>
          </div>

          {/* Filter card */}
          <div className="mb-6 rounded-3xl border border-orange-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#1F2937]">
              <Filter className="h-4 w-4 text-orange-500" />
              ตัวกรองการค้นหา
            </div>

            <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="ค้นหาชื่อร้าน..."
                  onKeyDown={(e) => e.key === "Enter" && void load()}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                />
              </div>
              <button
                onClick={() => void load()}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 cursor-pointer"
              >
                <Search className="h-4 w-4" />
                ค้นหา
              </button>
            </div>

            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="relative">
                <HandPlatter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <select
                  value={foodtypeId}
                  onChange={(e) => setFoodtypeId(e.target.value)}
                  className="w-full cursor-pointer appearance-none rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-700 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                >
                  <option value="">ทุกประเภทอาหาร</option>
                  {foodTypes.map((ft) => (
                    <option key={ft.foodtype_id} value={ft.foodtype_id}>
                      {ft.foodtype_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <Wallet className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full cursor-pointer appearance-none rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-700 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                >
                  <option value="">ทุกช่วงราคา</option>
                  {priceOptions.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <label className="inline-flex items-center gap-3 select-none">
              <button
                type="button"
                onClick={() => setOpenNow((v) => !v)}
                className={`relative h-6 w-11 rounded-full transition cursor-pointer ${
                  openNow ? "bg-orange-500" : "bg-gray-200"
                }`}
                aria-pressed={openNow}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
                  openNow ? "translate-x-5" : "translate-x-0.5"
                }`} />
              </button>
              <span className="text-sm font-medium text-gray-700">
                แสดงเฉพาะร้านที่เปิดอยู่ตอนนี้
              </span>
            </label>
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
              กำลังโหลดข้อมูลร้านอาหาร...
            </div>
          )}

          {/* Result count */}
          {!loading && (
            <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
              พบ <span className="font-semibold text-orange-500">{items.length}</span> ร้าน
              <span className="text-gray-400">• เรียงตามคะแนนรีวิว</span>
            </div>
          )}

          {/* Empty state */}
          {!loading && pagedItems.length === 0 && (
            <div className="rounded-3xl border border-dashed border-orange-200 bg-white py-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                <Search className="h-8 w-8" />
              </div>
              <h2 className="text-lg font-semibold text-[#1F2937]">ไม่พบร้านที่ตรงกับเงื่อนไข</h2>
              <p className="mt-2 text-sm text-gray-500">ลองเปลี่ยนคำค้นหา ประเภทอาหาร หรือช่วงราคาใหม่</p>
            </div>
          )}

          {/* Restaurant list */}
          <div className="flex flex-col gap-4">
            {pagedItems.map((r, index) => {
              const safeCover = r.cover_image?.trim();
              // ✅ badge อันดับ top 3
              const rankBadge =
                page === 1 && index < 3
                  ? ["🥇", "🥈", "🥉"][index]
                  : null;

              return (
                <Link
                  key={r.restaurant_id}
                  href={`/restaurants/${r.restaurant_id}`}
                  className="block"
                >
                  <div className="group flex gap-4 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm transition duration-200 hover:border-orange-200 hover:shadow-md">
                    {/* Cover image */}
                    {safeCover ? (
                      <div className="relative shrink-0">
                        <Image
                          src={safeCover}
                          alt={r.restaurant_name}
                          width={112}
                          height={92}
                          unoptimized
                          className="h-24 w-28 rounded-2xl border border-gray-100 object-cover"
                        />
                        {rankBadge && (
                          <span className="absolute -top-2 -left-2 text-xl">{rankBadge}</span>
                        )}
                      </div>
                    ) : (
                      <div className="relative flex h-24 w-28 shrink-0 items-center justify-center rounded-2xl border border-orange-100 bg-orange-50 text-orange-500">
                        <UtensilsCrossed className="h-8 w-8" />
                        {rankBadge && (
                          <span className="absolute -top-2 -left-2 text-xl">{rankBadge}</span>
                        )}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      {/* Name + status */}
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h2 className="text-lg font-bold leading-tight text-[#1F2937] transition group-hover:text-orange-500">
                            {r.restaurant_name}
                          </h2>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                            <span className="inline-flex items-center gap-1">
                              <HandPlatter className="h-4 w-4 text-orange-400" />
                              {foodTypesLabel(r.food_types)}
                            </span>
                          </div>
                        </div>
                        <span className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold ${
                          r.is_open_now ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                        }`}>
                          {r.is_open_now ? "● เปิดอยู่" : "● ปิดอยู่"}
                        </span>
                      </div>

                      {/* Rating */}
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                        <span className="inline-flex items-center gap-1 font-semibold text-orange-500">
                          <Star className="h-4 w-4 fill-orange-400 text-orange-400" />
                          {Number(r.avg_rating || 0).toFixed(1)}
                        </span>
                        <span className="text-gray-400">({r.review_count || 0} รีวิว)</span>
                      </div>

                      {/* Price + Time */}
                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500">
                        <span className="inline-flex items-center gap-1.5">
                          <Wallet className="h-4 w-4 text-orange-400" />
                          {r.price_min} – {r.price_max} บาท
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Clock3 className="h-4 w-4 text-orange-400" />
                          {r.open_time || "-"} – {r.close_time || "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-600 transition hover:border-orange-400 hover:text-orange-500 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
                ก่อนหน้า
              </button>
              <span className="px-2 text-sm text-gray-500">
                หน้า <span className="font-semibold text-[#1F2937]">{page}</span> / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-600 transition hover:border-orange-400 hover:text-orange-500 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
              >
                ถัดไป
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </RequireAuth>
  );
}