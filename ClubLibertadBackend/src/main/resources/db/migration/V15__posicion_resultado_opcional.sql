-- V15: Permitir resultados sin posición para parejas eliminadas

ALTER TABLE resultados
    ALTER COLUMN posicion DROP NOT NULL;

ALTER TABLE resultados
    DROP CONSTRAINT chk_resultado_posicion;

ALTER TABLE resultados
    ADD CONSTRAINT chk_resultado_posicion
        CHECK (posicion IS NULL OR posicion > 0);

COMMENT ON COLUMN resultados.posicion IS
    'Posición final; NULL indica que la pareja no obtuvo posición';
