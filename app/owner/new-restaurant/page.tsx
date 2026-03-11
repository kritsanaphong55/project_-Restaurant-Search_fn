// app/owner/new-restaurant/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Store,
  MapPin,
  FileText,
  HandPlatter,
  Clock3,
  Wallet,
  Save,
  ShieldAlert,
  Plus,
} from "lucide-react";
import { apiFetch } from "@/src/lib/api";
import RequireAuth from "@/app/components/RequireAuth";

type FoodType = {
  foodtype_id: number;
  foodtype_name: string;
};

export default function NewRestaurantPage() {
  const router = useRouter();

  const [restaurant_name, setName] = useState("");
  const [description, setDesc] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLat] = useState("");
  const [longitude, setLng] = useState("");
  const [open_time, setOpen] = useState("09:00:00");
  const [close_time, setClose] = useState("20:00:00");
  const [price_min, setMin] = useState("0");
  const [price_max, setMax] = useState("0");
  const [foodtypeIds, setFoodtypeIds] = useState<number[]>([]);
  const [foodTypes, setFoodTypes] = useState<FoodType[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadFoodTypes = async () => {
      try {
        const res = await apiFetch("/api/categories");
        setFoodTypes(res.data || []);
      } catch (e: unknown) {
        console.error("โหลดประเภทอาหารไม่สำเร็จ:", e);
      }
    };

    void loadFoodTypes();
  }, []);

  const toggleFoodtype = (id: number) => {
    setFoodtypeIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMsg(null);

    const lat = Number(latitude);
    const lng = Number(longitude);
    const pMin = Number(price_min);
    const pMax = Number(price_max);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      setMsg("latitude / longitude ต้องเป็นตัวเลข");
      return;
    }

    if (pMin > pMax) {
      setMsg("ราคาต่ำสุดต้องไม่เกินราคาสูงสุด");
      return;
    }

    setLoading(true);

    try {
      const res = await apiFetch("/api/restaurants", {
        method: "POST",
        body: JSON.stringify({
          restaurant_name,
          description,
          address,
          latitude: lat,
          longitude: lng,
          open_time,
          close_time,
          price_min: pMin,
          price_max: pMax,
          foodtype_ids: foodtypeIds,
        }),
      });

      const newId = res.restaurant_id;
      if (newId) {
        router.push(`/owner/${newId}/menu`);
      } else {
        router.push("/restaurants");
      }
    } catch (err: unknown) {
      setMsg(err instanceof Error ? err.message : "เพิ่มร้านไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <RequireAuth allow={["OWNER"]}>
      <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-white">
        <div className="mx-auto max-w-4xl px-4 py-8">
          {/* Header */}
          <div className="mb-6 rounded-3xl bg-gradient-to-r from-orange-500 to-orange-400 px-6 py-6 text-white shadow-lg">
            <div className="flex flex-col gap-4">
              <div>
                <Link
                  href="/owner"
                  className="inline-flex items-center gap-1 text-sm text-white/90 transition hover:text-white"
                >
                  <ChevronLeft className="h-4 w-4" />
                  กลับไป Owner Dashboard
                </Link>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                  <Plus className="h-7 w-7" />
                </div>

                <div>
                  <h1 className="text-3xl font-bold leading-tight">
                    เพิ่มร้านใหม่
                  </h1>
                  <p className="mt-1 text-sm text-orange-50">
                    กรอกข้อมูลร้านอาหารเพื่อส่งเข้าสู่ระบบ
                  </p>
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs text-white/90">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    ร้านใหม่จะอยู่ในสถานะ PENDING รอ Admin อนุมัติก่อนแสดงในระบบ
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Message */}
          {msg && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {msg}
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={onSubmit}
            className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm"
          >
            <div className="grid gap-5">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Store className="h-4 w-4 text-orange-400" />
                  ชื่อร้าน *
                </label>
                <input
                  value={restaurant_name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ชื่อร้าน"
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                  <MapPin className="h-4 w-4 text-orange-400" />
                  ที่อยู่ *
                </label>
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="ที่อยู่ร้าน"
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                  <FileText className="h-4 w-4 text-orange-400" />
                  รายละเอียดร้าน
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="รายละเอียดร้าน"
                  rows={4}
                  disabled={loading}
                  className="w-full resize-y rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-700">
                  <HandPlatter className="h-4 w-4 text-orange-400" />
                  ประเภทอาหาร
                </label>

                {foodTypes.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50 px-4 py-4 text-sm text-gray-500">
                    กำลังโหลดประเภทอาหาร...
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3 rounded-2xl border border-orange-100 bg-orange-50/50 p-4">
                    {foodTypes.map((ft) => {
                      const selected = foodtypeIds.includes(ft.foodtype_id);

                      return (
                        <label
                          key={ft.foodtype_id}
                          className={`inline-flex cursor-pointer select-none items-center gap-2 rounded-full px-4 py-2 text-sm transition ${
                            selected
                              ? "border border-orange-300 bg-orange-100 font-medium text-orange-700"
                              : "border border-gray-200 bg-white text-gray-600 hover:border-orange-200 hover:text-orange-600"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleFoodtype(ft.foodtype_id)}
                            className="hidden"
                            disabled={loading}
                          />
                          {selected ? "✓" : ""}
                          {ft.foodtype_name}
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                  <MapPin className="h-4 w-4 text-orange-400" />
                  พิกัดร้าน *
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    value={latitude}
                    onChange={(e) => setLat(e.target.value)}
                    placeholder="latitude เช่น 8.6373"
                    required
                    disabled={loading}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                  />
                  <input
                    value={longitude}
                    onChange={(e) => setLng(e.target.value)}
                    placeholder="longitude เช่น 99.8987"
                    required
                    disabled={loading}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Clock3 className="h-4 w-4 text-orange-400" />
                  เวลาทำการ *
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    value={open_time}
                    onChange={(e) => setOpen(e.target.value)}
                    placeholder="เวลาเปิด เช่น 09:00:00"
                    required
                    disabled={loading}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                  />
                  <input
                    value={close_time}
                    onChange={(e) => setClose(e.target.value)}
                    placeholder="เวลาปิด เช่น 20:00:00"
                    required
                    disabled={loading}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Wallet className="h-4 w-4 text-orange-400" />
                  ช่วงราคา (บาท)
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    value={price_min}
                    onChange={(e) => setMin(e.target.value)}
                    placeholder="ราคาต่ำสุด"
                    type="number"
                    min={0}
                    disabled={loading}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                  />
                  <input
                    value={price_max}
                    onChange={(e) => setMax(e.target.value)}
                    placeholder="ราคาสูงสุด"
                    type="number"
                    min={0}
                    disabled={loading}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-orange-300"
                >
                  <Save className="h-4 w-4" />
                  {loading ? "กำลังบันทึก..." : "บันทึกร้าน (รอ Admin อนุมัติ)"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </RequireAuth>
  );
}