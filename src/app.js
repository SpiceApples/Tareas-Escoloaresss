const express = require('express');
const cors = require('cors');
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('./config/db');

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Diagnostic
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// Rutas
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/periodos', require('./routes/periodos.routes'));
app.use('/api/materias', require('./routes/materias.routes'));
app.use('/api/horarios', require('./routes/horarios.routes'));
app.use('/api/tareas', require('./routes/tareas.routes'));

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Inicializar base de datos si es necesario
    try {
      console.log('Verificando base de datos...');
      const sqlPath = path.join(__dirname, '../db_schema.sql');
      if (fs.existsSync(sqlPath)) {
        const sql = fs.readFileSync(sqlPath, 'utf8');
        await pool.query(sql);
        console.log('✅ Base de datos verificada/inicializada.');
      }
    } catch (dbError) {
      console.error('⚠️ Advertencia: Error en inicialización de DB, pero el servidor intentará arrancar:', dbError.message);
    }
    
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en puerto ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
  }
}

startServer();
