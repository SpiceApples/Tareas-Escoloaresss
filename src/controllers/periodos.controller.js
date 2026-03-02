const pool = require('../config/db');

const getPeriodos = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM periodos');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getPeriodos };