// middleware.js — Next.js project root
// Guards all routes with role-based access control.
// Cookies set on login: `token` (JWT string) and `user` (JSON-encoded user object).

import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  const tokenCookie = request.cookies.get("token")?.value;
  const userCookie  = request.cookies.get("user")?.value;

  let user = null;
  if (userCookie) {
    try {
      user = JSON.parse(decodeURIComponent(userCookie));
    } catch {
      // malformed cookie — treat as logged out
    }
  }

  const isLoggedIn = !!tokenCookie && !!user;

  // ── Public routes ──────────────────────────────────────────────────────────
  if (pathname.startsWith("/login")) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL(roleDashboard(user.role), request.url));
    }
    return NextResponse.next();
  }

  // ── Not logged in → login ─────────────────────────────────────────────────
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const role = user.role;

  // ── Student: can ONLY access /student/* ───────────────────────────────────
  if (role === "student" && !pathname.startsWith("/student")) {
    return NextResponse.redirect(new URL("/students/dashboard", request.url));
  }

  // ── Teacher: can ONLY access /teacher/* ───────────────────────────────────
  if (role === "teacher" && !pathname.startsWith("/teacher")) {
    return NextResponse.redirect(new URL("/teachers/dashboard", request.url));
  }

  // ── Admin: cannot access /student/* or /teacher/* ─────────────────────────
  if (
    role === "admin" &&
    (pathname.startsWith("/student") || pathname.startsWith("/teacher"))
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

function roleDashboard(role) {
  switch (role) {
    case "student": return "/students/dashboard";
    case "teacher": return "/teachers/dashboard";
    default:        return "/";                  // admin
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};