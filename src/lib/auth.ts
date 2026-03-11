export type UserInfo = {
  user_id: number;
  username: string;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  role: "ADMIN" | "OWNER" | "USER";
};

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function getUser(): UserInfo | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem("user");
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}