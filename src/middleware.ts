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
    "/profile-view",
    "/event-invitation",
    "/event", // guest
    "/wishlist", // guest
    "/event-view", // planner
    "/wishlist-create", // planner
    "/contribution",
    "/payment",
    "/payment-failure",
    "/payment-success",
  ],
};