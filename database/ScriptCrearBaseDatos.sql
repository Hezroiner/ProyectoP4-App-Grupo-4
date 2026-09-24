-- =============================================================
-- Universidad Nacional - EIF509
-- Proyecto 1 - Parte 2 - PostgreSQL
-- Tema: Juegos de videos y competencias
-- Responsable Parte 2: Andrea
-- Base de datos exigida por el enunciado: BDPostgreSQL
-- Referencia de implementacion: Semana 4
-- =============================================================

-- IMPORTANTE:
-- PostgreSQL no utiliza USE para cambiar de base de datos.
-- En pgAdmin ejecute este archivo en dos pasos:
--   1) Conectado a la base "postgres", ejecute solamente CREATE DATABASE.
--   2) Abra Query Tool sobre "BDPostgreSQL" y ejecute los CREATE TABLE.

-- =============================================================
-- PASO 1 - CREAR LA BASE DE DATOS
-- =============================================================

CREATE DATABASE "BDPostgreSQL";

-- =============================================================
-- PASO 2 - CONECTARSE A BDPostgreSQL Y CREAR LAS 4 TABLAS
-- =============================================================

-- =============================================================
-- VISTA 1: VIDEOJUEGOS
-- TABLA 1: videojuegos
-- 8 campos de informacion sin contar la llave primaria.
-- El campo de imagen se almacena como BYTEA.
-- =============================================================

CREATE TABLE videojuegos (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(120) NOT NULL,
    categoria VARCHAR(80) NOT NULL,
    desarrolladora VARCHAR(120) NOT NULL,
    fecha_lanzamiento DATE NOT NULL,
    clasificacion_edad VARCHAR(40) NOT NULL,
    modalidad_juego VARCHAR(80) NOT NULL,
    estado_videojuego VARCHAR(40) NOT NULL,
    portada_videojuego BYTEA
);

-- =============================================================
-- VISTA 1: VIDEOJUEGOS
-- TABLA 2: equipos
-- 8 campos de informacion sin contar PK/FK.
-- Relacion de la Vista 1:
-- videojuegos.id -> equipos.videojuego_id
-- =============================================================

CREATE TABLE equipos (
    id SERIAL PRIMARY KEY,
    videojuego_id INTEGER NOT NULL,
    nombre_equipo VARCHAR(120) NOT NULL,
    siglas VARCHAR(20) NOT NULL,
    region_equipo VARCHAR(80) NOT NULL,
    entrenador VARCHAR(120) NOT NULL,
    fecha_fundacion DATE NOT NULL,
    ranking_equipo INTEGER NOT NULL,
    patrocinador_equipo VARCHAR(120) NOT NULL,
    logo_equipo BYTEA,
    CONSTRAINT fk_equipos_videojuegos
        FOREIGN KEY (videojuego_id)
        REFERENCES videojuegos(id)
);

-- =============================================================
-- VISTA 2: COMPETENCIAS
-- TABLA 3: competencias
-- 8 campos de informacion diferentes a los campos de la Vista 1,
-- sin contar PK/FK.
-- Cada competencia pertenece a un videojuego.
-- =============================================================

CREATE TABLE competencias (
    id SERIAL PRIMARY KEY,
    videojuego_id INTEGER NOT NULL,
    nombre_competencia VARCHAR(140) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_final DATE NOT NULL,
    sede_competencia VARCHAR(120) NOT NULL,
    premio_total NUMERIC(12,2) NOT NULL,
    formato_torneo VARCHAR(100) NOT NULL,
    estado_competencia VARCHAR(50) NOT NULL,
    banner_competencia BYTEA,
    CONSTRAINT fk_competencias_videojuegos
        FOREIGN KEY (videojuego_id)
        REFERENCES videojuegos(id)
);

-- =============================================================
-- VISTA 2: COMPETENCIAS
-- TABLA 4: encuentros
-- 8 campos de informacion diferentes a los campos de la Vista 1,
-- sin contar PK/FK.
-- Relacion principal de la Vista 2:
-- competencias.id -> encuentros.competencia_id
-- Un encuentro enfrenta dos equipos.
-- =============================================================

CREATE TABLE encuentros (
    id SERIAL PRIMARY KEY,
    competencia_id INTEGER NOT NULL,
    equipo_1_id INTEGER NOT NULL,
    equipo_2_id INTEGER NOT NULL,
    ronda_encuentro VARCHAR(80) NOT NULL,
    fecha_encuentro DATE NOT NULL,
    hora_encuentro TIME NOT NULL,
    puntaje_equipo_1 INTEGER NOT NULL,
    puntaje_equipo_2 INTEGER NOT NULL,
    formato_serie VARCHAR(60) NOT NULL,
    estado_encuentro VARCHAR(50) NOT NULL,
    imagen_encuentro BYTEA,
    CONSTRAINT fk_encuentros_competencias
        FOREIGN KEY (competencia_id)
        REFERENCES competencias(id),
    CONSTRAINT fk_encuentros_equipo_1
        FOREIGN KEY (equipo_1_id)
        REFERENCES equipos(id),
    CONSTRAINT fk_encuentros_equipo_2
        FOREIGN KEY (equipo_2_id)
        REFERENCES equipos(id)
);
-- NOTA DE ORDEN DE DATOS:
-- ScriptPopularBaseDatos.sql inserta Dota 2 en la posicion/ID 1 y
-- League of Legends en la posicion/ID 5. Las llaves foraneas del
-- script de poblado fueron ajustadas para conservar las relaciones.

