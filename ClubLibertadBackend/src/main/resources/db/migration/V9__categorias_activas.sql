-- ===================================================================
-- V9: Activación lógica de categorías (ECU-04)
-- ===================================================================

ALTER TABLE categorias
    ADD COLUMN activa BOOLEAN NOT NULL DEFAULT TRUE;

CREATE INDEX idx_categorias_activa ON categorias(activa);

COMMENT ON COLUMN categorias.activa IS
    'Indica si la categoría puede usarse en nuevos concursos';
