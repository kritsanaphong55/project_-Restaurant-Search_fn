"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function BackButtonInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const back = searchParams.get("back");

  console.log("back value:", back);

  const handleBack = () => {
    if (back) {
      router.push(back);
    } else {
      router.back();
    }
  };

  return (
    <button
      onClick={handleBack}
      style={{
        cursor: "pointer",
        background: "none",
        border: "none",
        color: "#555",
        fontSize: 14,
        padding: 0,
      }}
    >
      ← กลับ
    </button>
  );
}

export default function BackButton() {
  return (
    <Suspense fallback={
      <span style={{ fontSize: 14, color: "#555" }}>← กลับ</span>
    }>
      <BackButtonInner />
    </Suspense>
  );
}