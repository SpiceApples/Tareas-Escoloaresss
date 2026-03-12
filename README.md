# Tareas-Escolares - Backend

Backend del proyecto **Tareas-Escolares**. Este servicio expone la logica principal del sistema.

## Contenido
- Descripcion
- Requisitos
- Instalacion y ejecucion
- Scripts
- Endpoints
- Backend (herramientas y librerias)

## Descripcion
API backend para el proyecto **Tareas-Escolares**.

## Requisitos
- Node.js y npm instalados

## Instalacion y ejecucion
```bash
npm install
npm run dev
```

## Scripts
- `npm run dev`: Ejecuta el servidor en modo desarrollo con recarga automatica.

## Endpoints
Tabla con los endpoints disponibles en el backend:

| Endpoint | Metodo | Descripcion |
| --- | --- | --- |
| `/api/auth/register` | POST | Registrar un nuevo usuario |
| `/api/auth/login` | POST | Autenticar usuario |
| `/api/periodos/` | POST | Crear un periodo |
| `/api/periodos/` | GET | Listar periodos del usuario |
| `/api/periodos/:id` | GET | Obtener un periodo por id |
| `/api/periodos/:id` | PUT | Actualizar un periodo |
| `/api/periodos/:id` | DELETE | Eliminar un periodo |
| `/api/materias/` | POST | Crear una materia |
| `/api/materias/` | GET | Listar todas las materias |
| `/api/materias/:id_periodo` | GET | Listar materias por periodo |
| `/api/materias/detalle/:id` | GET | Obtener detalle de una materia |
| `/api/materias/:id` | PUT | Actualizar una materia |
| `/api/materias/:id` | DELETE | Eliminar una materia |
| `/api/horarios/` | POST | Crear un horario |
| `/api/horarios/materia/:id_materia` | GET | Obtener horarios por materia |
| `/api/horarios/` | GET | Obtener horario completo del usuario |
| `/api/horarios/:id` | PUT | Actualizar un horario |
| `/api/horarios/:id` | DELETE | Eliminar un horario |
| `/api/tareas/` | POST | Crear una tarea |
| `/api/tareas/` | GET | Listar todas las tareas |
| `/api/tareas/:id` | GET | Obtener una tarea por id |
| `/api/tareas/:id` | PUT | Actualizar una tarea |
| `/api/tareas/:id/completar` | PATCH | Marcar tarea como completada |
| `/api/tareas/:id` | DELETE | Eliminar una tarea |
| `/api/tareas/estado/pendientes` | GET | Listar tareas pendientes |
| `/api/tareas/estado/vencidas` | GET | Listar tareas vencidas |
| `/api/tareas/estado/completadas` | GET | Listar tareas completadas |

## Backend (herramientas y librerias)
Tabla de dependencias usadas en el backend para reproducir el entorno:

| Categoria | Herramienta / Libreria | Version | Proposito |
| --- | --- | --- | --- |
| Runtime | express | ^5.2.1 | Framework web para API HTTP |
| Runtime | cors | ^2.8.6 | Habilita CORS para clientes externos |
| Runtime | dotenv | ^17.3.1 | Carga variables de entorno desde `.env` |
| Runtime | bcrypt | ^6.0.0 | Hash de contrasenas |
| Runtime | jsonwebtoken | ^9.0.3 | Autenticacion basada en JWT |
| Runtime | pg | ^8.18.0 | Cliente de PostgreSQL |
| Desarrollo | nodemon | ^3.1.14 | Reinicio automatico en cambios |
 
