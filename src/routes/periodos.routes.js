const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/auth.middleware');
const controller = require('../controllers/periodos.controller');

// Crear periodo
router.post('/', verificarToken, controller.crearPeriodo);

// Listar periodos del usuario
router.get('/', verificarToken, controller.obtenerPeriodos);

// Obtener un periodo específico
router.get('/:id', verificarToken, controller.obtenerPeriodoPorId);

// Actualizar periodo
router.put('/:id', verificarToken, controller.actualizarPeriodo);

// Eliminar periodo
router.delete('/:id', verificarToken, controller.eliminarPeriodo);

module.exports = router;
