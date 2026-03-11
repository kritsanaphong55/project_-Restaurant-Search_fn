// app/components/RequireAuth.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Role = "ADMIN" | "OWNER" | "USER";

type Props = {
  children: React.ReactNode;
  allow?: Role[];
};

type UserInfo = {
  user_id: number;
  username: string;
  role: Role;
};

type AuthState = {
  token: string | null;
  user: UserInfo | null;
};

function readAuth(): AuthState {
  if (typeof window === "undefined") {
    return { token: null, user: null };
  }

  const token = localStorage.getItem("token");
  const rawUser = localStorage.getItem("user");

  if (!token || !rawUser) {
    return { token: null, user: null };
  }

  try {
    return {
      token,
      user: JSON.parse(rawUser) as UserInfo,
    };
  } catch {
    return { token: null, user: null };
  }
}

export default function RequireAuth({ children, allow }: Props) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [auth, setAuth] = useState<AuthState>({ token: null, user: null });

  useEffect(() => {
    const syncAuth = () => {
      setAuth(readAuth());
      setReady(true);
    };

    syncAuth();

    window.addEventListener("storage", syncAuth);
    window.addEventListener("auth-changed", syncAuth as EventListener);

    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener("auth-changed", syncAuth as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!ready) return;

    if (!auth.token || !auth.user) {
      router.replace("/login");
      return;
    }

    if (allow && allow.length > 0 && !allow.includes(auth.user.role)) {
      router.replace("/");
    }
  }, [ready, auth, allow, router]);

  if (!ready) {
    return <div style={{ padding: 20 }}>กำลังโหลด...</div>;
  }

  if (!auth.token || !auth.user) {
    return <div style={{ padding: 20 }}>กำลังตรวจสอบสิทธิ์...</div>;
  }

  if (allow && allow.length > 0 && !allow.includes(auth.user.role)) {
    return <div style={{ padding: 20 }}>ไม่มีสิทธิ์เข้าถึงหน้านี้</div>;
  }

  return <>{children}</>;
}