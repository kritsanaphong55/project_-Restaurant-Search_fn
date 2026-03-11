// app/map/MapClient.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Map as LeafletMap, Marker } from "leaflet";
import {
  MapPinned,
  Search,
  Filter,
  HandPlatter,
  Wallet,
  Clock3,
  Star,
  MapPin,
  Navigation,
  X,
  LocateFixed,
  Store,
  RefreshCw,
} from "lucide-react";
import { apiFetch } from "@/src/lib/api";

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

type RestaurantFoodType = {
  foodtype_id: number;
  foodtype_name: string;
};

type Restaurant = {
  restaurant_id: number;
  restaurant_name: string;
  latitude: number | string | null;
  longitude: number | string | null;
  price_min: number;
  price_max: number;
  avg_rating?: number;
  review_count?: number;
  food_types?: RestaurantFoodType[] | null;
  open_time?: string | null;
  close_time?: string | null;
  is_open_now?: number;
};

type RestaurantWithCoords = {
  restaurant_id: number;
  restaurant_name: string;
  latitude: number;
  longitude: number;
  price_min: number;
  price_max: number;
  avg_rating?: number;
  review_count?: number;
  food_types?: RestaurantFoodType[] | null;
  open_time?: string | null;
  close_time?: string | null;
  is_open_now?: number;
  distance?: number;
};

type ApiResponse<T> = {
  data?: T;
  message?: string;
};

const defaultCenter: [number, number] = [8.6373, 99.8987];

function toFiniteNumber(value: unknown): number | null {
  const num = typeof value === "number" ? value : Number(value);
  return Number.isFinite(num) ? num : null;
}

function foodTypesLabel(foodTypes?: RestaurantFoodType[] | null): string {
  if (!Array.isArray(foodTypes) || foodTypes.length === 0) return "-";
  return foodTypes.map((ft) => ft.foodtype_name).join(", ");
}

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function calcDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function distanceLabel(km?: number): string {
  if (km === undefined) return "";
  if (km < 1) return `${Math.round(km * 1000)} ม.`;
  return `${km.toFixed(1)} กม.`;
}

export default function MapClient() {
  const [items, setItems] = useState<Restaurant[]>([]);
  const [foodTypes, setFoodTypes] = useState<FoodType[]>([]);
  const [priceOptions, setPriceOptions] = useState<PriceOption[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [q, setQ] = useState("");
  const [foodtypeId, setFoodtypeId] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [openNow, setOpenNow] = useState(false);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  const mapRef = useRef<LeafletMap | null>(null);
  const mapDivRef = useRef<HTMLDivElement | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const markersRef = useRef<Record<number, Marker>>({});
  const userMarkerRef = useRef<Marker | null>(null);

  const loadFoodTypes = useCallback(async () => {
    try {
      const res = (await apiFetch("/api/categories")) as ApiResponse<FoodType[]>;
      setFoodTypes(Array.isArray(res.data) ? res.data : []);
    } catch {
      setFoodTypes([]);
    }
  }, []);

  const loadPriceOptions = useCallback(async (selectedFoodtypeId?: string) => {
    try {
      const path = selectedFoodtypeId
        ? `/api/restaurants/price-options?foodtype_id=${selectedFoodtypeId}`
        : "/api/restaurants/price-options";

      const res = (await apiFetch(path)) as ApiResponse<PriceOption[]>;
      setPriceOptions(Array.isArray(res.data) ? res.data : []);
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
          : "/api/restaurants/map";

      const res = (await apiFetch(path)) as ApiResponse<Restaurant[]>;
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "โหลดข้อมูลแผนที่ไม่สำเร็จ");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [q, foodtypeId, priceRange, openNow]);

  useEffect(() => {
    void loadFoodTypes();
  }, [loadFoodTypes]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void loadPriceOptions(foodtypeId);
    setPriceRange("");
  }, [foodtypeId, loadPriceOptions]);

  const validItems = useMemo(() => {
    const list = items.flatMap((r) => {
      const lat = toFiniteNumber(r.latitude);
      const lng = toFiniteNumber(r.longitude);

      if (lat === null || lng === null) return [];

      const distance = userLocation
        ? calcDistance(userLocation.lat, userLocation.lng, lat, lng)
        : undefined;

      const item: RestaurantWithCoords = {
        restaurant_id: r.restaurant_id,
        restaurant_name: r.restaurant_name,
        latitude: lat,
        longitude: lng,
        price_min: r.price_min,
        price_max: r.price_max,
        avg_rating: r.avg_rating,
        review_count: r.review_count,
        food_types: r.food_types,
        open_time: r.open_time,
        close_time: r.close_time,
        is_open_now: r.is_open_now,
        distance,
      };

      return [item];
    });

    if (userLocation) {
      list.sort((a, b) => (a.distance ?? 999999) - (b.distance ?? 999999));
    }

    return list;
  }, [items, userLocation]);

  const clearAllRestaurantMarkers = () => {
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Browser ไม่รองรับ Geolocation");
      return;
    }

    setLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        setUserLocation({ lat, lng });
        setLocating(false);

        const L = leafletRef.current;
        const map = mapRef.current;
        if (!L || !map) return;

        if (userMarkerRef.current) {
          userMarkerRef.current.remove();
          userMarkerRef.current = null;
        }

        const userIcon = L.divIcon({
          html: `
            <div style="
              width:20px;
              height:20px;
              background:#f97316;
              border:3px solid white;
              border-radius:999px;
              box-shadow:0 0 8px rgba(0,0,0,0.25);
            "></div>
          `,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
          className: "",
        });

        userMarkerRef.current = L.marker([lat, lng], { icon: userIcon })
          .addTo(map)
          .bindPopup("ตำแหน่งของคุณ")
          .openPopup();

        map.setView([lat, lng], 14);

        setTimeout(() => {
          map.invalidateSize();
        }, 200);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLocationError("ไม่สามารถขอตำแหน่งได้ กรุณาอนุญาต Location");
        setLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  useEffect(() => {
    let cancelled = false;

    const initMap = async () => {
      if (!mapDivRef.current || mapRef.current) return;

      try {
        const L = await import("leaflet");
        if (cancelled || !mapDivRef.current || mapRef.current) return;

        leafletRef.current = L;

        delete (L.Icon.Default.prototype as L.Icon.Default & { _getIconUrl?: string })._getIconUrl;

        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });

        const map = L.map(mapDivRef.current, {
          center: defaultCenter,
          zoom: 13,
          zoomControl: true,
          preferCanvas: true,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
        }).addTo(map);

        mapRef.current = map;

        setTimeout(() => {
          map.invalidateSize();
        }, 300);
      } catch (error) {
        console.error("Leaflet init error:", error);
        setMsg("ไม่สามารถโหลดแผนที่ได้");
      }
    };

    void initMap();

    return () => {
      cancelled = true;
      clearAllRestaurantMarkers();

      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;

    if (!L || !map) return;

    clearAllRestaurantMarkers();

    validItems.forEach((r) => {
      const distText =
        r.distance !== undefined
          ? `<div style="margin-top:6px;color:#f97316;font-weight:600">ห่าง ${distanceLabel(
              r.distance
            )}</div>`
          : "";

      const popupHtml = `
        <div style="min-width:220px;font-family:sans-serif">
          <div style="font-size:15px;font-weight:700;color:#1f2937;">
            ${escapeHtml(r.restaurant_name)}
          </div>
          <div style="margin-top:6px;color:#555;font-size:13px;">
            ประเภทอาหาร: ${escapeHtml(foodTypesLabel(r.food_types))}
          </div>
          <div style="margin-top:4px;color:#555;font-size:13px;">
            ราคา: ${r.price_min} - ${r.price_max} บาท
          </div>
          <div style="margin-top:4px;color:#555;font-size:13px;">
            เวลา: ${escapeHtml(r.open_time || "-")} - ${escapeHtml(r.close_time || "-")}
          </div>
          <div style="margin-top:4px;font-size:13px;">
            สถานะ:
            <b style="color:${r.is_open_now ? "#16a34a" : "#9ca3af"}">
              ${r.is_open_now ? " เปิดอยู่" : " ปิดอยู่"}
            </b>
          </div>
          ${distText}
          <div style="margin-top:10px">
            <a href="/restaurants/${r.restaurant_id}" style="color:#f97316;font-weight:600;font-size:13px">
              ดูรายละเอียดร้าน →
            </a>
          </div>
        </div>
      `;

      const marker = L.marker([r.latitude, r.longitude]);
      marker
        .addTo(map)
        .bindPopup(popupHtml)
        .on("click", () => setSelectedId(r.restaurant_id));

      markersRef.current[r.restaurant_id] = marker;
    });

    if (validItems.length > 0) {
      const points: [number, number][] = validItems.map((r) => [r.latitude, r.longitude]);

      if (userLocation) {
        points.push([userLocation.lat, userLocation.lng]);
      }

      map.fitBounds(L.latLngBounds(points), { padding: [40, 40] });
    } else if (userLocation) {
      map.setView([userLocation.lat, userLocation.lng], 14);
    } else {
      map.setView(defaultCenter, 13);
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 250);
  }, [validItems, userLocation]);

  const focusRestaurant = (r: RestaurantWithCoords) => {
    setSelectedId(r.restaurant_id);

    const map = mapRef.current;
    if (!map) return;

    map.setView([r.latitude, r.longitude], 16);

    const marker = markersRef.current[r.restaurant_id];
    if (marker) marker.openPopup();

    setTimeout(() => {
      map.invalidateSize();
    }, 150);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-white">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 rounded-3xl bg-gradient-to-r from-orange-500 to-orange-400 px-6 py-6 text-white shadow-lg">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                <MapPinned className="h-7 w-7" />
              </div>

              <div>
                <h1 className="text-3xl font-bold leading-tight">แผนที่ร้านอาหาร</h1>
                <p className="mt-1 text-sm text-orange-50">
                  ค้นหาร้านอาหารใกล้คุณในพื้นที่ถนนวลัยลักษณ์
                </p>
                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs text-white/90">
                  <MapPin className="h-3.5 w-3.5" />
                  ระบบแสดงตำแหน่งร้านอาหารบนแผนที่
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void load()}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-orange-600 shadow-sm transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              รีเฟรช
            </button>
          </div>
        </div>

        <div className="mb-5 rounded-3xl border border-orange-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#1F2937]">
            <Filter className="h-4 w-4 text-orange-500" />
            ตัวกรองการค้นหา
          </div>

          <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="ค้นหาชื่อร้าน..."
                onKeyDown={(e) => e.key === "Enter" && void load()}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-800 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
              />
            </div>

            <button
              type="button"
              onClick={() => void load()}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
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
                className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-700 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
              >
                <option value="">ทุกประเภท</option>
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
                className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-700 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
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

          <div className="flex flex-wrap items-center gap-4">
            <label className="inline-flex items-center gap-3 select-none">
              <button
                type="button"
                onClick={() => setOpenNow((v) => !v)}
                className={`relative h-6 w-11 rounded-full transition ${
                  openNow ? "bg-orange-500" : "bg-gray-200"
                }`}
                aria-pressed={openNow}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
                    openNow ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
              <span className="text-sm font-medium text-gray-700">เปิดอยู่ตอนนี้</span>
            </label>

            <button
              type="button"
              onClick={getLocation}
              disabled={locating}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-60 ${
                userLocation
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-orange-400 hover:bg-orange-500"
              }`}
            >
              {locating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  กำลังค้นหาตำแหน่ง...
                </>
              ) : userLocation ? (
                <>
                  <LocateFixed className="h-4 w-4" />
                  ใช้ตำแหน่งของฉันแล้ว
                </>
              ) : (
                <>
                  <Navigation className="h-4 w-4" />
                  ใช้ตำแหน่งของฉัน
                </>
              )}
            </button>

            {userLocation && (
              <button
                type="button"
                onClick={() => {
                  setUserLocation(null);
                  setLocationError(null);

                  if (userMarkerRef.current) {
                    userMarkerRef.current.remove();
                    userMarkerRef.current = null;
                  }

                  if (mapRef.current) {
                    mapRef.current.setView(defaultCenter, 13);
                    setTimeout(() => {
                      mapRef.current?.invalidateSize();
                    }, 150);
                  }
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-500 transition hover:border-orange-400 hover:text-orange-500"
              >
                <X className="h-4 w-4" />
                ยกเลิกตำแหน่ง
              </button>
            )}
          </div>
        </div>

        {locationError && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {locationError}
          </div>
        )}

        {msg && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {msg}
          </div>
        )}

        {loading && (
          <div className="mb-4 flex items-center gap-2 rounded-2xl border border-orange-100 bg-white px-4 py-3 text-sm text-gray-500">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-orange-400 border-t-transparent" />
            กำลังโหลดข้อมูลแผนที่...
          </div>
        )}

        <div className="mb-6 overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm">
          <div ref={mapDivRef} className="h-[520px] w-full" />
        </div>

        <div className="mb-4 text-sm text-gray-500">
          จำนวนร้านที่ตรงเงื่อนไข:{" "}
          <span className="font-semibold text-orange-500">{validItems.length}</span>
          {userLocation && (
            <span className="ml-2 font-medium text-green-600">(เรียงจากใกล้ไปไกล)</span>
          )}
        </div>

        {validItems.length === 0 && !loading && (
          <div className="rounded-3xl border border-dashed border-orange-200 bg-white py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
              <MapPinned className="h-8 w-8" />
            </div>
            <h2 className="text-lg font-semibold text-[#1F2937]">
              ไม่พบร้านที่มีพิกัดใช้งานได้
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              ลองเปลี่ยนเงื่อนไขการค้นหา หรือเลือกตำแหน่งของคุณใหม่
            </p>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {validItems.map((r) => (
            <div
              key={r.restaurant_id}
              onClick={() => focusRestaurant(r)}
              className={`cursor-pointer rounded-3xl border p-4 shadow-sm transition-all duration-200 hover:shadow-md ${
                selectedId === r.restaurant_id
                  ? "border-orange-400 bg-orange-50 shadow-md"
                  : "border-gray-100 bg-white hover:border-orange-200"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-500">
                      <Store className="h-5 w-5" />
                    </div>
                    <div
                      className={`text-lg font-bold ${
                        selectedId === r.restaurant_id ? "text-orange-500" : "text-gray-900"
                      }`}
                    >
                      {r.restaurant_name}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {r.distance !== undefined && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-600">
                      <Navigation className="h-3.5 w-3.5" />
                      {distanceLabel(r.distance)}
                    </span>
                  )}

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      r.is_open_now ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {r.is_open_now ? "● เปิดอยู่" : "● ปิดอยู่"}
                  </span>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                <span className="inline-flex items-center gap-1">
                  <HandPlatter className="h-4 w-4 text-orange-400" />
                  {foodTypesLabel(r.food_types)}
                </span>
              </div>

              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500">
                <span className="inline-flex items-center gap-1.5">
                  <Wallet className="h-4 w-4 text-orange-400" />
                  {r.price_min} - {r.price_max} บาท
                </span>

                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="h-4 w-4 text-orange-400" />
                  {r.open_time || "-"} - {r.close_time || "-"}
                </span>
              </div>

              {r.avg_rating !== undefined && (
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <span className="inline-flex items-center gap-1 font-semibold text-orange-500">
                    <Star className="h-4 w-4 fill-orange-400 text-orange-400" />
                    {Number(r.avg_rating).toFixed(1)}
                  </span>
                  <span className="text-gray-400">({r.review_count ?? 0} รีวิว)</span>
                </div>
              )}

              <div className="mt-4">
                <Link
                  href={`/restaurants/${r.restaurant_id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-sm font-semibold text-orange-500 transition hover:text-orange-600"
                >
                  ดูรายละเอียดร้าน →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}