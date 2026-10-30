-- ===================================================================
-- V7: Resultados oficiales e importaciones desde Excel (ECU-08)
-- ===================================================================

CREATE TABLE resultados (
    id_resultado    BIGSERIAL PRIMARY KEY,
    id_concurso     BIGINT NOT NULL,
    id_categoria    BIGINT NOT NULL,
    id_inscripcion  BIGINT NOT NULL,
    posicion        INTEGER NOT NULL,
    puntaje         NUMERIC(10, 2),
    publicado       BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_resultado_concurso
        FOREIGN KEY (id_concurso) REFERENCES concursos(id_concurso)
        ON DELETE CASCADE,
    CONSTRAINT fk_resultado_categoria
        FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria),
    CONSTRAINT fk_resultado_inscripcion
        FOREIGN KEY (id_inscripcion) REFERENCES inscripciones(id_inscripcion)
        ON DELETE CASCADE,
    CONSTRAINT uk_resultado_inscripcion
        UNIQUE (id_concurso, id_categoria, id_inscripcion),
    CONSTRAINT chk_resultado_posicion CHECK (posicion > 0),
    CONSTRAINT chk_resultado_puntaje CHECK (puntaje IS NULL OR puntaje >= 0)
);

CREATE INDEX idx_resultados_concurso ON resultados(id_concurso);
CREATE INDEX idx_resultados_categoria ON resultados(id_categoria);
CREATE INDEX idx_resultados_publicado ON resultados(id_concurso, publicado);
CREATE INDEX idx_resultados_posicion ON resultados(id_concurso, id_categoria, posicion);

COMMENT ON TABLE resultados IS 'Resultados oficiales por inscripción y categoría';
COMMENT ON COLUMN resultados.publicado IS 'Indica si el resultado ya es visible para los bailarines';

CREATE TABLE importaciones (
    id_importacion   BIGSERIAL PRIMARY KEY,
    id_usuario       BIGINT NOT NULL,
    archivo          VARCHAR(255) NOT NULL,
    estado           VARCHAR(20) NOT NULL,
    filas_validas    INTEGER NOT NULL DEFAULT 0,
    filas_invalidas  INTEGER NOT NULL DEFAULT 0,
    detalle_errores  TEXT,
    created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_importacion_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    CONSTRAINT chk_importacion_estado
        CHECK (estado IN ('COMPLETADA', 'CON_ERRORES')),
    CONSTRAINT chk_importacion_filas
        CHECK (filas_validas >= 0 AND filas_invalidas >= 0)
);

CREATE INDEX idx_importaciones_fecha ON importaciones(created_at);
CREATE INDEX idx_importaciones_usuario ON importaciones(id_usuario);

COMMENT ON TABLE importaciones IS 'Registro de cargas de resultados desde Excel';
COMMENT ON COLUMN importaciones.detalle_errores IS 'Errores por fila, separados por saltos de línea';
