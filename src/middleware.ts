import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

type LoginRole = "user" | "org" | "admin";

const ROLE_HOME: Record<LoginRole, string> = {
  user: "/staff-portal",
  org: "/org-portal",
  admin: "/master-admin/dashboard",
};

const PROTECTED_PREFIXES: Array<{ prefix: string; role: LoginRole }> = [
  { prefix: "/staff-portal", role: "user" },
  { prefix: "/org-portal", role: "org" },
  { prefix: "/master-admin", role: "admin" },
];

function isLoginRole(value: string | undefined): value is LoginRole {
  return value === "user" || value === "org" || value === "admin";
}

function getRoleHome(role: string | undefined): string | null {
  return isLoginRole(role) ? ROLE_HOME[role] : null;
}

function buildRedirect(req: NextRequest, targetPath: string) {
  const url = req.nextUrl.clone();
  url.pathname = targetPath;
  url.search = "";
  return NextResponse.redirect(url);
}

function isLoggedIn(token: string | undefined, role: string | undefined) {
  if (!token || token === "undefined" || token === "null") return false;
  return isLoginRole(role);
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const role = req.cookies.get("role")?.value;
  const token = req.cookies.get("authorization")?.value;
  const homeForRole = getRoleHome(role);
  const loggedIn = isLoggedIn(token, role);

  if (pathname === "/login" || pathname.startsWith("/login/")) {
    if (loggedIn && homeForRole) {
      return buildRedirect(req, homeForRole);
    }
    return NextResponse.next();
  }

  const protectedRoute = PROTECTED_PREFIXES.find(({ prefix }) =>
    pathname.startsWith(prefix),
  );

  if (!protectedRoute) {
    return NextResponse.next();
  }

  if (!loggedIn) {
    return buildRedirect(req, "/login");
  }

  if (protectedRoute.role !== role) {
    return buildRedirect(req, homeForRole ?? "/login");
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
