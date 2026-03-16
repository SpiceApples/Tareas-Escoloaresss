const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function sync() {
  const adminClient = new Client({
    user: 'postgres', host: 'localhost', database: 'postgres', password: 'Edall@1806..', port: 5432,
  });
  try {
    await adminClient.connect();
    const res = await adminClient.query("SELECT 1 FROM pg_database WHERE datname='dbtareas'");
    if (res.rowCount === 0) {
      await adminClient.query('CREATE DATABASE dbtareas');
      console.log('Database dbtareas created.');
    }
  } catch(e) {
    console.error('Admin DB error:', e);
  } finally {
    await adminClient.end();
  }

  const client = new Client({
    user: 'postgres', host: 'localhost', database: 'dbtareas', password: 'Edall@1806..', port: 5432,
  });
  try {
    await client.connect();
    const sql = fs.readFileSync(path.join(__dirname, '../db/Querys_creacion.txt'), 'utf8');
    await client.query(sql);
    console.log('Tables created successfully.');
  } catch (err) {
    if (err.code === '42P07') {
      console.log('Tables already exist.');
    } else {
      console.error('Table sync error:', err);
    }
  } finally {
    await client.end();
  }
}
sync();
