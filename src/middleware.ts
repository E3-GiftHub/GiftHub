import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("next-auth.session-token");
  const isLoggedIn = Boolean(token);
  const { pathname } = request.nextUrl;

  const guestOnlyRoutes = [
    "/login",
    "/register",
    "/password-forgot",
    "/password-reset",
  ];

  if (isLoggedIn && guestOnlyRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  const protectedRoutes = [
    "/home",
    "/inbox",
    "/event-create",
    "/event-invitation",
    "/event",
    "/event-view",
    "/wishlist-view",
    "/wishlist-create",
    "/payment-failure",
    "/payment-success",
    "/payment",
    "/profile-edit",
    "/profile",
    "/password-reset-logged",
  ];

  if (!isLoggedIn && protectedRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/password-forgot",
    "/password-reset",
    "/password-reset-logged",

    "/home",
    "/inbox",

    "/event-create",
    "/event-invitation",

    "/event", // guest
    "/event-view", // planner
    "/wishlist-view", // guest
    "/wishlist-create", // planner

    "/payment-failure",
    "/payment-success",
    "/payment",

    "/profile-edit",
    // "/profile-view", // allow to see users
    "/profile",
  ],
};
