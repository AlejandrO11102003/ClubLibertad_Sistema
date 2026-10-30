-- ===================================================================
-- V1: Esquema inicial
-- Entre Pañuelos - PostgreSQL
-- ===================================================================

-- ===================================================================
-- Tabla: usuarios (RF-01)
-- ===================================================================
CREATE TABLE usuarios (
    id_usuario        BIGSERIAL PRIMARY KEY,
    dni               VARCHAR(8)   NOT NULL UNIQUE,
    anio_nacimiento   INTEGER      NOT NULL,
    password_hash     VARCHAR(255) NOT NULL,
    rol               VARCHAR(20)  NOT NULL DEFAULT 'BAILARIN',
    activo            BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_dni_formato       CHECK (dni ~ '^[0-9]{8}$'),
    CONSTRAINT chk_anio_nacimiento   CHECK (anio_nacimiento BETWEEN 1900 AND 2100),
    CONSTRAINT chk_rol               CHECK (rol IN ('BAILARIN', 'ADMIN'))
);

CREATE INDEX idx_usuarios_dni ON usuarios(dni);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);

COMMENT ON TABLE  usuarios IS 'Cuentas de acceso al sistema';
COMMENT ON COLUMN usuarios.dni IS 'DNI de 8 dígitos - privado, nunca se expone en perfiles públicos';
COMMENT ON COLUMN usuarios.anio_nacimiento IS 'Año de nacimiento del bailarín (para validar categoría)';
COMMENT ON COLUMN usuarios.password_hash IS 'Hash BCrypt de la contraseña';
COMMENT ON COLUMN usuarios.rol IS 'Rol del usuario: BAILARIN o ADMIN';

-- ===================================================================
-- Tabla: perfiles (RF-02)
-- ===================================================================
CREATE TABLE perfiles (
    id_perfil          BIGSERIAL PRIMARY KEY,
    id_usuario         BIGINT       NOT NULL UNIQUE,
    nombre             VARCHAR(100),
    apellido           VARCHAR(100),
    fotografia_url     VARCHAR(500),
    ciudad             VARCHAR(100),
    anio_inicio        INTEGER,
    academia_actual    VARCHAR(200),
    marinera_favorita  VARCHAR(100),
    biografia          VARCHAR(1000),
    created_at         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_perfil_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE,

    CONSTRAINT chk_anio_inicio CHECK (anio_inicio IS NULL OR anio_inicio BETWEEN 1900 AND 2100)
);

CREATE INDEX idx_perfiles_usuario ON perfiles(id_usuario);
CREATE INDEX idx_perfiles_ciudad  ON perfiles(ciudad);

COMMENT ON TABLE  perfiles IS 'Información pública y deportiva del bailarín';
COMMENT ON COLUMN perfiles.anio_inicio IS 'Año en que inició en la marinera';
COMMENT ON COLUMN perfiles.marinera_favorita IS 'Marinera norteña, limeña, puneña, etc.';