// app/admin/restaurants/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  RefreshCw,
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
  open_time: "08:00:00",
  close_time: "22:00:00",
};

function StatusBadge({ status }: { status: RestaurantStatus }) {
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

export default function AdminRestaurantsPage() {
  const [items, setItems] = useState<Restaurant[]>([]);
  const [owners, setOwners] = useState<OwnerOption[]>([]);
  const [foodTypes, setFoodTypes] = useState<FoodType[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingForm, setLoadingForm] = useState(false);

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
      open_time: r.open_time || "08:00:00",
      close_time: r.close_time || "22:00:00",
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
        open_time: form.open_time,
        close_time: form.close_time,
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

  return (
    <RequireAuth allow={["ADMIN"]}>
      <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-white">
        <div className="mx-auto max-w-6xl px-4 py-8">
          {/* Header */}
          <div className="mb-6 rounded-3xl bg-gradient-to-r from-orange-500 to-orange-400 px-6 py-6 text-white shadow-lg">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                  <Store className="h-7 w-7" />
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
                    จัดการร้านอาหาร
                  </h1>
                  <p className="mt-1 text-sm text-orange-50">
                    เพิ่ม แก้ไข และลบข้อมูลร้านอาหารในระบบ
                  </p>
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs text-white/90">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    ส่วนจัดการร้านอาหารสำหรับผู้ดูแลระบบ
                  </div>
                </div>
              </div>

              <button
                onClick={() => void load()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-orange-600 shadow-sm transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={loadingList}
              >
                <RefreshCw className={`h-4 w-4 ${loadingList ? "animate-spin" : ""}`} />
                รีเฟรช
              </button>
            </div>
          </div>

          {/* Summary */}
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
                  <div className="text-sm text-gray-500">APPROVED</div>
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
                  <div className="text-sm text-gray-500">PENDING</div>
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
                  <div className="text-sm text-gray-500">REJECTED</div>
                  <div className="text-xl font-bold text-[#1F2937]">
                    {summary.rejected}
                  </div>
                </div>
              </div>
            </div>
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
            className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm"
          >
            <div className="mb-5 flex items-center gap-2 text-lg font-bold text-[#1F2937]">
              {editingId !== null ? (
                <>
                  <Pencil className="h-5 w-5 text-orange-500" />
                  แก้ไขร้าน #{editingId}
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5 text-orange-500" />
                  เพิ่มร้านใหม่
                </>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <input
                value={form.restaurant_name}
                onChange={(e) => updateForm("restaurant_name", e.target.value)}
                placeholder="ชื่อร้าน *"
                required
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
              />

              <input
                value={form.address}
                onChange={(e) => updateForm("address", e.target.value)}
                placeholder="ที่อยู่ *"
                required
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
              />

              <input
                value={form.latitude}
                onChange={(e) => updateForm("latitude", e.target.value)}
                placeholder="Latitude *"
                required
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
              />

              <input
                value={form.longitude}
                onChange={(e) => updateForm("longitude", e.target.value)}
                placeholder="Longitude *"
                required
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
              />

              <input
                value={form.price_min}
                onChange={(e) => updateForm("price_min", e.target.value)}
                placeholder="ราคาต่ำสุด"
                type="number"
                min="0"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
              />

              <input
                value={form.price_max}
                onChange={(e) => updateForm("price_max", e.target.value)}
                placeholder="ราคาสูงสุด"
                type="number"
                min="0"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
              />

              <select
                value={form.owner_id}
                onChange={(e) => updateForm("owner_id", e.target.value)}
                required
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
              >
                <option value="">เลือก Owner *</option>
                {owners.map((owner) => (
                  <option key={owner.user_id} value={owner.user_id}>
                    {owner.full_name
                      ? `${owner.full_name} (${owner.username})`
                      : owner.username}
                  </option>
                ))}
              </select>

              <select
                value={form.status}
                onChange={(e) =>
                  updateForm("status", e.target.value as RestaurantStatus)
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
              >
                <option value="APPROVED">APPROVED</option>
                <option value="PENDING">PENDING</option>
                <option value="REJECTED">REJECTED</option>
              </select>

              <input
                value={form.open_time}
                onChange={(e) => updateForm("open_time", e.target.value)}
                placeholder="เวลาเปิด (08:00:00)"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
              />

              <input
                value={form.close_time}
                onChange={(e) => updateForm("close_time", e.target.value)}
                placeholder="เวลาปิด (22:00:00)"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
              />
            </div>

            <div className="mt-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-700">
                <HandPlatter className="h-4 w-4 text-orange-400" />
                ประเภทอาหาร (เลือกได้หลายอย่าง)
              </div>

              <div className="flex flex-wrap gap-3 rounded-2xl border border-orange-100 bg-orange-50/50 p-4">
                {foodTypes.map((ft) => {
                  const selected = form.foodtype_ids.includes(ft.foodtype_id);

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
                        onChange={() => toggleFoodType(ft.foodtype_id)}
                        className="hidden"
                      />
                      {selected ? "✓" : ""}
                      {ft.foodtype_name}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                <FileText className="h-4 w-4 text-orange-400" />
                รายละเอียดร้าน
              </div>

              <textarea
                value={form.description}
                onChange={(e) => updateForm("description", e.target.value)}
                placeholder="รายละเอียดร้าน"
                className="min-h-[100px] w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
              />
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={loadingForm}
                className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-md transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  editingId !== null
                    ? "bg-orange-500 hover:bg-orange-600"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {editingId !== null ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {loadingForm
                  ? "กำลังบันทึก..."
                  : editingId !== null
                  ? "บันทึกการแก้ไข"
                  : "เพิ่มร้าน"}
              </button>

              {editingId !== null && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition hover:border-orange-300 hover:text-orange-600"
                >
                  <X className="h-4 w-4" />
                  ยกเลิก
                </button>
              )}
            </div>
          </form>

          {/* Loading list */}
          {loadingList && (
            <div className="mt-5 flex items-center gap-2 rounded-2xl border border-orange-100 bg-white px-4 py-3 text-sm text-gray-500">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-orange-400 border-t-transparent" />
              กำลังโหลดข้อมูล...
            </div>
          )}

          {/* List */}
          <div className="mt-6 grid gap-5">
            {items.map((r) => (
              <div
                key={r.restaurant_id}
                className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-orange-200 hover:shadow-md"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
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

                <div className="mt-4 grid gap-2 text-sm text-gray-600">
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
                      {r.open_time || "-"} - {r.close_time || "-"} {" | "}
                      <span
                        className={`font-semibold ${
                          r.is_open_now ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {r.is_open_now ? "เปิดอยู่" : "ปิดอยู่"}
                      </span>
                    </span>
                  </div>

                  <div className="inline-flex items-center gap-2">
                    <Wallet className="h-4 w-4 shrink-0 text-orange-400" />
                    <span>
                      {r.price_min} - {r.price_max} บาท
                    </span>
                  </div>

                  <div className="inline-flex items-center gap-2">
                    <User className="h-4 w-4 shrink-0 text-orange-400" />
                    <span>Owner: {ownerLabel(r.owner_id)}</span>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    onClick={() => startEdit(r)}
                    disabled={loadingList}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:border-orange-300 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Pencil className="h-4 w-4" />
                    แก้ไข
                  </button>

                  <button
                    onClick={() => void removeRestaurant(r.restaurant_id)}
                    disabled={loadingList}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Trash2 className="h-4 w-4" />
                    ลบ
                  </button>

                  <Link
                    href={`/restaurants/${r.restaurant_id}?back=/admin/restaurants`}
                    className="inline-flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-2.5 text-sm font-medium text-orange-600 transition hover:bg-orange-100"
                  >
                    <Eye className="h-4 w-4" />
                    ดูหน้าร้าน
                  </Link>
                </div>

                {r.status === "PENDING" && (
                  <div className="mt-4 inline-flex w-full items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>ร้านนี้ยังรอการอนุมัติจากระบบ</span>
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