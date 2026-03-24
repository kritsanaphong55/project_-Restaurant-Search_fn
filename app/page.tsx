// app/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken, getUser } from "@/src/lib/auth";

export default function HomeRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    const user = getUser();

    if (!token || !user) {
      router.replace("/login");
      return;
    }

    switch (user.role) {
      case "ADMIN":
        router.replace("/admin");
        break;
      case "OWNER":
        router.replace("/owner");
        break;
      case "USER":
        router.replace("/restaurants");
        break;
      default:
        router.replace("/login");
        break;
    }
  }, [router]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        flexDirection: "column",
        gap: 12,
        color: "#888",
      }}
    >
     
      <div style={{ fontSize: 16 }}>กำลังโหลด...</div>
    </div>
  );
}
