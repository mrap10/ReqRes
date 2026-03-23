import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const MAINTENANCE_MODE = true;

export function proxy(request: NextRequest) {
  if (MAINTENANCE_MODE) {
    if (request.nextUrl.pathname === "/maintenance") {
      return NextResponse.next();
    }

    return NextResponse.rewrite(new URL("/maintenance", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
