const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/auth.middleware');
const controller = require('../controllers/tareas.controller');

/*
Endpoints:
http://localhost:3000/api/tareas/ metodo POST nueva tarea
http://localhost:3000/api/treas metodo GET listar todas tareas
http://localhost:3000/api/tareas/id/metodo GET  listar 1 tarea
http://localhost:3000/api/tareas/id metodo PUT actualizar tarea
http://localhost:3000/api/tareas/completar metodo PATCH cambiar estado
http://localhost:3000/api/tareas/id metodo DELETE borrar tarea
http://localhost:3000/api/tareas/estado/pendientes metodo GET
http://localhost:3000/api/tareas/estado/vencidas   metodo GET
http://localhost:3000/api/tareas/estado/completadas metodo GET

*/
//Crear una nueva tarea 
router.post('/', verificarToken, controller.crearTarea);

//consultar todas las tareas
router.get('/', verificarToken, controller.obtenerTodasLasTareas);

//consultar una tareas segun su id
router.get('/:id', verificarToken, controller.obtenerTareaPorId);

//actualizar un tarea
router.put('/:id', verificarToken, controller.actualizarTarea);

// marcar como completa una tarea
router.patch('/:id/completar', verificarToken, controller.marcarComoCompletada);

//eliminar tarea por id
router.delete('/:id', verificarToken, controller.eliminarTarea);

//endpoints adicionales 

//tareas pendientes
router.get('/estado/pendientes', verificarToken, controller.tareasPendientes);

//tareas vencidas
router.get('/estado/vencidas', verificarToken, controller.tareasVencidas);

//tareas completadas
router.get('/estado/completadas', verificarToken, controller.tareasCompletadas);

module.exports = router;



