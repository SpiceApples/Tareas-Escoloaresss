const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

async function init() {
  if (!connectionString) {
    console.error('ERROR: DATABASE_URL no está definida en las variables de entorno.');
    process.exit(1);
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Conectando a la base de datos...');
    await client.connect();
    
    const sqlPath = path.join(__dirname, 'db_schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Ejecutando script de creación de tablas...');
    await client.query(sql);
    
    console.log('✅ Base de datos inicializada con éxito.');
  } catch (err) {
    console.error('❌ Error al inicializar la base de datos:', err);
  } finally {
    await client.end();
  }
}

init();
