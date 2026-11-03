CREATE TABLE admiradores (
    id_admirador BIGSERIAL PRIMARY KEY,
    id_admirador_usuario BIGINT NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    id_admirado_usuario BIGINT NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_admiradores_relacion
        UNIQUE (id_admirador_usuario, id_admirado_usuario),
    CONSTRAINT chk_admiradores_no_autoadmiracion
        CHECK (id_admirador_usuario <> id_admirado_usuario)
);

CREATE INDEX idx_admiradores_admirado
    ON admiradores(id_admirado_usuario);
