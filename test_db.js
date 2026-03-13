
const { Client } = require('pg');

async function test() {
  const client = new Client({
    connectionString: "postgresql://postgres:postgres@localhost:5432/flota"
  });
  await client.connect();
  const res = await client.query('SELECT * FROM vehicles LIMIT 5');
  console.log(JSON.stringify(res.rows, null, 2));
  await client.end();
}

test();
