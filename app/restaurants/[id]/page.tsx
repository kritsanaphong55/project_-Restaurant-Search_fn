// app/restaurants/[id]/page.tsx
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import {
  MapPin,
  HandPlatter,
  Clock3,
  Wallet,
  Star,
  ImageIcon,
  Soup,
  FileText,
  MessageSquare,
  ChevronLeft,
  CircleDot,
} from "lucide-react";
import { apiFetch } from "@/src/lib/api";
import ReviewForm from "./ReviewForm";
import BackButton from "./BackButton";

type FoodType = {
  foodtype_id: number;
  foodtype_name: string;
};

type Restaurant = {
  restaurant_id: number;
  restaurant_name: string;
  description?: string | null;
  address: string;
  latitude: number;
  longitude: number;
  open_time?: string | null;
  close_time?: string | null;
  price_min: number;
  price_max: number;
  status?: string;
  food_types?: FoodType[] | null;
  is_open_now?: number;
  avg_rating?: number | null;
  review_count?: number | null;
};

type MenuItem = {
  menu_id: number;
  restaurant_id: number;
  menu_name: string;
  description?: string | null;
  price: number;
  image_url?: string | null;
  is_available?: number;
};

type Review = {
  review_id: number;
  rating: number;
  comment?: string | null;
  created_at: string;
  username: string;
};

type RestaurantImage = {
  image_id: number;
  restaurant_id: number;
  image_url?: string | null;
  caption?: string | null;
};

type RestaurantDetailResponse = {
  ok: boolean;
  restaurant: Restaurant;
  menus: MenuItem[];
  reviews: Review[];
  images: RestaurantImage[];
};

type PageProps = {
  params: Promise<{ id: string }>;
};

function foodTypesLabel(food_types?: FoodType[] | null): string {
  if (!Array.isArray(food_types) || food_types.length === 0) return "-";
  return food_types.map((ft) => ft.foodtype_name).join(", ");
}

function ImagePlaceholder({
  text,
  heightClass = "h-[200px]",
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

export default async function RestaurantDetail({ params }: PageProps) {
  const { id } = await params;

  let data: RestaurantDetailResponse | null = null;
  let errorMsg: string | null = null;

  try {
    data = await apiFetch(`/api/restaurants/${id}`);
  } catch (e: unknown) {
    errorMsg = e instanceof Error ? e.message : "โหลดข้อมูลร้านไม่สำเร็จ";
  }

  if (errorMsg || !data || !data.ok) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-white px-4 py-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
            <Suspense
              fallback={
                <span className="inline-flex items-center gap-1 text-sm text-gray-500">
                  <ChevronLeft className="h-4 w-4" />
                  กลับ
                </span>
              }
            >
              <BackButton />
            </Suspense>

            <h1 className="mt-4 text-2xl font-bold text-[#1F2937]">
              ไม่พบข้อมูลร้าน
            </h1>

            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {errorMsg || "เกิดข้อผิดพลาด"}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { restaurant, menus, reviews, images } = data;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-white px-4 py-8">
      <div className="mx-auto max-w-6xl">
        {/* Back */}
        <div className="mb-4">
          <Link
            href="/restaurants"
            className="inline-flex items-center gap-1 text-sm text-gray-500 transition hover:text-orange-500"
          >
            <ChevronLeft className="h-4 w-4" />
            กลับไปหน้าค้นหาร้านอาหาร
          </Link>
        </div>

        {/* Header */}
        <div className="overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-orange-500 to-orange-400 px-6 py-6 text-white">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <h1 className="text-3xl font-bold leading-tight">
                  {restaurant.restaurant_name}
                </h1>

                <div className="mt-4 grid gap-2 text-sm text-orange-50">
                  <div className="inline-flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{restaurant.address}</span>
                  </div>

                  <div className="inline-flex items-center gap-2">
                    <HandPlatter className="h-4 w-4 shrink-0" />
                    <span>{foodTypesLabel(restaurant.food_types)}</span>
                  </div>

                  <div className="inline-flex items-center gap-2">
                    <Clock3 className="h-4 w-4 shrink-0" />
                    <span>
                      {restaurant.open_time || "-"} – {restaurant.close_time || "-"}
                    </span>
                  </div>

                  <div className="inline-flex items-center gap-2">
                    <Wallet className="h-4 w-4 shrink-0" />
                    <span>
                      {restaurant.price_min} – {restaurant.price_max} บาท
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                    restaurant.is_open_now
                      ? "bg-green-100 text-green-700"
                      : "bg-white/20 text-white"
                  }`}
                >
                  <CircleDot className="mr-1 h-3.5 w-3.5" />
                  {restaurant.is_open_now ? "เปิดอยู่" : "ปิดอยู่"}
                </span>

                {restaurant.avg_rating != null && (
                  <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-semibold text-orange-600">
                    <Star className="mr-1 h-3.5 w-3.5 fill-orange-400 text-orange-400" />
                    {Number(restaurant.avg_rating).toFixed(1)} (
                    {restaurant.review_count ?? 0} รีวิว)
                  </span>
                )}
              </div>
            </div>
          </div>

          {restaurant.description && (
            <div className="border-t border-orange-100 bg-orange-50/60 px-6 py-4">
              <div className="inline-flex items-start gap-2 text-sm text-gray-700">
                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" />
                <span>{restaurant.description}</span>
              </div>
            </div>
          )}
        </div>

        {/* Images */}
        <section className="mt-8">
          <div className="mb-4 flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-orange-500" />
            <h2 className="text-2xl font-bold text-[#1F2937]">รูปภาพร้าน</h2>
          </div>

          {images.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-orange-200 bg-white px-6 py-10 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                <ImageIcon className="h-7 w-7" />
              </div>
              <p className="text-sm text-gray-500">ยังไม่มีรูปภาพร้าน</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {images.map((img) => {
                const safeSrc = img.image_url?.trim();

                return (
                  <div
                    key={img.image_id}
                    className="overflow-hidden rounded-3xl border border-gray-100 bg-white p-3 shadow-sm"
                  >
                    {safeSrc ? (
                      <Image
                        src={safeSrc}
                        alt={img.caption || "restaurant"}
                        width={500}
                        height={300}
                        unoptimized
                        className="h-[220px] w-full rounded-2xl object-cover"
                      />
                    ) : (
                      <ImagePlaceholder text="ไม่มีรูปภาพ" heightClass="h-[220px]" />
                    )}

                    {img.caption && (
                      <div className="mt-3 text-sm text-gray-600">
                        {img.caption}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Menu */}
        <section className="mt-10">
          <div className="mb-4 flex items-center gap-2">
            <Soup className="h-5 w-5 text-orange-500" />
            <h2 className="text-2xl font-bold text-[#1F2937]">เมนูอาหาร</h2>
          </div>

          {menus.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-orange-200 bg-white px-6 py-10 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                <Soup className="h-7 w-7" />
              </div>
              <p className="text-sm text-gray-500">ยังไม่มีเมนู</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {menus.map((menu) => {
                const safeSrc = menu.image_url?.trim();

                return (
                  <div
                    key={menu.menu_id}
                    className={`rounded-3xl border p-4 shadow-sm transition ${
                      menu.is_available === 0
                        ? "border-gray-200 bg-gray-50 opacity-70"
                        : "border-gray-100 bg-white hover:border-orange-200 hover:shadow-md"
                    }`}
                  >
                    {safeSrc ? (
                      <Image
                        src={safeSrc}
                        alt={menu.menu_name}
                        width={220}
                        height={140}
                        unoptimized
                        className="h-40 w-full rounded-2xl border border-gray-100 object-cover"
                      />
                    ) : (
                      <ImagePlaceholder text="ไม่มีรูปเมนู" heightClass="h-40" />
                    )}

                    <div className="mt-4">
                      <h3 className="text-lg font-bold text-[#1F2937]">
                        {menu.menu_name}
                      </h3>

                      {menu.description && (
                        <p className="mt-2 text-sm text-gray-600">
                          {menu.description}
                        </p>
                      )}

                      <div className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-orange-600">
                        <Wallet className="h-4 w-4" />
                        {menu.price} บาท
                      </div>

                      {menu.is_available === 0 && (
                        <div className="mt-3 inline-flex rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                          หมดชั่วคราว
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Reviews */}
        <section className="mt-10">
          <div className="mb-4 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-orange-500" />
            <h2 className="text-2xl font-bold text-[#1F2937]">รีวิว</h2>
          </div>

          <div className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm">
            <ReviewForm restaurantId={restaurant.restaurant_id} />
          </div>

          {reviews.length === 0 ? (
            <div className="mt-4 rounded-3xl border border-dashed border-orange-200 bg-white px-6 py-10 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                <MessageSquare className="h-7 w-7" />
              </div>
              <p className="text-sm text-gray-500">ยังไม่มีรีวิว</p>
            </div>
          ) : (
            <div className="mt-5 grid gap-4">
              {reviews.map((review) => (
                <div
                  key={review.review_id}
                  className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-bold text-[#1F2937]">
                        @{review.username}
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                        <span className="font-semibold text-orange-500">
                          {"⭐".repeat(review.rating)}
                        </span>
                        <span className="text-gray-400">
                          ({review.rating}/5)
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-gray-400">
                      {new Date(review.created_at).toLocaleString("th-TH", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>

                  <div className="mt-4 text-sm text-gray-700">
                    {review.comment || (
                      <span className="text-gray-400">ไม่มีคอมเมนต์</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}