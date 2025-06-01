import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  let cookie = request.cookies.get("next-auth.session-token");
  if (!cookie) return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: ["/home", "/event", "/event-view"],
};
