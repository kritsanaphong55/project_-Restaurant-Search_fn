const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://project-restaurant-search-5.onrender.com";

export async function apiFetch(path, options = {}) {
  const base = API_BASE.replace(/\/+$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;

  let token = null;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("token");
  }

  const res = await fetch(`${base}${p}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || `HTTP ${res.status}`);
  }

  return data;
}