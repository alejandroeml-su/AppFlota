import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    // 1. Get shifts count by sede
    const shiftsBySedeResult = await query(`
      SELECT s.id, s.name, COUNT(sh.id) as count
      FROM sedes s
      LEFT JOIN shifts sh ON s.id = sh.sede_id
      GROUP BY s.id, s.name
    `);

    // 2. Get vehicles count by shift
    const vehiclesByShiftResult = await query(`
      SELECT sh.id, sh.name, COUNT(v.id) as count
      FROM shifts sh
      LEFT JOIN vehicles v ON sh.id = v.shift_id
      GROUP BY sh.id, sh.name
    `);

    // 3. Get generic counts for widgets
    const genericStatsResult = await query(`
      SELECT 
        (SELECT COUNT(*) FROM vehicles) as total_vehicles,
        (SELECT COUNT(*) FROM vehicles v JOIN vehicle_statuses vs ON v.status_id = vs.id WHERE vs.name = 'Activo') as active_vehicles,
        (SELECT COUNT(*) FROM drivers) as total_drivers,
        (SELECT COUNT(*) FROM sedes) as total_sedes
    `);

    return NextResponse.json({
      shiftsBySede: shiftsBySedeResult.rows,
      vehiclesByShift: vehiclesByShiftResult.rows,
      genericStats: genericStatsResult.rows[0]
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 });
  }
}
