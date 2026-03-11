// app/components/NavbarWrapper.tsx
"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

// ✅ เพิ่ม /forgot-password
const HIDDEN_PATHS = ["/login", "/register", "/forgot-password"];

export default function NavbarWrapper() {
  const pathname = usePathname();

  if (HIDDEN_PATHS.includes(pathname)) return null;

  return <Navbar />;
}