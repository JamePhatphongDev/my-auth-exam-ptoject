import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  try {
    // ใช้ URL แบบเต็ม และระบุ host
    const session = await fetch(
      `${process.env.NEXT_PUBLIC_KRATOS_PUBLIC_URL}/sessions/whoami`,
      {
        headers: {
          cookie: request.headers.get("cookie") || "",
          Accept: "application/json",
        },
        credentials: "include",
      }
    );

    console.log("Middleware session check:", {
      status: session.status,
      headers: Object.fromEntries(session.headers),
    });

    if (!session.ok) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    return NextResponse.next();
  } catch (err) {
    console.error("Middleware session error:", err);
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"],
};
