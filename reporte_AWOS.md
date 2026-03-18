# Libreta de trabajo AWOS

Acá vamos a tener los códigos e instrucciones para el proyecto de tareas escolares

Agregar esto al archivo .gitignore
```
node_modules/
.env
.DS_Store
```

Crear tablas
```
Primero la base de datos
CREATE DATABASE dbtareas;

Cambiarse a la base de datos
\c dbtareas

Ejecutar los querys de creación de tablas
CREATE TABLE usuarios (
id_usuario SERIAL PRIMARY KEY,
nombre VARCHAR(100) NOT NULL,
correo VARCHAR(100) UNIQUE NOT NULL,
password VARCHAR(255) NOT NULL,
fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE periodos (
id_periodo SERIAL PRIMARY KEY,
nombre VARCHAR(100) NOT NULL,
fecha_inicio DATE NOT NULL,
fecha_fin DATE NOT NULL,
id_usuario INT NOT NULL,
CONSTRAINT fk_periodo_usuario
FOREIGN KEY (id_usuario)
REFERENCES usuarios(id_usuario)
ON DELETE CASCADE
);

CREATE TABLE materias (
id_materia SERIAL PRIMARY KEY,
nombre VARCHAR(100) NOT NULL,
profesor VARCHAR(100),
id_periodo INT NOT NULL,
CONSTRAINT fk_materia_periodo
FOREIGN KEY (id_periodo)
REFERENCES periodos(id_periodo)
ON DELETE CASCADE
);

CREATE TABLE horarios (
id_horario SERIAL PRIMARY KEY,
dia_semana CHAR(3) NOT NULL,
hora_inicio TIME NOT NULL,
hora_fin TIME NOT NULL,
id_materia INT NOT NULL,
CONSTRAINT chk_dia_semana
CHECK (dia_semana IN ('Lun', 'Mar', 'Mie', 'Jue', 'Vie')),
CONSTRAINT fk_horario_materia
FOREIGN KEY (id_materia)
REFERENCES materias(id_materia)
ON DELETE CASCADE
);

CREATE TABLE tareas (
id_tarea SERIAL PRIMARY KEY,
titulo VARCHAR(200) NOT NULL,
descripcion TEXT,
fecha_entrega DATE,
completada BOOLEAN DEFAULT FALSE,
id_materia INT NOT NULL,
CONSTRAINT fk_tarea_materia
FOREIGN KEY (id_materia)
REFERENCES materias(id_materia)
ON DELETE CASCADE
);
```

## Capturas de Pantalla de la Ejecución del Proyecto

> *Nota: Por favor inserta aquí al menos 1 captura de pantalla de cada apartado (Login, Dashboard, Periodos, Materias, Tareas, Horarios) para la exposición de la clase.*

### 1. Login
[Insertar captura de Login]

### 2. Dashboard principal
[Insertar captura del Calendario y Tareas]

### 3. Módulo de Periodos
[Insertar captura de Periodos]

### 4. Módulo de Materias
[Insertar captura de Materias]

### 5. Módulo de Tareas
[Insertar captura de Tareas]

### 6. Módulo de Horarios
[Insertar captura de Horario]
