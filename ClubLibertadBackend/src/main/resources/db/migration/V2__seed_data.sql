-- ===================================================================
-- V2: Datos semilla
-- ===================================================================
-- IMPORTANTE: los hashes BCrypt son de ejemplo.
-- Las contraseñas reales son:
--   admin     → admin123
--   bailarin1 → bailarin123
--   bailarin2 → bailarin123
-- ===================================================================

-- ---------------------------------------------------------------
-- USUARIOS
-- ---------------------------------------------------------------
INSERT INTO usuarios (dni, anio_nacimiento, password_hash, rol, activo)
VALUES
-- admin@entrepanuelo.com (DNI ficticio: 00000001) | password: admin123
('00000001', 1985,
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
 'ADMIN', TRUE),

-- bailarin1 | password: bailarin123
('12345678', 2000,
 '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfgqwUFAxwL6V9bOoVJ8lJZD6E1eK7.G',
 'BAILARIN', TRUE),

-- bailarin2 | password: bailarin123
('87654321', 1998,
 '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfgqwUFAxwL6V9bOoVJ8lJZD6E1eK7.G',
 'BAILARIN', TRUE),

-- bailarin3 | password: bailarin123
('11223344', 2005,
 '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfgqwUFAxwL6V9bOoVJ8lJZD6E1eK7.G',
 'BAILARIN', TRUE);

-- ---------------------------------------------------------------
-- PERFILES
-- ---------------------------------------------------------------
INSERT INTO perfiles
    (id_usuario, nombre, apellido, ciudad, anio_inicio, academia_actual,
     marinera_favorita, biografia)
SELECT
    u.id_usuario,
    p.nombre,
    p.apellido,
    p.ciudad,
    p.anio_inicio,
    p.academia,
    p.marinera,
    p.bio
FROM usuarios u
JOIN (VALUES
    ('00000001', 'Admin',   'General',  'Chiclayo',  2010, 'Entre Pañuelos',    'Norteña', 'Administrador de la plataforma.'),
    ('12345678', 'Sofía',   'Mendoza',  'Trujillo',  2018, 'Club Libertad',      'Norteña', 'Bailarina apasionada por la marinera norteña desde los 10 años.'),
    ('87654321', 'Rodrigo', 'Morales',  'Lima',      2016, 'Academia Doña Pepa', 'Limeña',  'Bailarín con 14 concursos en su trayectoria.'),
    ('11223344', 'Camila',  'Vargas',   'Arequipa',  2020, 'Escuela El Huayno',  'Norteña', 'Joven promesa de la marinera arequipeña.')
) AS p(dni, nombre, apellido, ciudad, anio_inicio, academia, marinera, bio)
ON u.dni = p.dni;