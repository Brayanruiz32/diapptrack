-- ============================================================
-- V2 - Datos iniciales
-- ============================================================

-- Catálogo de tipos de actividad física
INSERT INTO activity_types (name, icon) VALUES
('Caminata',          'directions_walk'),
('Trote / Carrera',   'directions_run'),
('Natación',          'pool'),
('Ciclismo',          'directions_bike'),
('Yoga',              'self_improvement'),
('Gimnasio / Pesas',  'fitness_center'),
('Baile',             'music_note'),
('Otro',              'sports');

-- Usuario administrador por defecto
-- Contraseña: Admin123! (BCrypt)
INSERT INTO users (full_name, email, password_hash, role, active) VALUES
('Administrador', 'admin@diapptrack.com',
 '$2a$12$8mXqP5NkC4LZx7Yw6v3aVOWxT9.nA1bKpDsE2gFiH0rJmMoUcQe6',
 'ADMIN', TRUE);

-- Contenido educativo inicial
INSERT INTO education_content (title, body, type, topic) VALUES
('Alimentación saludable para la diabetes',
 'Una alimentación equilibrada es clave para controlar los niveles de glucosa. Prioriza verduras, frutas con bajo índice glucémico, proteínas magras y granos integrales. Evita bebidas azucaradas y alimentos ultraprocesados.',
 'ARTICLE', 'NUTRITION'),

('¿Por qué es importante el ejercicio físico?',
 'La actividad física regular mejora la sensibilidad a la insulina y ayuda a mantener un peso saludable. Se recomienda al menos 150 minutos de actividad moderada por semana, como caminar, nadar o andar en bicicleta.',
 'ARTICLE', 'ACTIVITY'),

('Cómo interpretar tus mediciones de glucosa',
 'Los valores normales de glucosa en ayunas están entre 70 y 100 mg/dL. Después de comer pueden subir hasta 140 mg/dL. Valores mayores a 180 mg/dL de forma frecuente requieren consulta médica.',
 'ARTICLE', 'GLUCOSE'),

('Adherencia al tratamiento farmacológico',
 'Tomar los medicamentos según las indicaciones médicas es fundamental para controlar la diabetes. Omitir dosis puede causar variaciones peligrosas en los niveles de glucosa.',
 'ARTICLE', 'MEDICATION'),

('Prevención de complicaciones de la diabetes',
 'El control continuo de glucosa, presión arterial y colesterol reduce el riesgo de complicaciones como neuropatía, retinopatía y problemas cardiovasculares. Las revisiones periódicas con tu médico son esenciales.',
 'ARTICLE', 'PREVENTION'),

('Consejo: Hidratación adecuada',
 'Beber suficiente agua (al menos 8 vasos al día) ayuda a los riñones a eliminar el exceso de glucosa en la sangre. Evita jugos envasados y gaseosas.',
 'TIP', 'NUTRITION'),

('Consejo: Monitoreo en momentos clave',
 'Mide tu glucosa en ayunas, 2 horas después de comer y antes de dormir para tener un panorama completo de tu control glucémico.',
 'TIP', 'GLUCOSE');
