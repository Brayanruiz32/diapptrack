-- ============================================================
-- V1 - Esquema inicial DiabTrack
-- ============================================================

CREATE TABLE users (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name     VARCHAR(150)        NOT NULL,
    email         VARCHAR(150)        NOT NULL UNIQUE,
    password_hash VARCHAR(255)        NOT NULL,
    role          ENUM('PATIENT','ADMIN') NOT NULL DEFAULT 'PATIENT',
    birth_date    DATE,
    sex           ENUM('M','F','OTHER'),
    weight_kg     DECIMAL(5,2),
    height_cm     DECIMAL(5,2),
    active        BOOLEAN             NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Spring Security Remember Me
CREATE TABLE persistent_logins (
    series    VARCHAR(64) PRIMARY KEY,
    username  VARCHAR(150) NOT NULL,
    token     VARCHAR(64)  NOT NULL,
    last_used TIMESTAMP    NOT NULL
);

-- Spring Session JDBC
CREATE TABLE SPRING_SESSION (
    PRIMARY_ID            CHAR(36)     NOT NULL,
    SESSION_ID            CHAR(36)     NOT NULL,
    CREATION_TIME         BIGINT       NOT NULL,
    LAST_ACCESS_TIME      BIGINT       NOT NULL,
    MAX_INACTIVE_INTERVAL INT          NOT NULL,
    EXPIRY_TIME           BIGINT       NOT NULL,
    PRINCIPAL_NAME        VARCHAR(100),
    CONSTRAINT SPRING_SESSION_PK PRIMARY KEY (PRIMARY_ID)
);
CREATE UNIQUE INDEX SPRING_SESSION_IX1 ON SPRING_SESSION (SESSION_ID);
CREATE INDEX SPRING_SESSION_IX2 ON SPRING_SESSION (EXPIRY_TIME);
CREATE INDEX SPRING_SESSION_IX3 ON SPRING_SESSION (PRINCIPAL_NAME);

CREATE TABLE SPRING_SESSION_ATTRIBUTES (
    SESSION_PRIMARY_ID CHAR(36)     NOT NULL,
    ATTRIBUTE_NAME     VARCHAR(200) NOT NULL,
    ATTRIBUTE_BYTES    BLOB         NOT NULL,
    CONSTRAINT SPRING_SESSION_ATTRIBUTES_PK PRIMARY KEY (SESSION_PRIMARY_ID, ATTRIBUTE_NAME),
    CONSTRAINT SPRING_SESSION_ATTRIBUTES_FK FOREIGN KEY (SESSION_PRIMARY_ID)
        REFERENCES SPRING_SESSION(PRIMARY_ID) ON DELETE CASCADE
);

-- Registros de glucosa
CREATE TABLE glucose_records (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT       NOT NULL,
    measured_at DATETIME     NOT NULL,
    value_mgdl  DECIMAL(6,2) NOT NULL,
    notes       TEXT,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_glucose_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_glucose_user_date ON glucose_records (user_id, measured_at);

-- Medicamentos configurados por el paciente
CREATE TABLE medications (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id        BIGINT       NOT NULL,
    name           VARCHAR(150) NOT NULL,
    dose           VARCHAR(100) NOT NULL,
    scheduled_time TIME         NOT NULL,
    active         BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_medication_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Log diario de cumplimiento de medicación
CREATE TABLE medication_logs (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    medication_id BIGINT  NOT NULL,
    user_id       BIGINT  NOT NULL,
    log_date      DATE    NOT NULL,
    taken         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_medlog_medication FOREIGN KEY (medication_id) REFERENCES medications(id) ON DELETE CASCADE,
    CONSTRAINT fk_medlog_user       FOREIGN KEY (user_id)       REFERENCES users(id)       ON DELETE CASCADE,
    CONSTRAINT uq_medlog_per_day    UNIQUE (medication_id, log_date)
);
CREATE INDEX idx_medlog_user_date ON medication_logs (user_id, log_date);

-- Catálogo de tipos de actividad física
CREATE TABLE activity_types (
    id   BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(50)
);

-- Registros de actividad física
CREATE TABLE physical_activities (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id          BIGINT NOT NULL,
    activity_type_id BIGINT NOT NULL,
    activity_date    DATE   NOT NULL,
    duration_min     INT    NOT NULL,
    created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_activity_user FOREIGN KEY (user_id)          REFERENCES users(id)          ON DELETE CASCADE,
    CONSTRAINT fk_activity_type FOREIGN KEY (activity_type_id) REFERENCES activity_types(id)
);
CREATE INDEX idx_activity_user_date ON physical_activities (user_id, activity_date);

-- Registro diario de alimentación (una entrada por día por paciente)
CREATE TABLE nutrition_logs (
    id                 BIGINT  AUTO_INCREMENT PRIMARY KEY,
    user_id            BIGINT  NOT NULL,
    log_date           DATE    NOT NULL,
    ate_fruits         BOOLEAN NOT NULL DEFAULT FALSE,
    ate_vegetables     BOOLEAN NOT NULL DEFAULT FALSE,
    drank_sugary       BOOLEAN NOT NULL DEFAULT FALSE,
    ate_fast_food      BOOLEAN NOT NULL DEFAULT FALSE,
    respected_schedule BOOLEAN NOT NULL DEFAULT FALSE,
    created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_nutrition_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_nutrition_per_day UNIQUE (user_id, log_date)
);

-- Contenido educativo
CREATE TABLE education_content (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    title        VARCHAR(200) NOT NULL,
    body         TEXT         NOT NULL,
    type         ENUM('ARTICLE','TIP') NOT NULL DEFAULT 'ARTICLE',
    topic        ENUM('NUTRITION','ACTIVITY','GLUCOSE','MEDICATION','PREVENTION') NOT NULL,
    published_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Registro de visualizaciones de contenido educativo
CREATE TABLE education_views (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT    NOT NULL,
    content_id BIGINT    NOT NULL,
    viewed_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_edview_user    FOREIGN KEY (user_id)    REFERENCES users(id)             ON DELETE CASCADE,
    CONSTRAINT fk_edview_content FOREIGN KEY (content_id) REFERENCES education_content(id) ON DELETE CASCADE,
    CONSTRAINT uq_edview UNIQUE (user_id, content_id)
);

-- Tokens FCM para notificaciones push
CREATE TABLE fcm_tokens (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT       NOT NULL,
    token       TEXT         NOT NULL,
    device_info VARCHAR(200),
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_fcm_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Configuración de notificaciones por paciente
CREATE TABLE notification_settings (
    id                  BIGINT  AUTO_INCREMENT PRIMARY KEY,
    user_id             BIGINT  NOT NULL UNIQUE,
    glucose_enabled     BOOLEAN NOT NULL DEFAULT FALSE,
    glucose_time        TIME,
    medication_enabled  BOOLEAN NOT NULL DEFAULT FALSE,
    activity_enabled    BOOLEAN NOT NULL DEFAULT FALSE,
    activity_time       TIME,
    education_enabled   BOOLEAN NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
