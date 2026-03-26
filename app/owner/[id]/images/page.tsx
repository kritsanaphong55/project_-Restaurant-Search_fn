"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft,
  Images,
  Upload,
  
  ImageIcon,
  Trash2,
  FileText,
  Eye,
} from "lucide-react";
import {
  apiFetch,
  API_BASE,
  normalizeImageUrl,
} from "@/src/lib/api";
import ImageDropUploader from "@/app/components/ImageDropUploader";
import RequireAuth from "@/app/components/RequireAuth";

type Img = {
  image_id: number;
  restaurant_id: number;
  image_url: string | null;
  caption?: string | null;
};

function ImagePlaceholder({
  text,
  heightClass = "h-[220px]",
}: {
  text: string;
  heightClass?: string;
}) {
  return (
    <div
      className={`flex w-full items-center justify-center rounded-2xl border border-dashed border-orange-200 bg-orange-50 text-sm text-gray-400 ${heightClass}`}
    >
      {text}
    </div>
  );
}

export default function OwnerImagesPage() {
  const params = useParams<{ id: string }>();
  const restaurantId = Number(params.id);

  const [items, setItems] = useState<Img[]>([]);
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [uploaderKey, setUploaderKey] = useState(0);

  const load = useCallback(async () => {
    if (!restaurantId) return;

    setMsg(null);
    setLoadingList(true);

    try {
      const res = await apiFetch(`/api/restaurants/${restaurantId}/images`);
      setItems(res.data || []);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "โหลดรูปไม่สำเร็จ");
    } finally {
      setLoadingList(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    void load();
  }, [load]);

  const add = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMsg(null);

    if (!file) {
      setMsg("กรุณาเลือกไฟล์รูป");
      return;
    }

    setLoadingUpload(true);

    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      const formData = new FormData();
      formData.append("image", file);
      formData.append("caption", caption);

      const res = await fetch(
        `${API_BASE}/api/restaurants/${restaurantId}/images/upload`,
        {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "อัปโหลดรูปไม่สำเร็จ");
      }

      setCaption("");
      setFile(null);
      setUploaderKey((k) => k + 1);
      setMsg("อัปโหลดรูปสำเร็จ");
      await load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "อัปโหลดรูปไม่สำเร็จ");
    } finally {
      setLoadingUpload(false);
    }
  };

  const removeImage = async (imageId: number) => {
    if (!confirm("ลบรูปนี้?")) return;

    setMsg(null);
    setLoadingList(true);

    try {
      await apiFetch(`/api/restaurants/images/${imageId}`, {
        method: "DELETE",
      });
      setMsg("ลบรูปภาพสำเร็จ");
      await load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "ลบรูปไม่สำเร็จ");
    } finally {
      setLoadingList(false);
    }
  };

  return (
    <RequireAuth allow={["OWNER"]}>
      <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-white">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <div className="mb-6 rounded-3xl bg-gradient-to-r from-orange-500 to-orange-400 px-6 py-6 text-white shadow-lg">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <Link
                  href={`/owner/${restaurantId}/menu`}
                  className="inline-flex items-center gap-1 text-white/90 transition hover:text-white"
                >
                  <ChevronLeft className="h-4 w-4" />
                  ไปหน้าจัดการเมนู
                </Link>

                <span className="text-white/40">|</span>

                <Link
                  href="/restaurants"
                  className="inline-flex items-center gap-1 text-white/90 transition hover:text-white"
                >
                  <Eye className="h-4 w-4" />
                  ดูร้านอาหาร
                </Link>
              </div>

              {/* ── Header: ไม่มี badge และปุ่มรีเฟรช ── */}
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                  <Images className="h-7 w-7" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold leading-tight">
                    จัดการรูปภาพร้าน
                  </h1>
                  <p className="mt-1 text-sm text-orange-100">
                    ร้าน #{restaurantId}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {msg && (
            <div
              className={`mb-5 rounded-2xl border px-4 py-3 text-sm ${
                msg.includes("สำเร็จ")
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-red-200 bg-red-50 text-red-600"
              }`}
            >
              {msg}
            </div>
          )}

          <form
            onSubmit={add}
            className="mb-8 rounded-3xl border border-orange-100 bg-white p-5 shadow-sm"
          >
            <div className="mb-4 flex items-center gap-2 text-base font-bold text-[#1F2937]">
              <Upload className="h-5 w-5 text-orange-500" />
              อัปโหลดรูปใหม่
            </div>

            <div className="grid gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  รูปภาพร้าน
                </label>
                <ImageDropUploader
                  key={uploaderKey}
                  onFileChange={setFile}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  คำอธิบายรูป
                </label>
                <input
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="คำอธิบายรูป (ไม่ใส่ก็ได้)"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                />
              </div>

              <button
                type="submit"
                disabled={loadingUpload || !file}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-orange-300"
              >
                <Upload className="h-4 w-4" />
                {loadingUpload ? "กำลังอัปโหลด..." : "อัปโหลดรูป"}
              </button>
            </div>
          </form>

          <div className="mb-4 flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-orange-500" />
            <h2 className="text-2xl font-bold text-[#1F2937]">รูปทั้งหมด</h2>
          </div>

          {loadingList && (
            <div className="mb-4 flex items-center gap-2 rounded-2xl border border-orange-100 bg-white px-4 py-3 text-sm text-gray-500">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-orange-400 border-t-transparent" />
              กำลังโหลดรูปภาพ...
            </div>
          )}

          {!loadingList && items.length === 0 && (
            <div className="rounded-3xl border border-dashed border-orange-200 bg-white px-6 py-14 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                <Images className="h-8 w-8" />
              </div>
              <h2 className="text-lg font-semibold text-[#1F2937]">
                ยังไม่มีรูปภาพ
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                อัปโหลดรูปภาพร้านของคุณจากฟอร์มด้านบน
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((img) => {
              const safeSrc = normalizeImageUrl(img.image_url);

              return (
                <div
                  key={img.image_id}
                  className="overflow-hidden rounded-3xl border border-gray-100 bg-white p-4 shadow-sm transition hover:border-orange-200 hover:shadow-md"
                >
                  {safeSrc ? (
                    <Image
                      src={safeSrc}
                      alt={img.caption || "restaurant image"}
                      width={360}
                      height={220}
                      unoptimized
                      className="h-[220px] w-full rounded-2xl border border-gray-100 object-cover"
                    />
                  ) : (
                    <ImagePlaceholder text="ไม่มีรูปภาพ" />
                  )}

                  <div className="mt-4 min-h-[48px]">
                    {img.caption ? (
                      <div className="inline-flex items-start gap-2 text-sm text-gray-600">
                        <FileText className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" />
                        <span>{img.caption}</span>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400">ไม่มีคำอธิบายรูป</div>
                    )}
                  </div>

                  <div className="mt-4">
                    <button
                      onClick={() => void removeImage(img.image_id)}
                      disabled={loadingList}
                      className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Trash2 className="h-4 w-4" />
                      ลบรูปภาพ
                    </button>
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