-- ===================================================================
-- V4: Corregir hashes de las cuentas semilla
-- ===================================================================
-- Los hashes de V2 no correspondían a las contraseñas documentadas.
-- Contraseñas de desarrollo:
--   00000001 -> admin123
--   12345678, 87654321, 11223344 -> bailarin123

UPDATE usuarios
SET password_hash = '$2b$10$/w3TwPPethQUBwy3C7/A1.LJlrRQUCqi5wHaHLW1pT1Mn2jtWgtbO'
WHERE dni = '00000001';

UPDATE usuarios
SET password_hash = '$2b$10$ngVaqtR7o1wIasoyWHtkYeFvT/crpXNdh5zRcqTwBLHiV.8nMGoTu'
WHERE dni IN ('12345678', '87654321', '11223344');
