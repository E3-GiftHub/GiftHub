import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const cookie = request.cookies.get("next-auth.session-token");
  if (!cookie) return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: [
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
