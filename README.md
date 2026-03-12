# Tareas-Escolares - Backend

Backend del proyecto **Tareas-Escolares**. Este servicio expone la logica principal del sistema.

## Contenido
- Descripcion
- Requisitos
- Instalacion y ejecucion
- Scripts
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
