
import { query } from "./src/lib/db.js";

async function checkVehicles() {
  try {
    const result = await query(`
      SELECT 
        v.id, 
        v.brand,
        v.model, 
        v.shift_id,
        sed.name as sede_name
      FROM vehicles v
      LEFT JOIN shifts s ON v.shift_id = s.id
      LEFT JOIN sedes sed ON s.sede_id = sed.id
    `);
    console.log(JSON.stringify(result.rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkVehicles();
