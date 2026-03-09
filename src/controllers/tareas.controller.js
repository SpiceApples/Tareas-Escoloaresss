const pool = require('../config/db');

/**
 * ==============================
 * CREAR TAREA
 * ==============================
 */
exports.crearTarea = async (req, res) => {
  const { titulo, descripcion, fecha_entrega, id_materia } = req.body;
  const id_usuario = req.usuario.id_usuario;

  if (!titulo || !fecha_entrega || !id_materia) {
    return res.status(400).json({ error: 'Campos obligatorios faltantes' });
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
      `INSERT INTO tareas (titulo, descripcion, fecha_entrega, id_materia)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [titulo, descripcion, fecha_entrega, id_materia]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/**
 * ==============================
 * LISTAR TODAS LAS TAREAS
 * ==============================
 */
exports.obtenerTodasLasTareas = async (req, res) => {
  const id_usuario = req.usuario.id_usuario;

  try {
    const result = await pool.query(
      `SELECT t.*, m.nombre AS materia
       FROM tareas t
       JOIN materias m ON t.id_materia = m.id_materia
       JOIN periodos p ON m.id_periodo = p.id_periodo
       WHERE p.id_usuario = $1
       ORDER BY t.fecha_entrega ASC`,
      [id_usuario]
    );

    res.json(result.rows);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/**
 * ==============================
 * MARCAR COMO COMPLETADA
 * ==============================
 */
exports.marcarComoCompletada = async (req, res) => {
  const { id } = req.params;
  const id_usuario = req.usuario.id_usuario;

  try {
    const result = await pool.query(
      `UPDATE tareas t
       SET completada = TRUE
       FROM materias m
       JOIN periodos p ON m.id_periodo = p.id_periodo
       WHERE t.id_tarea = $1
         AND t.id_materia = m.id_materia
         AND p.id_usuario = $2
       RETURNING t.*`,
      [id, id_usuario]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    res.json(result.rows[0]);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * ==============================
 * OBTENER TAREA POR ID
 * ==============================
 */
exports.obtenerTareaPorId = async (req, res) => {
  const { id } = req.params;
  const id_usuario = req.usuario.id_usuario;

  try {
    const result = await pool.query(
      `SELECT t.*, m.nombre AS materia
       FROM tareas t
       JOIN materias m ON t.id_materia = m.id_materia
       JOIN periodos p ON m.id_periodo = p.id_periodo
       WHERE t.id_tarea = $1
         AND p.id_usuario = $2`,
      [id, id_usuario]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    res.json(result.rows[0]);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * ==============================
 * ACTUALIZAR TAREA
 * ==============================
 */
exports.actualizarTarea = async (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, fecha_entrega } = req.body;
  const id_usuario = req.usuario.id_usuario;

  try {
    const result = await pool.query(
      `UPDATE tareas t
       SET titulo = $1,
           descripcion = $2,
           fecha_entrega = $3
       FROM materias m
       JOIN periodos p ON m.id_periodo = p.id_periodo
       WHERE t.id_tarea = $4
         AND t.id_materia = m.id_materia
         AND p.id_usuario = $5
       RETURNING t.*`,
      [titulo, descripcion, fecha_entrega, id, id_usuario]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada o no autorizada' });
    }

    res.json(result.rows[0]);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * ==============================
 * ELIMINAR TAREA
 * ==============================
 */
exports.eliminarTarea = async (req, res) => {
  const { id } = req.params;
  const id_usuario = req.usuario.id_usuario;

  try {
    const result = await pool.query(
      `DELETE FROM tareas t
       USING materias m
       JOIN periodos p ON m.id_periodo = p.id_periodo
       WHERE t.id_tarea = $1
         AND t.id_materia = m.id_materia
         AND p.id_usuario = $2
       RETURNING t.*`,
      [id, id_usuario]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada o no autorizada' });
    }

    res.json({ message: 'Tarea eliminada correctamente' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * ==============================
 * CONSULTAS ESPECIALES
 *  => TAREAS PENDIENTES
 * ==============================
 */
 exports.tareasPendientes = async (req, res) => {
  const id_usuario = req.usuario.id_usuario;

  const result = await pool.query(
    `SELECT t.*, m.nombre AS materia
     FROM tareas t
     JOIN materias m ON t.id_materia = m.id_materia
     JOIN periodos p ON m.id_periodo = p.id_periodo
     WHERE p.id_usuario = $1
       AND t.completada = FALSE
       AND t.fecha_entrega >= CURRENT_DATE
     ORDER BY t.fecha_entrega ASC`,
    [id_usuario]
  );

  res.json(result.rows);
};

/**
 * ==============================
 * CONSULTAS ESPECIALES
 *  => TAREAS VENCIDAS
 * ==============================
 */
 exports.tareasVencidas = async (req, res) => {
  const id_usuario = req.usuario.id_usuario;

  const result = await pool.query(
    `SELECT t.*, m.nombre AS materia
     FROM tareas t
     JOIN materias m ON t.id_materia = m.id_materia
     JOIN periodos p ON m.id_periodo = p.id_periodo
     WHERE p.id_usuario = $1
       AND t.completada = FALSE
       AND t.fecha_entrega < CURRENT_DATE
     ORDER BY t.fecha_entrega ASC`,
    [id_usuario]
  );

  res.json(result.rows);
};


/**
 * ==============================
 * CONSULTAS ESPECIALES
 *  => TAREAS COMPLETADAS
 * ==============================
 */
 exports.tareasCompletadas = async (req, res) => {
  const id_usuario = req.usuario.id_usuario;

  const result = await pool.query(
    `SELECT t.*, m.nombre AS materia
     FROM tareas t
     JOIN materias m ON t.id_materia = m.id_materia
     JOIN periodos p ON m.id_periodo = p.id_periodo
     WHERE p.id_usuario = $1
       AND t.completada = TRUE
     ORDER BY t.fecha_entrega DESC`,
    [id_usuario]
  );

  res.json(result.rows);
};
