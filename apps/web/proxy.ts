import { NextResponse } from "next/server";

export function proxy() {
  return NextResponse.next();
}

export const config = {
  matcher: ["/submissions/:path*", "/profile/:path*", "/signin", "/signup"],
};
