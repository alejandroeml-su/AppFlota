const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function setup() {
  const client = new Client({
    user: 'postgres',
    password: 'postgres',
    host: 'localhost',
    port: 5432,
    database: 'postgres'
  });

  try {
    await client.connect();
    
    // Check if db exists
    const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'flota'");
    if (res.rowCount === 0) {
      console.log("Creating database flota...");
      await client.query('CREATE DATABASE flota');
    } else {
      console.log("Database flota already exists.");
    }
  } catch (err) {
    console.error("Error creating database (maybe Postgres is not running?):", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }

  // Connect to the new flota db and run schema
  const flotaClient = new Client({
    user: 'postgres',
    password: 'postgres',
    host: 'localhost',
    port: 5432,
    database: 'flota'
  });

  try {
    await flotaClient.connect();
    console.log("Connected to flota db. Running schema...");
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    await flotaClient.query(schemaSql);
    console.log("Schema applied successfully!");
  } catch (err) {
    console.error("Error applying schema:", err.message);
  } finally {
    await flotaClient.end();
  }
}

setup();
