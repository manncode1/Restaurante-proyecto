-- Esquema base. Compatible con MySQL 5.7+ y MariaDB 10.3+ (hosting compartido).
-- Se puede ejecutar varias veces: solo crea las tablas que falten.
-- Cambios futuros: crea un archivo nuevo (003_..., 004_...) en vez de editar este,
-- así cada instalación aplica solo lo que le falta.
SET NAMES utf8mb4;

-- Datos editables del sitio (nombre, horario, redes...). Las claves las define
-- 002_configuracion.sql; desde el panel solo se modifica el valor.
CREATE TABLE IF NOT EXISTS configuracion (
  clave VARCHAR(60) PRIMARY KEY,
  valor TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Secciones del menú; `orden` define el orden de los filtros y de los grupos de platillos
-- (dentro de cada categoría los platillos van en orden alfabético).
CREATE TABLE IF NOT EXISTS categorias (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(60) NOT NULL UNIQUE,
  orden INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS productos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  categoria_id INT NOT NULL,
  nombre VARCHAR(120) NOT NULL,
  descripcion TEXT NULL,
  precio DECIMAL(10,2) NOT NULL,
  disponible TINYINT(1) NOT NULL DEFAULT 1,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Fotos de productos (producto_id) o generales del sitio (producto_id NULL).
-- `ubicacion` es una ruta relativa al sitio, p. ej. backend/uploads/tacos.jpg
CREATE TABLE IF NOT EXISTS fotos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  producto_id INT NULL,
  ubicacion VARCHAR(255) NOT NULL,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Usuarios del panel de administración (password_hash() de PHP).
CREATE TABLE IF NOT EXISTS usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario VARCHAR(60) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
