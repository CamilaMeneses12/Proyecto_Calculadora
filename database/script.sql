-- =========================================
-- BASE DE DATOS: login_db
-- =========================================

DROP DATABASE IF EXISTS login_db;
CREATE DATABASE login_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE login_db;

-- -------------------------
-- TABLA: usuarios
-- -------------------------
CREATE TABLE usuarios (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    nombre        VARCHAR(100)  NOT NULL,
    email         VARCHAR(150)  NOT NULL UNIQUE,
    password      VARCHAR(255)  NOT NULL,
    telefono      VARCHAR(10)   NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------
-- TABLA: calculos
-- Guarda el historial de la calculadora por usuario
-- -------------------------
CREATE TABLE calculos (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id  INT          NOT NULL,
    operacion   VARCHAR(255) NOT NULL,
    resultado   VARCHAR(100) NOT NULL,
    fecha       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- -------------------------
-- Usuario de prueba (contraseña sin cifrar — se usa solo para pruebas visuales)
-- Para login real registrarse desde el formulario
-- -------------------------
-- INSERT INTO usuarios (nombre, email, password, telefono)
-- VALUES ('Admin SENA', 'admin@sena.edu.co', '$2b$10$...hash...', '3001234567');

SELECT 'Base de datos lista ✓' AS estado;
