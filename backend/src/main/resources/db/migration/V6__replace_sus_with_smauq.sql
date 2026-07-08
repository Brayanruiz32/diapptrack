-- ============================================================
-- V6 - Reemplaza el Cuestionario 2: SUS (10 ítems, 1-5)  ->  S-MAUQ (16 ítems, 1-7)
--   S-MAUQ: mHealth App Usability Questionnaire (versión en español)
--   Escala 1-7 (1 = Totalmente en desacuerdo ... 7 = Totalmente de acuerdo)
-- ============================================================

-- 1) Eliminar respuestas previas del SUS (estaban en escala 1-5, ya no son válidas).
--    Primero las respuestas por pregunta (FK a questions), luego las cabeceras.
DELETE FROM questionnaire_answers
 WHERE response_id IN (SELECT id FROM questionnaire_responses WHERE questionnaire_key = 'Q2');

DELETE FROM questionnaire_responses
 WHERE questionnaire_key = 'Q2';

-- 2) Eliminar las preguntas antiguas del SUS.
DELETE FROM questions WHERE questionnaire = 'Q2';

-- 3) Insertar los 16 ítems del S-MAUQ (escala 1 a 7).
INSERT INTO questions (questionnaire, order_num, text, min_value, max_value) VALUES
('Q2', 1,  'La aplicación era fácil de usar.', 1, 7),
('Q2', 2,  'Me resultó fácil aprender a utilizar la aplicación.', 1, 7),
('Q2', 3,  'Al pasar de una pantalla a otra, la navegación era consistente, similar, previsible.', 1, 7),
('Q2', 4,  'La aplicación me permitió usar todas las funciones que necesité (tales como visualizar e introducir información, responder a recordatorios, etc.).', 1, 7),
('Q2', 5,  'Cuando cometí un error usando la aplicación, fue fácil y rápido deshacerlo y volver a intentarlo.', 1, 7),
('Q2', 6,  'Me gusta el diseño y aspecto de la aplicación.', 1, 7),
('Q2', 7,  'La presentación de la información en la aplicación estaba bien organizada, y me permitió encontrar lo que buscaba.', 1, 7),
('Q2', 8,  'La aplicación mostraba adecuadamente el progreso de mi actividad mientras interactuaba con ella.', 1, 7),
('Q2', 9,  'Me sentiría cómodo/a utilizando esta aplicación en público, delante de otras personas.', 1, 7),
('Q2', 10, 'El tiempo invertido en realizar las tareas deseadas me ha parecido adecuado.', 1, 7),
('Q2', 11, 'Volvería a utilizar esta aplicación.', 1, 7),
('Q2', 12, 'En general, estoy satisfecho/a con esta aplicación.', 1, 7),
('Q2', 13, 'Creo que la aplicación puede ser útil para mi salud y bienestar.', 1, 7),
('Q2', 14, 'Esta aplicación tiene todas las funciones que esperaba.', 1, 7),
('Q2', 15, 'He podido realizar algunas tareas incluso cuando la conexión a internet era mala o no estaba disponible.', 1, 7),
('Q2', 16, 'Esta aplicación me proporcionó una forma aceptable de recibir servicios de salud, tales como el acceso a material educativo, el seguimiento de mis actividades, o la realización de autoevaluaciones.', 1, 7);
