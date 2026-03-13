import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const result = await query("SELECT * FROM sedes ORDER BY name ASC");
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching sedes:", error);
    return NextResponse.json({ message: "Error al obtener sedes" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, address } = await req.json();
    
    if (!name) {
      return NextResponse.json({ message: "Nombre de sede es requerido" }, { status: 400 });
    }

    const result = await query(
      "INSERT INTO sedes (name, address) VALUES ($1, $2) RETURNING *",
      [name, address]
    );

    return NextResponse.json({
      message: "Sede creada exitosamente",
      sede: result.rows[0]
    });
  } catch (error) {
    console.error("Error creating sede:", error);
    return NextResponse.json({ message: "Error al crear sede" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, name, address } = await req.json();
    
    if (!id || !name) {
      return NextResponse.json({ message: "ID y nombre son requeridos" }, { status: 400 });
    }

    const result = await query(
      "UPDATE sedes SET name = $1, address = $2 WHERE id = $3 RETURNING *",
      [name, address, id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ message: "Sede no encontrada" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Sede actualizada exitosamente",
      sede: result.rows[0]
    });
  } catch (error) {
    console.error("Error updating sede:", error);
    return NextResponse.json({ message: "Error al actualizar sede" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json({ message: "ID es requerido" }, { status: 400 });
    }

    // Note: We might want to check if any shifts are using this sede first.
    // However, ON DELETE SET NULL is handled by DB.
    await query("DELETE FROM sedes WHERE id = $1", [id]);
    
    return NextResponse.json({ message: "Sede eliminada exitosamente" });
  } catch (error) {
    console.error("Error deleting sede:", error);
    return NextResponse.json({ message: "Error al eliminar sede" }, { status: 500 });
  }
}
