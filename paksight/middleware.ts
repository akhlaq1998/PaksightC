import { NextRequest, NextResponse } from "next/server";

function parseRole(req: NextRequest): "ADMIN" | "MEMBER" | "VIEWER" | null {
  const raw = req.cookies.get("paksight_session")?.value;
  if (!raw) return null;
  try { return JSON.parse(raw).role; } catch { return null; }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const publicPaths = ["/", "/login", "/request-access"];
  if (publicPaths.includes(pathname) || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const role = parseRole(req);
  // Require login for all app routes beyond public
  if (!role) {
    return NextResponse.redirect(new URL("/not-authorized", req.url));
  }

  // Admin only
  if (pathname.startsWith("/admin")) {
    if (role !== "ADMIN") return NextResponse.redirect(new URL("/not-authorized", req.url));
    return NextResponse.next();
  }

  // Viewer allowed for dashboard and chatbot shell
  if (pathname === "/dashboard" || pathname === "/chatbot") {
    return NextResponse.next();
  }

  // Member/Admin required for search, article, compare
  if (pathname.startsWith("/search") || pathname.startsWith("/article") || pathname.startsWith("/compare")) {
    if (!(role === "ADMIN" || role === "MEMBER")) {
      return NextResponse.redirect(new URL("/not-authorized", req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};