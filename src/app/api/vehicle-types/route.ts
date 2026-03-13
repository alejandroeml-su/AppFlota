import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const result = await query("SELECT * FROM vehicle_types ORDER BY id ASC");
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch vehicle types" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, icon_name } = await req.json();
    const result = await query(
      "INSERT INTO vehicle_types (name, icon_name) VALUES ($1, $2) RETURNING *",
      [name, icon_name]
    );
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create vehicle type" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, name, icon_name } = await req.json();
    const result = await query(
      "UPDATE vehicle_types SET name = $1, icon_name = $2 WHERE id = $3 RETURNING *",
      [name, icon_name, id]
    );
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update vehicle type" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    await query("DELETE FROM vehicle_types WHERE id = $1", [id]);
    return NextResponse.json({ message: "Type deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete vehicle type" }, { status: 500 });
  }
}
