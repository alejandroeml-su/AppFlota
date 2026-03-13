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
    
    const allowedFields = ['name', 'license_number', 'status', 'phone'];
    
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

    values.push(id);
    const updateQuery = `
      UPDATE drivers 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex} 
      RETURNING *
    `;
    
    const result = await query(updateQuery, values);
    
    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error("Error updating driver:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    const result = await query(`DELETE FROM drivers WHERE id = $1 RETURNING id`, [id]);
    
    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: "Driver deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting driver:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
