import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const result = await query("SELECT * FROM vehicle_statuses ORDER BY id ASC");
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch vehicle statuses" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, color_code } = await req.json();
    const result = await query(
      "INSERT INTO vehicle_statuses (name, color_code) VALUES ($1, $2) RETURNING *",
      [name, color_code]
    );
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create vehicle status" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, name, color_code } = await req.json();
    const result = await query(
      "UPDATE vehicle_statuses SET name = $1, color_code = $2 WHERE id = $3 RETURNING *",
      [name, color_code, id]
    );
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update vehicle status" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    await query("DELETE FROM vehicle_statuses WHERE id = $1", [id]);
    return NextResponse.json({ message: "Status deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete vehicle status" }, { status: 500 });
  }
}
