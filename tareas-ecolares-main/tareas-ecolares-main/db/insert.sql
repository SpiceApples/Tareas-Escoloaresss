
Agregar datos a las tablas de la bd de postgresql
-- =================
-- USUARIO DE PRUEBA
-- =================
INSERT INTO usuarios (nombre, correo, password) 
VALUES ('Antonio Huh', 'antonio.huh@upb.edu.mx','12345678');

-- =================
-- PERIODO DE PRUEBA
-- =================
INSERT INTO periodos (nombre, fecha_inicio, fecha_fin,id_usuario) 
VALUES ('2026-1','2026-01-05','2026-04-30',1);

-- =================
-- MATERIA DE PRUEBA
-- =================
INSERT INTO materias (nombre, profesor,id_periodo) 
VALUES ('Base de datos', 'Prof. Daniel Villegas',1);

-- =================
-- HORARIO DE PRUEBA
-- =================
INSERT INTO horarios (dia_semana, hora_inicio, hora_fin,id_materia) 
VALUES ('Lun', '7:00','9:30',1);
INSERT INTO horarios (dia_semana, hora_inicio, hora_fin,id_materia) 
VALUES ('Mie', '10:30','13:00',1);


-- =================
-- TAREA DE PRUEBA
-- =================

-- =================
-- EJECUTAR EL ARCHIVO SQL




-- =================
-- psql -U postgres -d bdtareas -f C:\Users\esdraschuc\Documents\code\proyecto_tareas\db\datos_prueba.sql
-- psql -U usuario -d nombre_base_datos -f ruta/al/archivo.sql
INSERT INTO tareas (titulo, descripcion, fecha_entrega,completada, id_materia) 
