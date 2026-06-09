-- ============================================================
-- V3 - Cambios de observaciones
--   2) Educación: imagen + tiempo de lectura
--   3) Actividad física: MET + calorías
--   4) Medicamentos: horarios múltiples (reestructuración)
-- ============================================================

-- ------------------------------------------------------------
-- 2) CONTENIDO EDUCATIVO
-- ------------------------------------------------------------
ALTER TABLE education_content
    ADD COLUMN image_url            VARCHAR(255) NULL,
    ADD COLUMN reading_time_minutes INT          NULL;

-- ------------------------------------------------------------
-- 3) ACTIVIDAD FÍSICA
-- ------------------------------------------------------------
-- MET (Metabolic Equivalent of Task) por tipo de actividad
ALTER TABLE activity_types
    ADD COLUMN met DECIMAL(4,1) NOT NULL DEFAULT 4.0;

UPDATE activity_types SET met = 3.5 WHERE name = 'Caminata';
UPDATE activity_types SET met = 7.0 WHERE name = 'Trote / Carrera';
UPDATE activity_types SET met = 6.0 WHERE name = 'Natación';
UPDATE activity_types SET met = 7.5 WHERE name = 'Ciclismo';
UPDATE activity_types SET met = 2.5 WHERE name = 'Yoga';
UPDATE activity_types SET met = 5.0 WHERE name = 'Gimnasio / Pesas';
UPDATE activity_types SET met = 4.5 WHERE name = 'Baile';
UPDATE activity_types SET met = 4.0 WHERE name = 'Otro';

-- Calorías aproximadas quemadas (calculadas con la fórmula ACSM)
ALTER TABLE physical_activities
    ADD COLUMN calories INT NULL;

-- ------------------------------------------------------------
-- 4) MEDICAMENTOS - reestructuración a horarios múltiples
--    (se descartan datos de prueba existentes, según lo acordado)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS medication_logs;
DROP TABLE IF EXISTS medications;

CREATE TABLE medications (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT       NOT NULL,
    name       VARCHAR(150) NOT NULL,
    dose       VARCHAR(100) NOT NULL,
    active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_medication_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Horarios programados de cada medicamento (uno o varios por día)
CREATE TABLE medication_schedules (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    medication_id BIGINT NOT NULL,
    time_of_day   TIME   NOT NULL,
    CONSTRAINT fk_medsched_medication FOREIGN KEY (medication_id) REFERENCES medications(id) ON DELETE CASCADE
);
CREATE INDEX idx_medsched_medication ON medication_schedules (medication_id);

-- Log diario de cumplimiento: por horario y por día
CREATE TABLE medication_logs (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    schedule_id BIGINT  NOT NULL,
    user_id     BIGINT  NOT NULL,
    log_date    DATE    NOT NULL,
    taken       BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_medlog_schedule FOREIGN KEY (schedule_id) REFERENCES medication_schedules(id) ON DELETE CASCADE,
    CONSTRAINT fk_medlog_user     FOREIGN KEY (user_id)     REFERENCES users(id)                ON DELETE CASCADE,
    CONSTRAINT uq_medlog_per_day  UNIQUE (schedule_id, log_date)
);
CREATE INDEX idx_medlog_user_date ON medication_logs (user_id, log_date);
