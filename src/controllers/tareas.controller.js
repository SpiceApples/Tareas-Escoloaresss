const pool = require('../config/db');

const getTareas = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tareas');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createTarea = async (req, res) => {
  try {
    const { titulo, descripcion, fecha_entrega, id_materia } = req.body;
    const result = await pool.query(
      'INSERT INTO tareas (titulo, descripcion, fecha_entrega, id_materia) VALUES ($1, $2, $3, $4) RETURNING *',
      [titulo, descripcion, fecha_entrega, id_materia]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getTareas, createTarea };