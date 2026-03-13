import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const result = await query(`
      SELECT id, name, license_number, status, phone, created_at
      FROM drivers 
      ORDER BY name ASC
    `);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching drivers:", error);
    return NextResponse.json({ error: "Failed to fetch drivers" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, license_number, status, phone } = body;
    
    if (!name || !license_number) {
       return NextResponse.json({ error: "Name and license number are required" }, { status: 400 });
    }

    const id = `DRV-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    const result = await query(
      `INSERT INTO drivers (id, name, license_number, status, phone) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [id, name, license_number, status || 'Activo', phone || null]
    );
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: any) {
    console.error("Error creating driver:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
