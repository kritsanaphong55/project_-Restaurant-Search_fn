// app/map/page.tsx
"use client";

import dynamic from "next/dynamic";
import RequireAuth from "@/app/components/RequireAuth";

const MapClient = dynamic(() => import("./MapClient"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-white">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
          กำลังโหลดแผนที่...
        </div>
      </div>
    </div>
  ),
});

export default function MapPage() {
  return (
    <RequireAuth allow={["USER", "ADMIN"]}>
      <MapClient />
    </RequireAuth>
  );
}