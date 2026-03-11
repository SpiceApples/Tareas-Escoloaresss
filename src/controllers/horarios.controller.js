const pool = require('../config/db');

/**
 * ==============================
 * CREAR HORARIO
 * ==============================
 */
exports.crearHorario = async (req, res) => {
  const { dia_semana, hora_inicio, hora_fin, id_materia } = req.body;
  const id_usuario = req.usuario.id_usuario;

  if (!dia_semana || !hora_inicio || !hora_fin || !id_materia) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    // Validar que la materia pertenece al usuario
    const materia = await pool.query(
      `SELECT m.*
       FROM materias m
       JOIN periodos p ON m.id_periodo = p.id_periodo
       WHERE m.id_materia = $1 AND p.id_usuario = $2`,
      [id_materia, id_usuario]
    );

    if (materia.rows.length === 0) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    const result = await pool.query(
      `INSERT INTO horarios (dia_semana, hora_inicio, hora_fin, id_materia)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [dia_semana, hora_inicio, hora_fin, id_materia]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/**
 * ==============================
 * LISTAR HORARIOS POR MATERIA
 * ==============================
 */
exports.obtenerHorariosPorMateria = async (req, res) => {
  const { id_materia } = req.params;
  const id_usuario = req.usuario.id_usuario;

  try {
    const result = await pool.query(
      `SELECT h.*
       FROM horarios h
       JOIN materias m ON h.id_materia = m.id_materia
       JOIN periodos p ON m.id_periodo = p.id_periodo
       WHERE m.id_materia = $1 AND p.id_usuario = $2
       ORDER BY h.dia_semana, h.hora_inicio`,
      [id_materia, id_usuario]
    );

    res.json(result.rows);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/**
 * ==============================
 * LISTAR HORARIO COMPLETO
 * ==============================
 */
exports.obtenerHorarioCompleto = async (req, res) => {
  const id_usuario = req.usuario.id_usuario;

  try {
    const result = await pool.query(
      `SELECT h.*, m.nombre AS materia, p.nombre AS periodo
       FROM horarios h
       JOIN materias m ON h.id_materia = m.id_materia
       JOIN periodos p ON m.id_periodo = p.id_periodo
       WHERE p.id_usuario = $1
       ORDER BY h.dia_semana, h.hora_inicio`,
      [id_usuario]
    );

    res.json(result.rows);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/**
 * ==============================
 * ACTUALIZAR HORARIO
 * ==============================
 */
exports.actualizarHorario = async (req, res) => {
  const { id } = req.params;
  const { dia_semana, hora_inicio, hora_fin } = req.body;
  const id_usuario = req.usuario.id_usuario;

  try {
    const result = await pool.query(
      `UPDATE horarios h
       SET dia_semana = $1,
           hora_inicio = $2,
           hora_fin = $3
       FROM materias m
       JOIN periodos p ON m.id_periodo = p.id_periodo
       WHERE h.id_horario = $4
         AND h.id_materia = m.id_materia
         AND p.id_usuario = $5
       RETURNING h.*`,
      [dia_semana, hora_inicio, hora_fin, id, id_usuario]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Horario no encontrado' });
    }

    res.json(result.rows[0]);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/**
 * ==============================
 * ELIMINAR HORARIO
 * ==============================
 */
exports.eliminarHorario = async (req, res) => {
  const { id } = req.params;
  const id_usuario = req.usuario.id_usuario;

  try {
    const result = await pool.query(
      `DELETE FROM horarios h
       USING materias m
       JOIN periodos p ON m.id_periodo = p.id_periodo
       WHERE h.id_horario = $1
         AND h.id_materia = m.id_materia
         AND p.id_usuario = $2
       RETURNING h.*`,
      [id, id_usuario]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Horario no encontrado' });
    }

    res.json({ message: 'Horario eliminado correctamente' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
