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
  Plus,
  LocateFixed,
  RefreshCw,
} from "lucide-react";
import { apiFetch } from "@/src/lib/api";
import RequireAuth from "@/app/components/RequireAuth";

type FoodType = {
  foodtype_id: number;
  foodtype_name: string;
};

function toTimeWithSeconds(value: string) {
  if (!value) return "";
  return value.length === 5 ? `${value}:00` : value;
}

export default function NewRestaurantPage() {
  const router = useRouter();

  const [restaurant_name, setName] = useState("");
  const [description, setDesc] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLat] = useState("");
  const [longitude, setLng] = useState("");
  const [open_time, setOpen] = useState("09:00");
  const [close_time, setClose] = useState("20:00");
  const [price_min, setMin] = useState("0");
  const [price_max, setMax] = useState("0");
  const [foodtypeIds, setFoodtypeIds] = useState<number[]>([]);
  const [foodTypes, setFoodTypes] = useState<FoodType[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);

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

  // ✅ ขอตำแหน่งจาก GPS
  const getMyLocation = () => {
    if (!navigator.geolocation) {
      setMsg("Browser ไม่รองรับ Geolocation");
      return;
    }
    setLocating(true);
    setMsg(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
        setLocating(false);
      },
      () => {
        setMsg("ไม่สามารถขอตำแหน่งได้ กรุณาอนุญาต Location");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
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
          open_time: toTimeWithSeconds(open_time),
          close_time: toTimeWithSeconds(close_time),
          price_min: pMin,
          price_max: pMax,
          foodtype_ids: foodtypeIds,
        }),
      });

      const newId = res.restaurant_id;
      router.push(newId ? `/owner/${newId}/menu` : "/restaurants");
    } catch (err: unknown) {
      setMsg(err instanceof Error ? err.message : "เพิ่มร้านไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <RequireAuth allow={["OWNER"]}>
      <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-white">
        <div className="mx-auto max-w-2xl px-4 py-8">

          {/* Header */}
          <div className="mb-6 rounded-3xl bg-gradient-to-r from-orange-500 to-orange-400 px-6 py-5 text-white shadow-lg">
            <Link
              href="/owner"
              className="inline-flex items-center gap-1 text-sm text-white/90 transition hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
              กลับไป Owner Dashboard
            </Link>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20">
                <Plus className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-bold">เพิ่มร้านใหม่</h1>
            </div>
          </div>

          {msg && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {msg}
            </div>
          )}

          <form onSubmit={onSubmit} className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm">
            <div className="grid gap-4">

              {/* ชื่อร้าน + ที่อยู่ */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                    <Store className="h-4 w-4 text-orange-400" />
                    ชื่อร้าน *
                  </label>
                  <input
                    value={restaurant_name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ชื่อร้าน"
                    required
                    disabled={loading}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                    <MapPin className="h-4 w-4 text-orange-400" />
                    ที่อยู่ *
                  </label>
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="ที่อยู่ร้าน"
                    required
                    disabled={loading}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100 disabled:bg-gray-100"
                  />
                </div>
              </div>

              {/* รายละเอียด */}
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  <FileText className="h-4 w-4 text-orange-400" />
                  รายละเอียดร้าน
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="รายละเอียดร้าน"
                  rows={2}
                  disabled={loading}
                  className="w-full resize-y rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100 disabled:bg-gray-100"
                />
              </div>

              {/* ประเภทอาหาร */}
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  <HandPlatter className="h-4 w-4 text-orange-400" />
                  ประเภทอาหาร
                </label>
                {foodTypes.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-orange-200 bg-orange-50 px-3 py-2.5 text-sm text-gray-500">
                    กำลังโหลด...
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 rounded-xl border border-orange-100 bg-orange-50/50 p-3">
                    {foodTypes.map((ft) => {
                      const selected = foodtypeIds.includes(ft.foodtype_id);
                      return (
                        <label
                          key={ft.foodtype_id}
                          className={`inline-flex cursor-pointer select-none items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition ${
                            selected
                              ? "border border-orange-300 bg-orange-100 font-semibold text-orange-700"
                              : "border border-gray-200 bg-white text-gray-600 hover:border-orange-200 hover:text-orange-500"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleFoodtype(ft.foodtype_id)}
                            className="hidden"
                            disabled={loading}
                          />
                          {selected && <span>✓</span>}
                          {ft.foodtype_name}
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* พิกัด */}
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  <MapPin className="h-4 w-4 text-orange-400" />
                  พิกัดร้าน *
                </label>
                <div className="flex gap-2">
                  <input
                    value={latitude}
                    onChange={(e) => setLat(e.target.value)}
                    placeholder="Latitude"
                    required
                    disabled={loading || locating}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100 disabled:bg-gray-100"
                  />
                  <input
                    value={longitude}
                    onChange={(e) => setLng(e.target.value)}
                    placeholder="Longitude"
                    required
                    disabled={loading || locating}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100 disabled:bg-gray-100"
                  />
                  {/* ✅ ปุ่มใช้ตำแหน่งของฉัน */}
                  <button
                    type="button"
                    onClick={getMyLocation}
                    disabled={loading || locating}
                    title="ใช้ตำแหน่งของฉัน"
                    className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-orange-500 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-orange-300 cursor-pointer"
                  >
                    {locating
                      ? <RefreshCw className="h-4 w-4 animate-spin" />
                      : <LocateFixed className="h-4 w-4" />
                    }
                    <span className="hidden sm:inline whitespace-nowrap">
                      {locating ? "กำลังค้นหา..." : "ตำแหน่งของฉัน"}
                    </span>
                  </button>
                </div>
                {latitude && longitude && (
                  <p className="mt-1.5 text-xs text-green-600">
                    ✅ พิกัด: {latitude}, {longitude}
                  </p>
                )}
              </div>

              {/* เวลาทำการ */}
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  <Clock3 className="h-4 w-4 text-orange-400" />
                  เวลาทำการ *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">เวลาเปิด</label>
                    <input
                      type="time"
                      value={open_time}
                      onChange={(e) => setOpen(e.target.value)}
                      required
                      disabled={loading}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">เวลาปิด</label>
                    <input
                      type="time"
                      value={close_time}
                      onChange={(e) => setClose(e.target.value)}
                      required
                      disabled={loading}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100 disabled:bg-gray-100"
                    />
                  </div>
                </div>
              </div>

              {/* ช่วงราคา */}
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  <Wallet className="h-4 w-4 text-orange-400" />
                  ช่วงราคา (บาท)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    value={price_min}
                    onChange={(e) => setMin(e.target.value)}
                    placeholder="ราคาต่ำสุด"
                    type="number"
                    min={0}
                    disabled={loading}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100 disabled:bg-gray-100"
                  />
                  <input
                    value={price_max}
                    onChange={(e) => setMax(e.target.value)}
                    placeholder="ราคาสูงสุด"
                    type="number"
                    min={0}
                    disabled={loading}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100 disabled:bg-gray-100"
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-orange-300"
                >
                  <Save className="h-4 w-4" />
                  {loading ? "กำลังบันทึก..." : "บันทึกร้าน"}
                </button>
              </div>

            </div>
          </form>
        </div>
      </div>
    </RequireAuth>
  );
}