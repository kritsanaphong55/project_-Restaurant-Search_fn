"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Store,
  Plus,
  Pencil,
  Trash2,
  Eye,
  MapPin,
  HandPlatter,
  Clock3,
  Wallet,
  User,
  Save,
  X,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Ban,
  Clock4,
  FileText,
  Navigation,
  Loader2,
} from "lucide-react";
import RequireAuth from "@/app/components/RequireAuth";
import { apiFetch } from "@/src/lib/api";

type RestaurantStatus = "APPROVED" | "PENDING" | "REJECTED";

type Restaurant = {
  restaurant_id: number;
  restaurant_name: string;
  address: string;
  status: RestaurantStatus;
  price_min: number;
  price_max: number;
  latitude: number;
  longitude: number;
  description?: string | null;
  open_time?: string | null;
  close_time?: string | null;
  owner_id: number;
  food_types?: { foodtype_id: number; foodtype_name: string }[] | null;
  is_open_now?: number;
};

type OwnerOption = {
  user_id: number;
  username: string;
  full_name?: string | null;
  role: "ADMIN" | "OWNER" | "USER";
};

type FoodType = {
  foodtype_id: number;
  foodtype_name: string;
};

type FormState = {
  restaurant_name: string;
  address: string;
  latitude: string;
  longitude: string;
  price_min: string;
  price_max: string;
  owner_id: string;
  foodtype_ids: number[];
  status: RestaurantStatus;
  description: string;
  open_time: string;
  close_time: string;
};

function toInputTime(value?: string | null) {
  if (!value) return "";
  return String(value).slice(0, 5);
}

function toTimeWithSeconds(value: string) {
  if (!value) return "";
  return value.length === 5 ? `${value}:00` : value;
}

const defaultForm: FormState = {
  restaurant_name: "",
  address: "",
  latitude: "",
  longitude: "",
  price_min: "0",
  price_max: "0",
  owner_id: "",
  foodtype_ids: [],
  status: "APPROVED",
  description: "",
  open_time: "08:00",
  close_time: "22:00",
};

const STATUS_LABELS: Record<RestaurantStatus, string> = {
  APPROVED: "อนุมัติแล้ว",
  PENDING: "รออนุมัติ",
  REJECTED: "ไม่อนุมัติ",
};

function StatusBadge({ status }: { status: RestaurantStatus }) {
  if (status === "APPROVED") {
    return (
      <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
        {STATUS_LABELS.APPROVED}
      </span>
    );
  }

  if (status === "REJECTED") {
    return (
      <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
        {STATUS_LABELS.REJECTED}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
      {STATUS_LABELS.PENDING}
    </span>
  );
}

export default function AdminRestaurantsPage() {
  const [items, setItems] = useState<Restaurant[]>([]);
  const [owners, setOwners] = useState<OwnerOption[]>([]);
  const [foodTypes, setFoodTypes] = useState<FoodType[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingForm, setLoadingForm] = useState(false);
  const [locating, setLocating] = useState(false);

  const [form, setForm] = useState<FormState>(defaultForm);
  const [editingId, setEditingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setMsg(null);
    setLoadingList(true);

    try {
      const [approvedRes, pendingRes, rejectedRes, usersRes, ftRes] =
        await Promise.all([
          apiFetch("/api/restaurants?status=APPROVED"),
          apiFetch("/api/restaurants?status=PENDING"),
          apiFetch("/api/restaurants?status=REJECTED"),
          apiFetch("/api/users"),
          apiFetch("/api/categories"),
        ]);

      const merged: Restaurant[] = [
        ...(approvedRes.data || []),
        ...(pendingRes.data || []),
        ...(rejectedRes.data || []),
      ];

      const unique = Array.from(
        new Map(merged.map((r) => [r.restaurant_id, r])).values()
      ) as Restaurant[];

      unique.sort((a, b) => b.restaurant_id - a.restaurant_id);
      setItems(unique);

      setOwners(
        (usersRes.data || []).filter((u: OwnerOption) => u.role === "OWNER")
      );

      setFoodTypes(ftRes.data || []);
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const updateForm = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleFoodType = (id: number) => {
    setForm((prev) => ({
      ...prev,
      foodtype_ids: prev.foodtype_ids.includes(id)
        ? prev.foodtype_ids.filter((x) => x !== id)
        : [...prev.foodtype_ids, id],
    }));
  };

  const resetForm = () => {
    setForm(defaultForm);
    setEditingId(null);
    setMsg(null);
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setMsg("เบราว์เซอร์ไม่รองรับการระบุตำแหน่ง");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev) => ({
          ...prev,
          latitude: String(pos.coords.latitude),
          longitude: String(pos.coords.longitude),
        }));
        setLocating(false);
      },
      () => {
        setMsg("ไม่สามารถดึงตำแหน่งได้ กรุณาอนุญาตการเข้าถึงตำแหน่ง");
        setLocating(false);
      }
    );
  };

  const startEdit = (r: Restaurant) => {
    setEditingId(r.restaurant_id);
    setForm({
      restaurant_name: r.restaurant_name || "",
      address: r.address || "",
      latitude: String(r.latitude ?? ""),
      longitude: String(r.longitude ?? ""),
      price_min: String(r.price_min ?? 0),
      price_max: String(r.price_max ?? 0),
      owner_id: String(r.owner_id ?? ""),
      foodtype_ids: Array.isArray(r.food_types)
        ? r.food_types.map((ft) => ft.foodtype_id)
        : [],
      status: r.status || "APPROVED",
      description: r.description || "",
      open_time: toInputTime(r.open_time) || "08:00",
      close_time: toInputTime(r.close_time) || "22:00",
    });

    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMsg(null);
    setLoadingForm(true);

    try {
      const payload = {
        restaurant_name: form.restaurant_name.trim(),
        address: form.address.trim(),
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        price_min: Number(form.price_min),
        price_max: Number(form.price_max),
        owner_id: Number(form.owner_id),
        foodtype_ids: form.foodtype_ids,
        status: form.status,
        description: form.description.trim() || null,
        open_time: toTimeWithSeconds(form.open_time),
        close_time: toTimeWithSeconds(form.close_time),
      };

      if (editingId !== null) {
        await apiFetch(`/api/restaurants/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        setMsg("✅ แก้ไขร้านสำเร็จ");
      } else {
        await apiFetch("/api/restaurants/admin", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setMsg("✅ เพิ่มร้านสำเร็จ");
      }

      resetForm();
      await load();
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "บันทึกข้อมูลไม่สำเร็จ");
    } finally {
      setLoadingForm(false);
    }
  };

  const removeRestaurant = async (id: number) => {
    if (!confirm("ลบร้านนี้ออกจากระบบ?")) return;

    setMsg(null);
    setLoadingList(true);

    try {
      await apiFetch(`/api/restaurants/${id}`, { method: "DELETE" });
      await load();
      setMsg("✅ ลบร้านสำเร็จ");
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "ลบร้านไม่สำเร็จ");
    } finally {
      setLoadingList(false);
    }
  };

  const ownerLabel = (ownerId: number) => {
    const owner = owners.find((o) => o.user_id === ownerId);
    if (!owner) return `#${ownerId}`;
    return owner.full_name
      ? `${owner.full_name} (${owner.username})`
      : owner.username;
  };

  const summary = useMemo(() => {
    return {
      total: items.length,
      approved: items.filter((r) => r.status === "APPROVED").length,
      pending: items.filter((r) => r.status === "PENDING").length,
      rejected: items.filter((r) => r.status === "REJECTED").length,
    };
  }, [items]);

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100";
  const labelClass = "block text-xs font-medium text-gray-500 mb-1";

  return (
    <RequireAuth allow={["ADMIN"]}>
      <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-white">
        <div className="mx-auto max-w-5xl px-4 py-8">

          {/* Header */}
          <div className="mb-6 rounded-3xl bg-gradient-to-r from-orange-500 to-orange-400 px-6 py-5 text-white shadow-lg">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                <Store className="h-6 w-6" />
              </div>
              <div>
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1 text-xs text-white/80 transition hover:text-white"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  กลับ Admin Dashboard
                </Link>
                <h1 className="text-2xl font-bold leading-tight">จัดการร้านอาหาร</h1>
                <div className="mt-1 inline-flex items-center gap-1.5 text-xs text-orange-100">
                  <ShieldCheck className="h-3 w-3" />
                  Admin Panel
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "ทั้งหมด", value: summary.total, icon: Store, color: "orange" },
              { label: STATUS_LABELS.APPROVED, value: summary.approved, icon: CheckCircle2, color: "green" },
              { label: STATUS_LABELS.PENDING, value: summary.pending, icon: Clock4, color: "amber" },
              { label: STATUS_LABELS.REJECTED, value: summary.rejected, icon: Ban, color: "red" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className={`rounded-2xl border border-${color}-100 bg-white p-3.5 shadow-sm`}>
                <div className="flex items-center gap-2.5">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-${color}-100 text-${color}-600`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">{label}</div>
                    <div className="text-lg font-bold text-gray-800">{value}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Message */}
          {msg && (
            <div
              className={`mb-4 rounded-2xl border px-4 py-3 text-sm ${
                msg.includes("สำเร็จ")
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-red-200 bg-red-50 text-red-600"
              }`}
            >
              {msg}
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={submitForm}
            className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm mb-6"
          >
            {/* Form title */}
            <div className="mb-4 flex items-center gap-2 text-base font-bold text-gray-800">
              {editingId !== null ? (
                <><Pencil className="h-4 w-4 text-orange-500" />แก้ไขร้าน #{editingId}</>
              ) : (
                <><Plus className="h-4 w-4 text-orange-500" />เพิ่มร้านใหม่</>
              )}
            </div>

            {/* Row 1: ชื่อร้าน + ที่อยู่ */}
            <div className="grid gap-3 sm:grid-cols-2 mb-3">
              <div>
                <label className={labelClass}>ชื่อร้าน *</label>
                <input
                  value={form.restaurant_name}
                  onChange={(e) => updateForm("restaurant_name", e.target.value)}
                  placeholder="กรอกชื่อร้าน"
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>ที่อยู่ *</label>
                <input
                  value={form.address}
                  onChange={(e) => updateForm("address", e.target.value)}
                  placeholder="กรอกที่อยู่"
                  required
                  className={inputClass}
                />
              </div>
            </div>

            {/* Row 2: พิกัด */}
            <div className="mb-3 rounded-2xl border border-blue-100 bg-blue-50/50 p-3">
              <div className="mb-2 flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-blue-700">
                  <MapPin className="h-3.5 w-3.5" />
                  พิกัดร้าน
                </label>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={locating}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {locating ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Navigation className="h-3 w-3" />
                  )}
                  {locating ? "กำลังระบุ..." : "ใช้ตำแหน่งปัจจุบัน"}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={labelClass}>Latitude *</label>
                  <input
                    value={form.latitude}
                    onChange={(e) => updateForm("latitude", e.target.value)}
                    placeholder="เช่น 13.7563"
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Longitude *</label>
                  <input
                    value={form.longitude}
                    onChange={(e) => updateForm("longitude", e.target.value)}
                    placeholder="เช่น 100.5018"
                    required
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Row 3: ราคา + Owner + สถานะ */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-3">
              <div>
                <label className={labelClass}>ราคาต่ำสุด (บาท)</label>
                <input
                  value={form.price_min}
                  onChange={(e) => updateForm("price_min", e.target.value)}
                  type="number"
                  min="0"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>ราคาสูงสุด (บาท)</label>
                <input
                  value={form.price_max}
                  onChange={(e) => updateForm("price_max", e.target.value)}
                  type="number"
                  min="0"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>เจ้าของร้าน *</label>
                <select
                  value={form.owner_id}
                  onChange={(e) => updateForm("owner_id", e.target.value)}
                  required
                  className={inputClass}
                >
                  <option value="">เลือก Owner</option>
                  {owners.map((owner) => (
                    <option key={owner.user_id} value={owner.user_id}>
                      {owner.full_name ? `${owner.full_name} (${owner.username})` : owner.username}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>สถานะ</label>
                <select
                  value={form.status}
                  onChange={(e) => updateForm("status", e.target.value as RestaurantStatus)}
                  className={inputClass}
                >
                  <option value="APPROVED">{STATUS_LABELS.APPROVED}</option>
                  <option value="PENDING">{STATUS_LABELS.PENDING}</option>
                  <option value="REJECTED">{STATUS_LABELS.REJECTED}</option>
                </select>
              </div>
            </div>

            {/* Row 4: เวลา */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className={labelClass}>เวลาเปิด</label>
                <input
                  type="time"
                  value={form.open_time}
                  onChange={(e) => updateForm("open_time", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>เวลาปิด</label>
                <input
                  type="time"
                  value={form.close_time}
                  onChange={(e) => updateForm("close_time", e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Food types */}
            <div className="mb-3">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                <HandPlatter className="h-3.5 w-3.5 text-orange-400" />
                ประเภทอาหาร
              </div>
              <div className="flex flex-wrap gap-2 rounded-xl border border-orange-100 bg-orange-50/40 p-3">
                {foodTypes.map((ft) => {
                  const selected = form.foodtype_ids.includes(ft.foodtype_id);
                  return (
                    <label
                      key={ft.foodtype_id}
                      className={`inline-flex cursor-pointer select-none items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                        selected
                          ? "border border-orange-300 bg-orange-100 text-orange-700"
                          : "border border-gray-200 bg-white text-gray-500 hover:border-orange-200 hover:text-orange-600"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleFoodType(ft.foodtype_id)}
                        className="hidden"
                      />
                      {selected && <span className="text-orange-500">✓</span>}
                      {ft.foodtype_name}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                <FileText className="h-3.5 w-3.5 text-orange-400" />
                รายละเอียดร้าน
              </label>
              <textarea
                value={form.description}
                onChange={(e) => updateForm("description", e.target.value)}
                placeholder="รายละเอียดร้าน (ไม่บังคับ)"
                rows={2}
                className={`${inputClass} resize-none`}
              />
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={loadingForm}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition disabled:opacity-60 ${
                  editingId !== null
                    ? "bg-orange-500 hover:bg-orange-600"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {editingId !== null ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {loadingForm ? "กำลังบันทึก..." : editingId !== null ? "บันทึกการแก้ไข" : "เพิ่มร้าน"}
              </button>

              {editingId !== null && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:border-orange-300 hover:text-orange-600"
                >
                  <X className="h-4 w-4" />
                  ยกเลิก
                </button>
              )}
            </div>
          </form>

          {/* Loading */}
          {loadingList && (
            <div className="mb-4 flex items-center gap-2 rounded-2xl border border-orange-100 bg-white px-4 py-3 text-sm text-gray-500">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-orange-400 border-t-transparent" />
              กำลังโหลดข้อมูล...
            </div>
          )}

          {/* List */}
          <div className="grid gap-4">
            {items.map((r) => (
              <div
                key={r.restaurant_id}
                className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-orange-200 hover:shadow-md"
              >
                <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold text-gray-800">{r.restaurant_name}</h2>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-400">
                      #{r.restaurant_id}
                    </span>
                  </div>
                  <StatusBadge status={r.status} />
                </div>

                <div className="grid gap-1.5 text-sm text-gray-500">
                  <div className="inline-flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" />
                    <span>{r.address}</span>
                  </div>
                  <div className="inline-flex items-start gap-2">
                    <HandPlatter className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" />
                    <span>
                      {Array.isArray(r.food_types) && r.food_types.length > 0
                        ? r.food_types.map((ft) => ft.foodtype_name).join(", ")
                        : "-"}
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-2">
                    <Clock3 className="h-4 w-4 shrink-0 text-orange-400" />
                    <span>
                      {r.open_time || "-"} - {r.close_time || "-"}{" "}
                      <span className={`font-semibold ${r.is_open_now ? "text-green-600" : "text-red-500"}`}>
                        {r.is_open_now ? "• เปิดอยู่" : "• ปิดอยู่"}
                      </span>
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-2">
                    <Wallet className="h-4 w-4 shrink-0 text-orange-400" />
                    <span>{r.price_min} - {r.price_max} บาท</span>
                  </div>
                  <div className="inline-flex items-center gap-2">
                    <User className="h-4 w-4 shrink-0 text-orange-400" />
                    <span>Owner: {ownerLabel(r.owner_id)}</span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => startEdit(r)}
                    disabled={loadingList}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-medium text-gray-700 transition hover:border-orange-300 hover:text-orange-600 disabled:opacity-60"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    แก้ไข
                  </button>

                  <button
                    onClick={() => void removeRestaurant(r.restaurant_id)}
                    disabled={loadingList}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-medium text-red-600 transition hover:bg-red-100 disabled:opacity-60"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    ลบ
                  </button>

                  <Link
                    href={`/restaurants/${r.restaurant_id}?back=/admin/restaurants`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-orange-200 bg-orange-50 px-3.5 py-2 text-xs font-medium text-orange-600 transition hover:bg-orange-100"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    ดูหน้าร้าน
                  </Link>
                </div>

                {r.status === "PENDING" && (
                  <div className="mt-3 inline-flex w-full items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-700">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    ร้านนี้ยังรอการอนุมัติจากระบบ
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