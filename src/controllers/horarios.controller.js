const pool = require('../config/db');

const getHorarios = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM horarios');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getHorarios };