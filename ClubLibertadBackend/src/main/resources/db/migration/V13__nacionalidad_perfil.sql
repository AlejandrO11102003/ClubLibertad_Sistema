ALTER TABLE perfiles
    ADD COLUMN nacionalidad VARCHAR(100);

COMMENT ON COLUMN perfiles.nacionalidad IS
    'Nacionalidad declarada por el bailarín; dato privado del perfil';
