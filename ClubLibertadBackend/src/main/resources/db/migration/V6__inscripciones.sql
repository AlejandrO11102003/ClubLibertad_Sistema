-- ===================================================================
-- V6: Inscripciones con pareja y notificaciones (ECU-05 / ECU-06)
-- ===================================================================

CREATE TABLE inscripciones (
    id_inscripcion     BIGSERIAL PRIMARY KEY,
    id_concurso        BIGINT NOT NULL,
    id_categoria       BIGINT NOT NULL,
    id_solicitante     BIGINT NOT NULL,
    id_pareja          BIGINT NOT NULL,
    estado             VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    fecha_solicitud    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_respuesta    TIMESTAMP,
    fecha_vencimiento  TIMESTAMP NOT NULL,
    created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_ins_concurso
        FOREIGN KEY (id_concurso) REFERENCES concursos(id_concurso),
    CONSTRAINT fk_ins_categoria
        FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria),
    CONSTRAINT fk_ins_solicitante
        FOREIGN KEY (id_solicitante) REFERENCES usuarios(id_usuario),
    CONSTRAINT fk_ins_pareja
        FOREIGN KEY (id_pareja) REFERENCES usuarios(id_usuario),
    CONSTRAINT fk_ins_concurso_categoria
        FOREIGN KEY (id_concurso, id_categoria)
        REFERENCES concurso_categorias(id_concurso, id_categoria),
    CONSTRAINT chk_ins_estado
        CHECK (estado IN ('PENDIENTE', 'CONFIRMADA', 'RECHAZADA', 'VENCIDA')),
    CONSTRAINT chk_ins_parejas_distintas
        CHECK (id_solicitante <> id_pareja)
);

-- Un bailarín no puede tener dos solicitudes activas en la misma categoría.
CREATE UNIQUE INDEX uk_ins_activa_solicitante
    ON inscripciones (id_concurso, id_categoria, id_solicitante)
    WHERE estado IN ('PENDIENTE', 'CONFIRMADA');

CREATE UNIQUE INDEX uk_ins_activa_pareja
    ON inscripciones (id_concurso, id_categoria, id_pareja)
    WHERE estado IN ('PENDIENTE', 'CONFIRMADA');

CREATE INDEX idx_ins_concurso ON inscripciones(id_concurso);
CREATE INDEX idx_ins_categoria ON inscripciones(id_categoria);
CREATE INDEX idx_ins_solicitante ON inscripciones(id_solicitante);
CREATE INDEX idx_ins_pareja ON inscripciones(id_pareja);
CREATE INDEX idx_ins_estado ON inscripciones(estado);

COMMENT ON TABLE inscripciones IS 'Solicitudes de inscripción de una pareja a una categoría de concurso';
COMMENT ON COLUMN inscripciones.id_solicitante IS 'Bailarín que envía la solicitud';
COMMENT ON COLUMN inscripciones.id_pareja IS 'Bailarín que debe aceptar o rechazar';
COMMENT ON COLUMN inscripciones.fecha_vencimiento IS 'Fecha límite para responder la solicitud';

CREATE TABLE notificaciones (
    id_notificacion  BIGSERIAL PRIMARY KEY,
    id_usuario       BIGINT NOT NULL,
    tipo             VARCHAR(30) NOT NULL,
    mensaje          VARCHAR(500) NOT NULL,
    referencia_id    BIGINT,
    leida            BOOLEAN NOT NULL DEFAULT FALSE,
    created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notificacion_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE,
    CONSTRAINT chk_notificacion_tipo
        CHECK (tipo IN ('SOLICITUD_PAREJA', 'SOLICITUD_ACEPTADA', 'SOLICITUD_RECHAZADA'))
);

CREATE INDEX idx_notificaciones_usuario ON notificaciones(id_usuario);
CREATE INDEX idx_notificaciones_leida ON notificaciones(id_usuario, leida);
CREATE INDEX idx_notificaciones_fecha ON notificaciones(created_at);

COMMENT ON TABLE notificaciones IS 'Notificaciones internas para los bailarines';
COMMENT ON COLUMN notificaciones.referencia_id IS 'Id de la inscripción relacionada';
