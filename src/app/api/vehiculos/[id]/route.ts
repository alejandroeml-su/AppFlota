import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { id } = params;
    
    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramIndex = 1;
    
    const allowedFields = ['model', 'type', 'status', 'plate', 'odometer', 'last_maintenance', 'driver_id'];
    
    for (const [key, value] of Object.entries(body)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updates.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }
    
    if (updates.length === 0) {
      return NextResponse.json({ error: "No valid fields provided for update" }, { status: 400 });
    }
    
    // Add logic to avoid error for empty driver selection turning to empty string instead of null
    if (updates.includes("driver_id = $") && values[values.length -1] === "") {
        values[values.length -1] = null;
    }

    values.push(id);
    const updateQuery = `
      UPDATE vehicles 
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $${paramIndex} 
      RETURNING *
    `;
    
    const result = await query(updateQuery, values);
    
    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error("Error updating vehicle:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    const result = await query(`DELETE FROM vehicles WHERE id = $1 RETURNING id`, [id]);
    
    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: "Vehicle deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting vehicle:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
