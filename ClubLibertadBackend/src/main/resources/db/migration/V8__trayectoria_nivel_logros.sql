-- ===================================================================
-- V8: Trayectoria, nivel competitivo y logros (ECU-10 / ECU-11)
-- ===================================================================

ALTER TABLE perfiles
    ADD COLUMN nivel_estrellas       NUMERIC(2, 1),
    ADD COLUMN nivel_calculado_en    TIMESTAMP,
    ADD COLUMN total_concursos       INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN total_participaciones INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN total_primeros        INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN promedio_posicion     NUMERIC(5, 2);

COMMENT ON COLUMN perfiles.nivel_estrellas IS 'Nivel competitivo de 0.0 a 5.0 estrellas';
COMMENT ON COLUMN perfiles.nivel_calculado_en IS 'Última fecha de cálculo del nivel';
COMMENT ON COLUMN perfiles.total_concursos IS 'Cantidad de concursos con resultados publicados';
COMMENT ON COLUMN perfiles.total_participaciones IS 'Cantidad de resultados publicados';
COMMENT ON COLUMN perfiles.total_primeros IS 'Cantidad de primeros puestos';
COMMENT ON COLUMN perfiles.promedio_posicion IS 'Promedio de posiciones obtenidas';

CREATE TABLE logros (
    id_logro       BIGSERIAL PRIMARY KEY,
    id_usuario     BIGINT NOT NULL,
    id_concurso    BIGINT NOT NULL,
    id_categoria   BIGINT NOT NULL,
    tipo           VARCHAR(20) NOT NULL,
    descripcion    VARCHAR(255) NOT NULL,
    fecha          DATE,
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_logro_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE,
    CONSTRAINT fk_logro_concurso
        FOREIGN KEY (id_concurso) REFERENCES concursos(id_concurso)
        ON DELETE CASCADE,
    CONSTRAINT fk_logro_categoria
        FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria),
    CONSTRAINT uk_logro
        UNIQUE (id_usuario, id_concurso, id_categoria, tipo),
    CONSTRAINT chk_logro_tipo
        CHECK (tipo IN ('CAMPEON', 'SUBCAMPEON', 'TERCER_LUGAR'))
);

CREATE INDEX idx_logros_usuario ON logros(id_usuario);
CREATE INDEX idx_logros_fecha ON logros(fecha);

COMMENT ON TABLE logros IS 'Logros obtenidos por un bailarín en concursos publicados';
