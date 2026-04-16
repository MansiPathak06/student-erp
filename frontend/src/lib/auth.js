// src/lib/auth.js
export const getToken = () => {
  if (typeof window === "undefined") return null;
  // Cookie se lo - login wahan save karta hai
  const match = document.cookie.match(/(^| )token=([^;]+)/);
  return match ? match[2] : null;
};

export const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});