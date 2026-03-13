import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "super-secret-key-for-mvp"
);

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Faltan credenciales" },
        { status: 400 }
      );
    }

    // 1. Buscar al usuario y su rol en la BD
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let rows: any[] = [];
    try {
      const authQuery = `
        SELECT u.id, u.first_name, u.last_name, u.email, u.password_hash, u.is_active, r.name as role
        FROM users u
        JOIN user_roles ur ON u.id = ur.user_id
        JOIN roles r ON ur.role_id = r.id
        WHERE u.email = $1
      `;
      const result = await query(authQuery, [email]);
      rows = result.rows;
    } catch (dbError) {
      console.warn("Database connection failed, falling back to mock user for testing:", dbError);
      // Fallback for emulator if DB isn't running
      if (email === "emartinez@complejoavante.com") {
         const mockHash = await bcrypt.hash("1234", 10);
         rows = [{
           id: "10000000-0000-0000-0000-000000000001",
           first_name: "E.",
           last_name: "Martinez",
           email: "emartinez@complejoavante.com",
           password_hash: mockHash,
           is_active: true,
           role: "SUPERADMIN"
         }];
      }
    }

    if (rows.length === 0) {
      return NextResponse.json(
        { message: "Usuario no encontrado" },
        { status: 401 }
      );
    }

    const unverifiedUser = rows[0];

    if (!unverifiedUser.is_active) {
      return NextResponse.json(
        { message: "La cuenta está inactiva" },
        { status: 403 }
      );
    }

    // 2. Validar Hash BCRYPT
    const isPasswordValid = await bcrypt.compare(
      password,
      unverifiedUser.password_hash
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Contraseña incorrecta" },
        { status: 401 }
      );
    }

    // 3. Generar JWT (Jose Edge Compatible)
    const token = await new SignJWT({
      userId: unverifiedUser.id,
      email: unverifiedUser.email,
      role: unverifiedUser.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("8h")
      .sign(SECRET_KEY);

    // 4. Setear la Cookie en la respuesta
    const response = NextResponse.json({
      message: "Login exitoso",
      user: {
        id: unverifiedUser.id,
        name: `${unverifiedUser.first_name} ${unverifiedUser.last_name}`,
        role: unverifiedUser.role,
      },
      role: unverifiedUser.role, // redundante pero ayuda a UI logic
    });

    response.cookies.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 8 * 60 * 60, // 8 horas
      path: "/",
    });

    response.cookies.set({
      name: "user_role",
      value: unverifiedUser.role,
      httpOnly: false, // Permitir acceso desde JS para UI logic
      secure: process.env.NODE_ENV === "production",
      maxAge: 8 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
