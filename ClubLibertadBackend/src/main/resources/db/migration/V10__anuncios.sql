-- ===================================================================
-- V10: Anuncios publicitarios del landing (carrusel del hero)
-- ===================================================================

CREATE TABLE anuncios (
    id_anuncio   BIGSERIAL PRIMARY KEY,
    titulo       VARCHAR(120) NOT NULL,
    entidad      VARCHAR(120),
    descripcion  VARCHAR(300),
    imagen_url   VARCHAR(500) NOT NULL,
    enlace_url   VARCHAR(500),
    activo       BOOLEAN NOT NULL DEFAULT TRUE,
    orden        INTEGER NOT NULL DEFAULT 0,
    fecha_inicio DATE,
    fecha_fin    DATE,
    created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_anuncios_activo_orden ON anuncios (activo, orden);
CREATE INDEX idx_anuncios_vigencia ON anuncios (fecha_inicio, fecha_fin);

COMMENT ON TABLE anuncios IS
    'Flyers publicitarios que se muestran en el carrusel del hero del landing';
COMMENT ON COLUMN anuncios.activo IS
    'Interruptor manual de visibilidad';
COMMENT ON COLUMN anuncios.fecha_inicio IS
    'Fecha desde la que se muestra (NULL = sin límite)';
COMMENT ON COLUMN anuncios.fecha_fin IS
    'Fecha hasta la que se muestra (NULL = sin límite)';
COMMENT ON COLUMN anuncios.orden IS
    'Posición dentro del carrusel (menor primero)';
