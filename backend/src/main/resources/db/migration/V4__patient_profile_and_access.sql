-- ============================================================
-- V4 - Perfil del paciente y seguimiento de acceso
--   - DNI
--   - Fecha de diagnóstico (Datos Clínicos)
--   - Último acceso exitoso
-- ============================================================

ALTER TABLE users
    ADD COLUMN dni            VARCHAR(20) NULL,
    ADD COLUMN diagnosis_date DATE        NULL,
    ADD COLUMN last_login_at  DATETIME    NULL;
