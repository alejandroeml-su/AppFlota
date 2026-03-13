import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "super-secret-key-for-mvp"
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { vehicleId, description, expectedCost, taller } = body;

    const result = await query(`
      INSERT INTO maintenance_orders (vehicle_id, description, expected_cost, taller, status)
      VALUES ($1, $2, $3, $4, 'Pendiente')
      RETURNING *
    `, [vehicleId, description, expectedCost, taller]);

    return NextResponse.json({
      message: "Orden de mantenimiento creada exitosamente",
      order: result.rows[0]
    });
  } catch (error) {
    console.error("Error creating maintenance order:", error);
    return NextResponse.json({ message: "Error al crear orden de mantenimiento" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const result = await query("SELECT * FROM maintenance_orders ORDER BY created_at DESC");
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ message: "Error al obtener órdenes" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ message: "ID requerido" }, { status: 400 });

    await query("DELETE FROM maintenance_orders WHERE id = $1", [id]);
    return NextResponse.json({ message: "Orden eliminada" });
  } catch (error) {
    return NextResponse.json({ message: "Error al eliminar" }, { status: 500 });
  }
}
