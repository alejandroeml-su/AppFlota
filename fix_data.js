
const { Client } = require('pg');

async function fixData() {
  const client = new Client({
    connectionString: "postgresql://postgres:postgres@localhost:5432/flota"
  });
  await client.connect();
  
  try {
    // 1. Ensure statuses and types exist
    await client.query(`
      INSERT INTO vehicle_statuses (name, color_code) VALUES 
      ('Activo', 'bg-green-500'),
      ('Mantenimiento', 'bg-yellow-500')
      ON CONFLICT (name) DO NOTHING
    `);
    
    await client.query(`
      INSERT INTO vehicle_types (name, icon_name) VALUES 
      ('Ambulancia Tipo II', 'Truck'),
      ('Ambulancia Tipo III', 'Truck')
      ON CONFLICT (name) DO NOTHING
    `);

    // 2. Clear old broken vehicles (since we redefined schema but maybe data is old or missing)
    // Actually, let's just update the existing ones or delete and re-insert
    await client.query("DELETE FROM fuel_logs");
    await client.query("DELETE FROM maintenance_orders");
    await client.query("DELETE FROM vehicles");

    // 3. Re-insert correctly
    await client.query(`
      INSERT INTO vehicles (id, brand, model, year, status_id, type_id, plate, odometer, last_maintenance, driver_id, shift_id)
      VALUES 
      ('AMB-001', 'Ford', 'Transit', 2021, 
       (SELECT id FROM vehicle_statuses WHERE name = 'Activo'), 
       (SELECT id FROM vehicle_types WHERE name = 'Ambulancia Tipo II'),
       'HOS-9128', '45200', '12 Oct 2025', 'DRV-001', (SELECT id FROM shifts ORDER BY id LIMIT 1)),
       
      ('AMB-002', 'Mercedes', 'Sprinter', 2022, 
       (SELECT id FROM vehicle_statuses WHERE name = 'Mantenimiento'), 
       (SELECT id FROM vehicle_types WHERE name = 'Ambulancia Tipo III'),
       'HOS-7341', '62150', '05 Nov 2025', NULL, (SELECT id FROM shifts ORDER BY id OFFSET 1 LIMIT 1))
    `);
    
    console.log("Data fixed successfully");
  } catch (err) {
    console.error("Error fixing data:", err);
  } finally {
    await client.end();
  }
}

fixData();
