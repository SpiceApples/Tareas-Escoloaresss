const express = require('express');
const router = express.Router();
const { getTareas, createTarea } = require('../controllers/tareas.controller');

router.get('/', getTareas);
router.post('/', createTarea);

module.exports = router;