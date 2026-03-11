// app/restaurants/[id]/ReviewForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/src/lib/api";

type Props = {
  restaurantId: number;
};

export default function ReviewForm({ restaurantId }: Props) {
  const router = useRouter();
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");
  const [msg, setMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMsg(null);
    setSuccess(false);

    // เช็ค login ก่อน
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) {
      setMsg("กรุณา Login ก่อนเขียนรีวิว");
      return;
    }

    setLoading(true);

    try {
      // ✅ ไม่ต้องส่ง Authorization header ซ้ำ — apiFetch ทำให้แล้ว
      await apiFetch("/api/reviews", {
        method: "POST",
        body: JSON.stringify({
          restaurant_id: restaurantId,
          rating: Number(rating),
          comment: comment.trim() || null,
        }),
      });

      setSuccess(true);
      setMsg("ส่งรีวิวสำเร็จ ✅ ขอบคุณสำหรับรีวิวของคุณ!");
      setComment("");
      setRating(5);

      // ✅ reload Server Component เพื่อแสดงรีวิวใหม่
      router.refresh();
    } catch (err: unknown) {
      setSuccess(false);
      setMsg(err instanceof Error ? err.message : "ส่งรีวิวไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        marginTop: 16,
        padding: 16,
        border: "1px solid #ddd",
        borderRadius: 10,
        background: "#fff",
        maxWidth: 540,
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: 12 }}>✍️ เขียนรีวิวร้านนี้</h3>

      {msg && (
        <div
          style={{
            marginBottom: 12,
            padding: 10,
            borderRadius: 6,
            background: success ? "#f0fff0" : "#fff0f0",
            color: success ? "green" : "crimson",
            fontSize: 14,
          }}
        >
          {msg}
        </div>
      )}

      <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
        <label>
          <span style={{ fontSize: 13, color: "#555" }}>คะแนน</span>
          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            disabled={loading}
            style={{
              display: "block",
              marginTop: 4,
              padding: 10,
              width: "100%",
              borderRadius: 8,
              border: "1px solid #ccc",
            }}
          >
            <option value={5}>⭐⭐⭐⭐⭐ — ดีมาก</option>
            <option value={4}>⭐⭐⭐⭐ — ดี</option>
            <option value={3}>⭐⭐⭐ — พอใช้</option>
            <option value={2}>⭐⭐ — ควรปรับปรุง</option>
            <option value={1}>⭐ — แย่</option>
          </select>
        </label>

        <label>
          <span style={{ fontSize: 13, color: "#555" }}>คอมเมนต์</span>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="เขียนรีวิวของคุณ..."
            disabled={loading}
            style={{
              display: "block",
              marginTop: 4,
              padding: 10,
              width: "100%",
              borderRadius: 8,
              border: "1px solid #ccc",
              resize: "vertical",
              boxSizing: "border-box",
            }}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: 10,
            cursor: loading ? "not-allowed" : "pointer",
            borderRadius: 8,
            border: "none",
            background: loading ? "#aaa" : "#2563eb",
            color: "white",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {loading ? "กำลังส่ง..." : "📤 ส่งรีวิว"}
        </button>
      </form>
    </div>
  );
}