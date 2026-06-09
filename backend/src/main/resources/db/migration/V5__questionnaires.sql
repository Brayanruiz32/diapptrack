-- ============================================================
-- V5 - Módulo de Cuestionarios
--   Cuestionario 1 (SDSCA): 7 preguntas, escala 0-7 (días)  -> Pretest y Postest
--   Cuestionario 2 (SUS):  10 preguntas, escala 1-5 (acuerdo) -> Postest
-- ============================================================

-- Disponibilidad controlada por el administrador (3 instancias)
CREATE TABLE questionnaire_settings (
    questionnaire_key VARCHAR(20) PRIMARY KEY,   -- Q1_PRETEST, Q1_POSTEST, Q2
    enabled           BOOLEAN   NOT NULL DEFAULT FALSE,
    updated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO questionnaire_settings (questionnaire_key, enabled) VALUES
('Q1_PRETEST', FALSE),
('Q1_POSTEST', FALSE),
('Q2',         FALSE);

-- Preguntas fijas de cada cuestionario
CREATE TABLE questions (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    questionnaire VARCHAR(10)  NOT NULL,   -- Q1, Q2
    order_num     INT          NOT NULL,
    text          VARCHAR(500) NOT NULL,
    min_value     INT          NOT NULL,
    max_value     INT          NOT NULL
);

-- Cuestionario 1 (SDSCA) - escala 0 a 7
INSERT INTO questions (questionnaire, order_num, text, min_value, max_value) VALUES
('Q1', 1, 'Durante los últimos 7 días, ¿cuántos días ha seguido una alimentación saludable?', 0, 7),
('Q1', 2, 'Durante el último mes, ¿cuántos días a la semana ha seguido una dieta saludable?', 0, 7),
('Q1', 3, 'Durante los últimos 7 días, ¿cuántos días ha comido cinco o más porciones de frutas y vegetales?', 0, 7),
('Q1', 4, 'Durante los últimos 7 días, ¿cuántos días ha realizado al menos 30 minutos de actividad física? (incluye caminar)', 0, 7),
('Q1', 5, 'Durante los últimos 7 días, ¿cuántos días ha realizado una sesión específica de ejercicio (natación, caminata o ciclismo) aparte de lo que hace en casa o en el trabajo?', 0, 7),
('Q1', 6, 'Durante los últimos 7 días, ¿cuántos días se ha realizado análisis de azúcar en sangre?', 0, 7),
('Q1', 7, 'Durante los últimos 7 días, ¿cuántos días se ha realizado los análisis de azúcar en sangre en el número de veces recomendado por los profesionales sanitarios?', 0, 7);

-- Cuestionario 2 (SUS) - escala 1 a 5
INSERT INTO questions (questionnaire, order_num, text, min_value, max_value) VALUES
('Q2', 1,  'Me gustaría usar esta herramienta frecuentemente.', 1, 5),
('Q2', 2,  'Considero que esta herramienta es innecesariamente compleja.', 1, 5),
('Q2', 3,  'Considero que la herramienta es fácil de usar.', 1, 5),
('Q2', 4,  'Considero necesario el apoyo de personal experto para poder utilizar esta herramienta.', 1, 5),
('Q2', 5,  'Considero que las funciones de la herramienta están bien integradas.', 1, 5),
('Q2', 6,  'Considero que la herramienta presenta muchas contradicciones.', 1, 5),
('Q2', 7,  'Imagino que la mayoría de las personas aprenderían a usar esta herramienta rápidamente.', 1, 5),
('Q2', 8,  'Considero que el uso de esta herramienta es tedioso.', 1, 5),
('Q2', 9,  'Me sentí muy confiado al usar la herramienta.', 1, 5),
('Q2', 10, 'Necesité saber bastantes cosas antes de poder empezar a usar esta herramienta.', 1, 5);

-- Respuestas (una por usuario e instancia)
CREATE TABLE questionnaire_responses (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id           BIGINT      NOT NULL,
    questionnaire_key VARCHAR(20) NOT NULL,   -- Q1_PRETEST, Q1_POSTEST, Q2
    submitted_at      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_qr_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_qr_user_key UNIQUE (user_id, questionnaire_key)
);
CREATE INDEX idx_qr_user ON questionnaire_responses (user_id);

-- Respuesta a cada pregunta
CREATE TABLE questionnaire_answers (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    response_id  BIGINT NOT NULL,
    question_id  BIGINT NOT NULL,
    answer_value INT    NOT NULL,
    CONSTRAINT fk_qa_response FOREIGN KEY (response_id) REFERENCES questionnaire_responses(id) ON DELETE CASCADE,
    CONSTRAINT fk_qa_question FOREIGN KEY (question_id) REFERENCES questions(id),
    CONSTRAINT uq_qa_response_question UNIQUE (response_id, question_id)
);
