-- ===================================================================
-- V3: Datos de contacto y categoría del perfil
-- ===================================================================

ALTER TABLE perfiles
    ADD COLUMN email      VARCHAR(150),
    ADD COLUMN telefono   VARCHAR(20),
    ADD COLUMN genero     VARCHAR(20),
    ADD COLUMN categoria  VARCHAR(50);

CREATE INDEX idx_perfiles_email ON perfiles(email);

COMMENT ON COLUMN perfiles.email IS 'Correo de contacto - no se expone en el perfil público';
COMMENT ON COLUMN perfiles.telefono IS 'Teléfono / WhatsApp - privado';
COMMENT ON COLUMN perfiles.genero IS 'Femenino, Masculino u Otro';
COMMENT ON COLUMN perfiles.categoria IS 'Categoría declarada por el bailarín';
