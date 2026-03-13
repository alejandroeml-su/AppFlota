const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/flota';

async function refactorDatabase() {
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('Connected to database for vehicle refactoring...');

    await client.query('BEGIN');

    // 1. Create vehicle_statuses table
    await client.query(`
      CREATE TABLE IF NOT EXISTS vehicle_statuses (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        color_code VARCHAR(50) DEFAULT 'bg-primary'
      )
    `);

    // 2. Create vehicle_types table
    await client.query(`
      CREATE TABLE IF NOT EXISTS vehicle_types (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        icon_name VARCHAR(50) DEFAULT 'Truck'
      )
    `);

    // 3. Insert default statuses and types
    await client.query(`
      INSERT INTO vehicle_statuses (name, color_code) 
      VALUES 
        ('Activo', 'bg-success'),
        ('Mantenimiento', 'bg-warning'),
        ('Inactivo', 'bg-danger'),
        ('Baja', 'bg-black')
      ON CONFLICT (name) DO NOTHING
    `);

    await client.query(`
      INSERT INTO vehicle_types (name, icon_name) 
      VALUES 
        ('Ambulancia Tipo II', 'Activity'),
        ('Ambulancia Tipo III', 'Truck'),
        ('Transporte Personal', 'Users'),
        ('Logística', 'Database')
      ON CONFLICT (name) DO NOTHING
    `);

    // 4. Update vehicles table schema
    await client.query(`
      ALTER TABLE vehicles 
      ADD COLUMN IF NOT EXISTS brand VARCHAR(255),
      ADD COLUMN IF NOT EXISTS model_new VARCHAR(255),
      ADD COLUMN IF NOT EXISTS year INTEGER,
      ADD COLUMN IF NOT EXISTS status_id INTEGER REFERENCES vehicle_statuses(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS type_id INTEGER REFERENCES vehicle_types(id) ON DELETE SET NULL
    `);

    // 5. Fetch existing vehicles to transform data in JS
    const vehiclesRes = await client.query('SELECT id, model, status, type FROM vehicles');
    const statusesRes = await client.query('SELECT id, name FROM vehicle_statuses');
    const typesRes = await client.query('SELECT id, name FROM vehicle_types');

    const statusesMap = Object.fromEntries(statusesRes.rows.map(s => [s.name, s.id]));
    const typesMap = Object.fromEntries(typesRes.rows.map(t => [t.name, t.id]));

    for (const v of vehiclesRes.rows) {
      let brand = 'Genérico';
      let model = v.model;
      let year = null;

      // Try to extract year (4 digits)
      const yearMatch = v.model.match(/\d{4}/);
      if (yearMatch) {
        year = parseInt(yearMatch[0]);
        model = v.model.replace(/\d{4}/, '').trim();
      }

      // Try to extract brand (first word)
      const parts = model.split(' ');
      if (parts.length > 1) {
        brand = parts[0];
        model = parts.slice(1).join(' ').trim();
      } else {
        model = parts[0];
      }

      const status_id = statusesMap[v.status] || null;
      const type_id = typesMap[v.type] || null;

      await client.query(
        'UPDATE vehicles SET brand = $1, model_new = $2, year = $3, status_id = $4, type_id = $5 WHERE id = $6',
        [brand, model, year, status_id, type_id, v.id]
      );
    }

    // 6. Final Clean up
    await client.query('ALTER TABLE vehicles DROP COLUMN status');
    await client.query('ALTER TABLE vehicles DROP COLUMN type');
    await client.query('ALTER TABLE vehicles DROP COLUMN model');
    await client.query('ALTER TABLE vehicles RENAME COLUMN model_new TO model');

    await client.query('COMMIT');
    console.log('Vehicle refactoring completed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error during refactoring:', err);
  } finally {
    await client.close();
  }
}

refactorDatabase();
