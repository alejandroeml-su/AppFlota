import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "super-secret-key-for-mvp"
);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const path = request.nextUrl.pathname;

  // Rutas públicas
  if (path === "/login" || path.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Redirigir a login si no hay token
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    // Validar JWT
    const { payload } = await jwtVerify(token, SECRET_KEY);
    const role = payload.role as string;

    // RBAC: Verificación de accesos por Rol
    if (path.startsWith("/admin") && !(role === "SUPERADMIN" || role === "FLOTA_ADMIN")) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    if (path.startsWith("/conductor") && role !== "CONDUCTOR") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    if (path.startsWith("/mantenimiento") && role !== "MANTENIMIENTO") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    return NextResponse.next();
  } catch {
    // Token inválido o expirado
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
