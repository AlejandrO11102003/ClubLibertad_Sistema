-- ===================================================================
-- V5: Concursos y categorías (ECU-04)
-- ===================================================================

CREATE TABLE categorias (
    id_categoria   BIGSERIAL PRIMARY KEY,
    nombre         VARCHAR(100) NOT NULL UNIQUE,
    edad_min       INTEGER,
    edad_max       INTEGER,
    genero         VARCHAR(20),

    CONSTRAINT chk_categoria_edades
        CHECK (edad_min IS NULL OR edad_max IS NULL OR edad_min <= edad_max)
);

CREATE TABLE concursos (
    id_concurso    BIGSERIAL PRIMARY KEY,
    nombre         VARCHAR(200) NOT NULL,
    banner_url     VARCHAR(500),
    fecha_inicio   DATE NOT NULL,
    fecha_fin      DATE,
    lugar          VARCHAR(200) NOT NULL,
    estado         VARCHAR(20) NOT NULL DEFAULT 'BORRADOR',
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_concurso_estado
        CHECK (estado IN ('BORRADOR', 'PUBLICADO', 'CERRADO')),
    CONSTRAINT chk_concurso_fechas
        CHECK (fecha_fin IS NULL OR fecha_fin >= fecha_inicio)
);

CREATE TABLE concurso_categorias (
    id_concurso_categoria BIGSERIAL PRIMARY KEY,
    id_concurso           BIGINT NOT NULL,
    id_categoria          BIGINT NOT NULL,
    cupo                  INTEGER,
    precio                NUMERIC(10, 2),

    CONSTRAINT fk_cc_concurso
        FOREIGN KEY (id_concurso) REFERENCES concursos(id_concurso)
        ON DELETE CASCADE,
    CONSTRAINT fk_cc_categoria
        FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria),
    CONSTRAINT uk_cc_concurso_categoria
        UNIQUE (id_concurso, id_categoria),
    CONSTRAINT chk_cc_cupo CHECK (cupo IS NULL OR cupo >= 0),
    CONSTRAINT chk_cc_precio CHECK (precio IS NULL OR precio >= 0)
);

CREATE INDEX idx_concursos_estado ON concursos(estado);
CREATE INDEX idx_concursos_fecha ON concursos(fecha_inicio);
CREATE INDEX idx_cc_concurso ON concurso_categorias(id_concurso);
CREATE INDEX idx_cc_categoria ON concurso_categorias(id_categoria);

COMMENT ON TABLE concursos IS 'Concursos de marinera creados por el administrador';
COMMENT ON TABLE categorias IS 'Categorías de competencia por edad y modalidad';
COMMENT ON TABLE concurso_categorias IS 'Categorías habilitadas por concurso, con cupo y precio';

-- ===================================================================
-- Categorías base
-- ===================================================================
INSERT INTO categorias (nombre, edad_min, edad_max, genero)
VALUES
    ('Pre-Infante', 0, 6, 'Mixto'),
    ('Infante', 7, 9, 'Mixto'),
    ('Infantil', 10, 13, 'Mixto'),
    ('Junior', 14, 17, 'Mixto'),
    ('Juvenil', 18, 21, 'Mixto'),
    ('Adultos', 22, 34, 'Mixto'),
    ('Senior', 35, 49, 'Mixto'),
    ('Master', 50, 64, 'Mixto'),
    ('Oro', 65, 120, 'Mixto')
ON CONFLICT (nombre) DO NOTHING;
