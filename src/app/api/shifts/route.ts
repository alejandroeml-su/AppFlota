import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const result = await query(`
      SELECT s.*, sed.name as sede_name 
      FROM shifts s 
      LEFT JOIN sedes sed ON s.sede_id = sed.id
      ORDER BY s.start_time ASC
    `);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching shifts:", error);
    return NextResponse.json({ message: "Error al obtener turnos" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, start_time, end_time, description, sede_id } = await req.json();
    
    if (!name || !start_time || !end_time) {
      return NextResponse.json({ message: "Nombre, hora de inicio y fin son requeridos" }, { status: 400 });
    }

    const result = await query(
      "INSERT INTO shifts (name, start_time, end_time, description, sede_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, start_time, end_time, description, sede_id || null]
    );

    return NextResponse.json({
      message: "Turno creado exitosamente",
      shift: result.rows[0]
    });
  } catch (error) {
    console.error("Error creating shift:", error);
    return NextResponse.json({ message: "Error al crear turno" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, name, start_time, end_time, description, sede_id } = await req.json();
    
    if (!id || !name || !start_time || !end_time) {
      return NextResponse.json({ message: "ID, nombre, hora de inicio y fin son requeridos" }, { status: 400 });
    }

    const result = await query(
      "UPDATE shifts SET name = $1, start_time = $2, end_time = $3, description = $4, sede_id = $5 WHERE id = $6 RETURNING *",
      [name, start_time, end_time, description, sede_id || null, id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ message: "Turno no encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Turno actualizado exitosamente",
      shift: result.rows[0]
    });
  } catch (error) {
    console.error("Error updating shift:", error);
    return NextResponse.json({ message: "Error al actualizar turno" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json({ message: "ID es requerido" }, { status: 400 });
    }

    await query("DELETE FROM shifts WHERE id = $1", [id]);
    
    return NextResponse.json({ message: "Turno eliminado exitosamente" });
  } catch (error) {
    console.error("Error deleting shift:", error);
    return NextResponse.json({ message: "Error al eliminar turno" }, { status: 500 });
  }
}
