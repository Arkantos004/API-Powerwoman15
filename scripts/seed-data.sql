-- Script para insertar datos de prueba
-- IMPORTANTE: Ejecutar DESPUÉS de init-db.sql

-- Insertar usuarios de prueba
-- Contraseña: test123 (hasheada con bcrypt)
INSERT INTO users (email, full_name, password_hash, is_instructor, instructor_approved, instructor_bio, phone)
VALUES (
  'instructora@powerwoman.com',
  'María Rodríguez',
  '$2b$10$YIjlrHmJV7K7K7K7K7K7K.K7K7K7K7K7K7K7K7K7K7K7K7K7K7K7K7',
  true,
  true,
  'Experta en maquillaje profesional con más de 10 años de experiencia en la industria de la belleza.',
  '+57 300 123 4567'
)
ON CONFLICT (email) DO NOTHING;

-- Insertar cursos de ejemplo
INSERT INTO courses (instructor_id, title, description, category, price_cop, image_url, is_published, level, duration_hours)
VALUES (
  (SELECT id FROM users WHERE email = 'instructora@powerwoman.com'),
  'Maquillaje Profesional Avanzado',
  'Aprende técnicas profesionales de maquillaje para eventos, televisión y fotografía. Domina la contouring, iluminación y corrección de defectos.',
  'Maquillaje',
  150000,
  '/uploads/course-makeup.jpg',
  true,
  'advanced',
  24
),
(
  (SELECT id FROM users WHERE email = 'instructora@powerwoman.com'),
  'Introducción al Maquillaje Natural',
  'Curso perfecto para principiantes. Aprende lo básico sobre preparación de piel, bases, correctores y tonos que favorecen tu tono de piel.',
  'Maquillaje',
  89000,
  '/uploads/course-natural.jpg',
  true,
  'beginner',
  12
),
(
  (SELECT id FROM users WHERE email = 'instructora@powerwoman.com'),
  'Cejas y Piel: Diseño y Cuidado',
  'Especialízate en diseño de cejas, tratamientos de la piel y cuidados pre-maquillaje. Técnicas modernas y productos recomendados.',
  'Skincare',
  120000,
  '/uploads/course-eyebrows.jpg',
  true,
  'intermediate',
  18
)
ON CONFLICT DO NOTHING;

-- Insertar módulos para el primer curso
INSERT INTO course_modules (course_id, title, description, order_index)
SELECT 
  c.id,
  'Fundamentos de Colorimetría',
  'Comprende la teoría del color, undertones y cómo elegir los tonos correctos para cada tipo de piel.',
  1
FROM courses c
WHERE c.title = 'Maquillaje Profesional Avanzado'
ON CONFLICT DO NOTHING;

INSERT INTO course_modules (course_id, title, description, order_index)
SELECT 
  c.id,
  'Técnicas de Contouring',
  'Domina las técnicas de contouring para resaltar facciones y crear definición profesional.',
  2
FROM courses c
WHERE c.title = 'Maquillaje Profesional Avanzado'
ON CONFLICT DO NOTHING;

INSERT INTO course_modules (course_id, title, description, order_index)
SELECT 
  c.id,
  'Maquillaje para Eventos Especiales',
  'Crea looks para bodas, fiestas y eventos corporativos con productos duraderos y técnicas profesionales.',
  3
FROM courses c
WHERE c.title = 'Maquillaje Profesional Avanzado'
ON CONFLICT DO NOTHING;

-- Insertar lecciones para el módulo 1
INSERT INTO course_lessons (module_id, title, description, content, duration_minutes, order_index, is_free)
SELECT
  cm.id,
  'Introducción a la Colorimetría',
  'Video introductorio sobre teoría del color',
  'En esta lección exploraremos los conceptos básicos de la teoría del color, cómo funcionan los undertones y por qué es crucial comprender esto para maquillaje profesional.',
  15,
  1,
  true
FROM course_modules cm
WHERE cm.title = 'Fundamentos de Colorimetría' AND cm.course_id = (SELECT id FROM courses WHERE title = 'Maquillaje Profesional Avanzado')
ON CONFLICT DO NOTHING;

INSERT INTO course_lessons (module_id, title, description, content, duration_minutes, order_index, is_free)
SELECT
  cm.id,
  'Identificar tu Undertone',
  'Cómo identificar si tienes undertone frío, cálido o neutral',
  'Aprenderás a identificar tu undertone personal y el de tus clientes. Esto es fundamental para elegir los tonos correctos de base, labial y sombras.',
  20,
  2,
  false
FROM course_modules cm
WHERE cm.title = 'Fundamentos de Colorimetría' AND cm.course_id = (SELECT id FROM courses WHERE title = 'Maquillaje Profesional Avanzado')
ON CONFLICT DO NOTHING;

-- Insertar lecciones para el módulo 2
INSERT INTO course_lessons (module_id, title, description, content, duration_minutes, order_index, is_free)
SELECT
  cm.id,
  'Técnicas Básicas de Contouring',
  'Aprende las técnicas fundamentales de contouring',
  'En esta lección cubriremos cómo usar sombras y luces para crear definición en el rostro usando técnicas de contouring paso a paso.',
  25,
  1,
  false
FROM course_modules cm
WHERE cm.title = 'Técnicas de Contouring' AND cm.course_id = (SELECT id FROM courses WHERE title = 'Maquillaje Profesional Avanzado')
ON CONFLICT DO NOTHING;

INSERT INTO course_lessons (module_id, title, description, content, duration_minutes, order_index, is_free)
SELECT
  cm.id,
  'Contouring para Diferentes Formas de Rostro',
  'Adapta el contouring a diferentes formas de cara',
  'Descubre cómo adaptar las técnicas de contouring para diferentes tipos de rostros: cuadrado, redondo, alargado, ovalado y triangular.',
  30,
  2,
  false
FROM course_modules cm
WHERE cm.title = 'Técnicas de Contouring' AND cm.course_id = (SELECT id FROM courses WHERE title = 'Maquillaje Profesional Avanzado')
ON CONFLICT DO NOTHING;
