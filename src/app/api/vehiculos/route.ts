import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const result = await query(`
      SELECT 
        v.id, 
        v.brand,
        v.model, 
        v.year,
        v.status_id,
        vs.name as status,
        vs.color_code as status_color,
        v.type_id,
        vt.name as type,
        vt.icon_name as type_icon,
        v.plate, 
        v.odometer, 
        v.last_maintenance as "lastMaintenance", 
        d.name as driver,
        v.driver_id,
        v.shift_id,
        s.name as shift_name,
        sed.name as sede_name
      FROM vehicles v
      LEFT JOIN vehicle_statuses vs ON v.status_id = vs.id
      LEFT JOIN vehicle_types vt ON v.type_id = vt.id
      LEFT JOIN drivers d ON v.driver_id = d.id
      LEFT JOIN shifts s ON v.shift_id = s.id
      LEFT JOIN sedes sed ON s.sede_id = sed.id
      ORDER BY v.created_at DESC
    `);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    return NextResponse.json({ error: "Failed to fetch vehicles" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, brand, model, year, type_id, status_id, plate, odometer, driver_id, shift_id } = body;
    
    if (!id || !brand || !model || !plate) {
       return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO vehicles (id, brand, model, year, type_id, status_id, plate, odometer, driver_id, shift_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [id, brand, model, year || null, type_id || null, status_id || null, plate, odometer || '0', driver_id || null, shift_id || null]
    );
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: any) {
    console.error("Error creating vehicle:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, brand, model, year, type_id, status_id, plate, odometer, driver_id, shift_id } = body;

    if (!id) return NextResponse.json({ error: "Vehicle ID is required" }, { status: 400 });

    const result = await query(
      `UPDATE vehicles 
       SET brand = COALESCE($1, brand),
           model = COALESCE($2, model), 
           year = COALESCE($3, year),
           type_id = $4, 
           status_id = $5, 
           plate = COALESCE($6, plate), 
           odometer = COALESCE($7, odometer), 
           driver_id = $8, 
           shift_id = $9,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $10 RETURNING *`,
      [brand, model, year, type_id || null, status_id || null, plate, odometer, driver_id || null, shift_id || null, id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error("Error updating vehicle:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
