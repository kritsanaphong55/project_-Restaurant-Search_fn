const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://project-restaurant-search-5.onrender.com";

export { API_BASE };

export async function apiFetch(path, options = {}) {
  const base = API_BASE.replace(/\/+$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;

  let token = null;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("token");
  }

  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  const res = await fetch(`${base}${p}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
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

export function normalizeImageUrl(url) {
  if (!url) return null;

  const trimmed = String(url).trim();
  if (!trimmed) return null;

  return trimmed
    .replace(
      "http://localhost:4000",
      "https://project-restaurant-search-5.onrender.com"
    )
    .replace(
      "http://project-restaurant-search-5.onrender.com",
      "https://project-restaurant-search-5.onrender.com"
    );
}
