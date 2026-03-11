const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/auth.middleware');
const controller = require('../controllers/horarios.controller');

//http://localhost:3000/api/horarios/  metodos: post nuevo horario
//http://localhost:3000/api/horarios/materia/id  metodos: getconsultar horarios de una materia
//http://localhost:3000/api/horarios/  metodos: get consultar horario completo del usuario
//http://localhost:3000/api/horarios/id  metodos: put actualizar horario
//http://localhost:3000/api/horarios/id  metodos: delete eliminar horario



// Endpoints para horarios:
router.post('/', verificarToken, controller.crearHorario);

// Endpoint para obtener los horarios de una materia específica
router.get('/materia/:id_materia', verificarToken, controller.obtenerHorariosPorMateria);

// Endpoint para obtener el horario completo del usuario, incluyendo materias y tareas asociadas
router.get('/', verificarToken, controller.obtenerHorarioCompleto);

// Endpoint para actualizar un horario específico
router.put('/:id', verificarToken, controller.actualizarHorario);

// Endpoint para eliminar un horario específico
router.delete('/:id', verificarToken, controller.eliminarHorario);

module.exports = router;