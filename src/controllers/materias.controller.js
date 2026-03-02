const pool = require('../config/db');

const getMaterias = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM materias');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getMaterias };