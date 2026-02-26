const express = require('express');
const router = express.Router();
const { getTareas } = require('../controllers/tareas.controller');

// Definimos la ruta GET para obtener las tareas
router.get('/', getTareas);

module.exports = router;