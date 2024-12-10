import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: ["/"], // If you want middleware to run on all pages, use '**/*'
};

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token");
  const role = true ? "admin" : "standard";
  const currentPath = request.nextUrl.pathname;

  const response = NextResponse.next();
  response.headers.set("X-User-Logged-In", "false");
  response.headers.set("X-User-Role", role);
  response.headers.set("X-Current-Pathname", currentPath);

  console.log("MiddleWare");
  return response;
}
