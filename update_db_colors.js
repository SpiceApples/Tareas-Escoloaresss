require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
});

async function updateDatabase() {
  const client = await pool.connect();
  try {
    console.log('Adding color columns...');
    
    await client.query('ALTER TABLE periodos ADD COLUMN IF NOT EXISTS color VARCHAR(7);');
    await client.query('ALTER TABLE materias ADD COLUMN IF NOT EXISTS color VARCHAR(7);');
    await client.query('ALTER TABLE horarios ADD COLUMN IF NOT EXISTS color VARCHAR(7);');
    await client.query('ALTER TABLE tareas ADD COLUMN IF NOT EXISTS color VARCHAR(7);');
    
    console.log('Database updated successfully!');
  } catch (err) {
    console.error('Error updating database:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

updateDatabase();
