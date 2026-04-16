const BASE = "/api";

function getCookie(name) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

export async function apiFetch(path, options = {}) {
  const token = getCookie("token");
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      // "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    document.cookie = "token=; Max-Age=0; path=/";
    document.cookie = "user=; Max-Age=0; path=/";
    window.location.href = "/login";
    return;
  }

  return res.json();
}

export function getUser() {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(^| )user=([^;]+)/);
  if (!match) return null;
  try { return JSON.parse(decodeURIComponent(match[2])); }
  catch { return null; }
}

export function logout() {
  document.cookie = "token=; Max-Age=0; path=/";
  document.cookie = "user=; Max-Age=0; path=/";
  window.location.href = "/login";
}