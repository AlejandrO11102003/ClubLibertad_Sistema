-- V16: Guardar la etapa actual de cada resultado

ALTER TABLE resultados
    ADD COLUMN etapa VARCHAR(20) NOT NULL DEFAULT 'ELIMINATORIA';

ALTER TABLE resultados
    ADD CONSTRAINT chk_resultado_etapa
        CHECK (etapa IN ('ELIMINATORIA', 'SEMIFINAL', 'FINAL'));

COMMENT ON COLUMN resultados.etapa IS
    'Etapa actual alcanzada por la pareja en el concurso';
