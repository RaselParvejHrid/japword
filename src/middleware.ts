import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: ["/((?!api/login|api/registration).*)"],
  // If you want middleware to run on all pages, use "/:path*"
};

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const baseURL = request.nextUrl.origin;
  const currentPath = request.nextUrl.pathname;
  console.log(`Current Path: ${currentPath}`);
  console.log(`Base URL: ${baseURL}`);

  const responseOfNextHandler = NextResponse.next();

  if (currentPath.indexOf(".") !== -1) {
    return responseOfNextHandler;
  }

  const verifyResponse = await fetch(
    new URL("/api/jwt/verify-token", baseURL),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: token }),
    }
  );

  let isUserLoggedIn = false;
  let user = null;
  if (verifyResponse.ok) {
    const responseBody = await verifyResponse.json();
    isUserLoggedIn = true;
    user = responseBody.user;
  }

  if (
    !isUserLoggedIn &&
    ["/login", "/registration"].indexOf(currentPath) === -1
  ) {
    return NextResponse.redirect(`${baseURL}/login`);
  }

  const userRole = user ? user.role : "guest";
  const userEmail = user ? user.email : "";

  if (isUserLoggedIn && userRole === "admin" && currentPath === "/") {
    return NextResponse.redirect(`${baseURL}/admin/dashboard`);
  }

  if (isUserLoggedIn && userRole === "standard" && currentPath === "/") {
    return NextResponse.redirect(`${baseURL}/user/lessons`);
  }

  if (currentPath.includes("/api/admin") && userRole !== "admin") {
    return NextResponse.json(
      { message: "Unauthorized Request." },
      { status: 401 }
    );
  }

  if (currentPath.includes("/api/user") && userRole !== "standard") {
    return NextResponse.json(
      { message: "Unauthorized Request." },
      { status: 401 }
    );
  }

  responseOfNextHandler.headers.set(
    "X-User-Logged-In",
    isUserLoggedIn.toString()
  );
  responseOfNextHandler.headers.set("X-User-Role", userRole);
  responseOfNextHandler.headers.set("X-User-Email", userEmail);

  return responseOfNextHandler;
}
