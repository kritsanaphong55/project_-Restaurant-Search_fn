// app/components/Navbar.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type UserInfo = {
  user_id: number;
  username: string;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  role: "ADMIN" | "OWNER" | "USER";
};

function readUser(): UserInfo | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserInfo;
  } catch {
    return null;
  }
}

const roleBadge: Record<string, string> = {
  ADMIN: "bg-red-100 text-red-600",
  OWNER: "bg-blue-100 text-blue-600",
  USER: "bg-green-100 text-green-600",
};

const navLinkClass =
  "text-gray-600 hover:text-orange-500 font-medium text-sm transition-colors duration-150";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const syncUser = () => setUser(readUser());
    syncUser();
    window.addEventListener("storage", syncUser);
    window.addEventListener("auth-changed", syncUser as EventListener);
    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("auth-changed", syncUser as EventListener);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.dispatchEvent(new Event("auth-changed"));
    router.replace("/login");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center h-16 gap-4">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-gray-900 text-lg hover:text-orange-500 transition-colors duration-150 shrink-0"
          >
            
            <span className="hidden sm:inline">Restaurant Search</span>
          </Link>

          {/* Nav links — desktop */}
          <div className="hidden md:flex items-center gap-1 ml-4 flex-1 flex-wrap">
            {user?.role === "USER" && (
              <>
                <Link href="/restaurants" className={navLinkClass + " px-3 py-2 rounded-lg hover:bg-orange-50"}>หน้าหลัก</Link>
                <Link href="/map" className={navLinkClass + " px-3 py-2 rounded-lg hover:bg-orange-50"}>🗺️ แผนที่ร้าน</Link>
                <Link href="/my-reviews" className={navLinkClass + " px-3 py-2 rounded-lg hover:bg-orange-50"}>รีวิวของฉัน</Link>
              </>
            )}

            {user?.role === "OWNER" && (
              <>
                <Link href="/owner" className={navLinkClass + " px-3 py-2 rounded-lg hover:bg-orange-50"}>Owner Dashboard</Link>
                <Link href={`/owner/${user.user_id}/menu`} className={navLinkClass + " px-3 py-2 rounded-lg hover:bg-orange-50"}>จัดการเมนู</Link>
                <Link href={`/owner/${user.user_id}/images`} className={navLinkClass + " px-3 py-2 rounded-lg hover:bg-orange-50"}>จัดการรูปร้าน</Link>
              </>
            )}

            {user?.role === "ADMIN" && (
              <>
                <Link href="/map" className={navLinkClass + " px-3 py-2 rounded-lg hover:bg-orange-50"}>🗺️ แผนที่ร้าน</Link>
                <Link href="/admin" className={navLinkClass + " px-3 py-2 rounded-lg hover:bg-orange-50"}>Admin Dashboard</Link>
                <Link href="/admin/reviews" className={navLinkClass + " px-3 py-2 rounded-lg hover:bg-orange-50"}>จัดการรีวิว</Link>
                <Link href="/admin/users" className={navLinkClass + " px-3 py-2 rounded-lg hover:bg-orange-50"}>จัดการผู้ใช้</Link>
                <Link href="/admin/restaurants" className={navLinkClass + " px-3 py-2 rounded-lg hover:bg-orange-50"}>จัดการร้าน</Link>
              </>
            )}

            {user && (
              <Link href="/profile" className={navLinkClass + " px-3 py-2 rounded-lg hover:bg-orange-50"}>Profile</Link>
            )}
          </div>

          {/* Auth section */}
          <div className="ml-auto flex items-center gap-3 shrink-0">
            {user ? (
              <>
                {/* User badge */}
                <div className="hidden sm:flex items-center gap-2">
                  <span className="text-gray-700 text-sm font-medium">
                    👤 {user.username}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${roleBadge[user.role] ?? "bg-gray-100 text-gray-600"}`}>
                    {user.role}
                  </span>
                </div>

                <button
                  onClick={logout}
                  className="text-sm px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:border-orange-400 hover:text-orange-500 hover:bg-orange-50 transition-all duration-150 font-medium cursor-pointer"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors duration-150 px-3 py-2"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-semibold px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors duration-150"
                >
                  Register
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-orange-50 hover:text-orange-500 transition-colors duration-150 cursor-pointer"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 flex flex-col gap-1">
            {user?.role === "USER" && (
              <>
                <Link href="/restaurants" className="px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500 rounded-lg" onClick={() => setMenuOpen(false)}>หน้าหลัก</Link>
                <Link href="/map" className="px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500 rounded-lg" onClick={() => setMenuOpen(false)}>🗺️ แผนที่ร้าน</Link>
                <Link href="/my-reviews" className="px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500 rounded-lg" onClick={() => setMenuOpen(false)}>รีวิวของฉัน</Link>
              </>
            )}
            {user?.role === "OWNER" && (
              <>
                <Link href="/owner" className="px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500 rounded-lg" onClick={() => setMenuOpen(false)}>Owner Dashboard</Link>
                <Link href={`/owner/${user.user_id}/menu`} className="px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500 rounded-lg" onClick={() => setMenuOpen(false)}>จัดการเมนู</Link>
                <Link href={`/owner/${user.user_id}/images`} className="px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500 rounded-lg" onClick={() => setMenuOpen(false)}>จัดการรูปร้าน</Link>
              </>
            )}
            {user?.role === "ADMIN" && (
              <>
                <Link href="/map" className="px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500 rounded-lg" onClick={() => setMenuOpen(false)}>🗺️ แผนที่ร้าน</Link>
                <Link href="/admin" className="px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500 rounded-lg" onClick={() => setMenuOpen(false)}>Admin Dashboard</Link>
                <Link href="/admin/reviews" className="px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500 rounded-lg" onClick={() => setMenuOpen(false)}>จัดการรีวิว</Link>
                <Link href="/admin/users" className="px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500 rounded-lg" onClick={() => setMenuOpen(false)}>จัดการผู้ใช้</Link>
                <Link href="/admin/restaurants" className="px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500 rounded-lg" onClick={() => setMenuOpen(false)}>จัดการร้าน</Link>
              </>
            )}
            {user && (
              <Link href="/profile" className="px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500 rounded-lg" onClick={() => setMenuOpen(false)}>Profile</Link>
            )}
            {user && (
              <div className="px-4 py-2 flex items-center gap-2 border-t border-gray-100 mt-1 pt-3">
                <span className="text-sm text-gray-600">👤 {user.username}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${roleBadge[user.role] ?? "bg-gray-100 text-gray-600"}`}>
                  {user.role}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
