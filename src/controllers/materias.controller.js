const pool = require('../config/db');

/**
 * ==============================
 * CREAR MATERIA
 * ==============================
 */
exports.crearMateria = async (req, res) => {
  const { nombre, profesor, id_periodo } = req.body;
  const id_usuario = req.usuario.id_usuario;

  if (!nombre || !id_periodo) {
    return res.status(400).json({
      error: 'Nombre e id_periodo son obligatorios'
    });
  }

  try {

    //  Validar que el periodo pertenece al usuario
    const periodo = await pool.query(
      `SELECT * FROM periodos
       WHERE id_periodo = $1 AND id_usuario = $2`,
      [id_periodo, id_usuario]
    );

    if (periodo.rows.length === 0) {
      return res.status(403).json({
        error: 'No autorizado para usar este periodo'
      });
    }

    const result = await pool.query(
      `INSERT INTO materias (nombre, profesor, id_periodo)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [nombre, profesor, id_periodo]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * ==============================
 * LISTAR TODAS LAS MATERIAS DEL USUARIO
 * ==============================
 */
exports.obtenerTodasLasMaterias = async (req, res) => {
  const id_usuario = req.usuario.id_usuario;

  try {

    const result = await pool.query(
      `SELECT m.id_materia,
              m.nombre,
              m.profesor,
              p.id_periodo,
              p.nombre AS periodo
       FROM materias m
       JOIN periodos p ON m.id_periodo = p.id_periodo
       WHERE p.id_usuario = $1
       ORDER BY p.fecha_inicio DESC, m.nombre ASC`,
      [id_usuario]
    );

    res.json(result.rows);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * ==============================
 * LISTAR MATERIAS POR PERIODO
 * ==============================
 */
exports.obtenerMateriasPorPeriodo = async (req, res) => {
  const { id_periodo } = req.params;
  const id_usuario = req.usuario.id_usuario;

  try {

    // Validar que el periodo pertenece al usuario
    const periodo = await pool.query(
      `SELECT * FROM periodos
       WHERE id_periodo = $1 AND id_usuario = $2`,
      [id_periodo, id_usuario]
    );

    if (periodo.rows.length === 0) {
      return res.status(403).json({
        error: 'No autorizado'
      });
    }

    const result = await pool.query(
      `SELECT * FROM materias
       WHERE id_periodo = $1
       ORDER BY nombre ASC`,
      [id_periodo]
    );

    res.json(result.rows);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/**
 * ==============================
 * OBTENER MATERIA POR ID
 * ==============================
 */
exports.obtenerMateriaPorId = async (req, res) => {
  const { id } = req.params;
  const id_usuario = req.usuario.id_usuario;

  try {

    const result = await pool.query(
      `SELECT m.*
       FROM materias m
       JOIN periodos p ON m.id_periodo = p.id_periodo
       WHERE m.id_materia = $1 AND p.id_usuario = $2`,
      [id, id_usuario]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Materia no encontrada'
      });
    }

    res.json(result.rows[0]);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/**
 * ==============================
 * ACTUALIZAR MATERIA
 * ==============================
 */
exports.actualizarMateria = async (req, res) => {
  const { id } = req.params;
  const { nombre, profesor } = req.body;
  const id_usuario = req.usuario.id_usuario;

  try {

    const result = await pool.query(
      `UPDATE materias m
       SET nombre = $1,
           profesor = $2
       FROM periodos p
       WHERE m.id_materia = $3
         AND m.id_periodo = p.id_periodo
         AND p.id_usuario = $4
       RETURNING m.*`,
      [nombre, profesor, id, id_usuario]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Materia no encontrada o no autorizada'
      });
    }

    res.json(result.rows[0]);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/**
 * ==============================
 * ELIMINAR MATERIA
 * ==============================
 */
exports.eliminarMateria = async (req, res) => {
  const { id } = req.params;
  const id_usuario = req.usuario.id_usuario;

  try {

    const result = await pool.query(
      `DELETE FROM materias m
       USING periodos p
       WHERE m.id_materia = $1
         AND m.id_periodo = p.id_periodo
         AND p.id_usuario = $2
       RETURNING m.*`,
      [id, id_usuario]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Materia no encontrada o no autorizada'
      });
    }

    res.json({
      message: 'Materia eliminada correctamente'
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
