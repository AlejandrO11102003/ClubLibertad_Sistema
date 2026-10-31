-- RF-01: soportar DNI y Carné de Extranjería.
ALTER TABLE usuarios
    ADD COLUMN tipo_documento VARCHAR(3) NOT NULL DEFAULT 'DNI';

ALTER TABLE usuarios
    ALTER COLUMN dni TYPE VARCHAR(20);

ALTER TABLE usuarios
    DROP CONSTRAINT chk_dni_formato;

ALTER TABLE usuarios
    ADD CONSTRAINT chk_tipo_documento
        CHECK (tipo_documento IN ('DNI', 'CE'));

ALTER TABLE usuarios
    ADD CONSTRAINT chk_numero_documento_formato
        CHECK (
            (tipo_documento = 'DNI' AND dni ~ '^[0-9]{8}$')
            OR (tipo_documento = 'CE' AND dni ~ '^[A-Za-z0-9]{6,20}$')
        );

CREATE INDEX idx_usuarios_tipo_documento ON usuarios(tipo_documento);
