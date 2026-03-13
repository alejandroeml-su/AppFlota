import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "super-secret-key-for-mvp"
);

export async function GET() {
  try {
    const fuelLogs = await query(`
      SELECT 
        fl.id, 
        'combustible' as type, 
        fl.vehicle_id as vehicle_id,
        v.brand || ' ' || v.model || ' ' || v.year as vehicle_name,
        fl.created_at as raw_date,
        to_char(fl.created_at, 'DD Mon YYYY, HH24:MI') as date,
        d.name as driver,
        'Carga de ' || fl.liters_filled || ' L' as details,
        '$' || TO_CHAR(fl.total_cost, 'FM999,999.00') || ' MXN' as cost,
        fl.recorded_odometer || ' km' as odometer
      FROM fuel_logs fl
      LEFT JOIN vehicles v ON fl.vehicle_id = v.id
      LEFT JOIN drivers d ON fl.driver_id = d.id
    `);

    const maintenanceOrders = await query(`
      SELECT 
        mo.id, 
        'mantenimiento' as type, 
        mo.vehicle_id as vehicle_id,
        v.brand || ' ' || v.model || ' ' || v.year as vehicle_name,
        mo.created_at as raw_date,
        to_char(mo.created_at, 'DD Mon YYYY, HH24:MI') as date,
        mo.taller as driver,
        mo.description as details,
        '$' || TO_CHAR(COALESCE(mo.actual_cost, mo.expected_cost, 0), 'FM999,999.00') || ' MXN' as cost,
        'N/A' as odometer
      FROM maintenance_orders mo
      LEFT JOIN vehicles v ON mo.vehicle_id = v.id
    `);

    const allLogs = [...fuelLogs.rows, ...maintenanceOrders.rows].sort((a, b) => 
      new Date(b.raw_date).getTime() - new Date(a.raw_date).getTime()
    );

    return NextResponse.json(allLogs);
  } catch (error) {
    console.error("Error fetching bitacoras:", error);
    return NextResponse.json({ message: "Error al obtener bitácoras" }, { status: 500 });
  }
}
