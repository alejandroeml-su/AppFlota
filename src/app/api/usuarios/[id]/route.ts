import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { id } = params;
    
    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramIndex = 1;
    
    const allowedFields = ['name', 'email', 'role', 'password'];
    
    for (const [key, value] of Object.entries(body)) {
      if (allowedFields.includes(key) && value !== undefined && value !== "") {
        if (key === 'password') {
           const hashedPassword = await bcrypt.hash(value as string, 10);
           updates.push(`password_hash = $${paramIndex}`);
           values.push(hashedPassword);
        } else {
           updates.push(`${key} = $${paramIndex}`);
           values.push(value);
        }
        paramIndex++;
      }
    }
    
    if (updates.length === 0) {
      return NextResponse.json({ error: "No valid fields provided for update" }, { status: 400 });
    }

    values.push(id);
    const updateQuery = `
      UPDATE users 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex} 
      RETURNING id, name, email, role, created_at
    `;
    
    const result = await query(updateQuery, values);
    
    if (result.rowCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error("Error updating user:", error);
    if (error.code === '23505') {
       return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    const result = await query(`DELETE FROM users WHERE id = $1 RETURNING id`, [id]);
    
    if (result.rowCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: "User deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
