-- Agregar rol de instructora a la tabla users
ALTER TABLE users ADD COLUMN is_instructor BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN instructor_approved BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN instructor_request_date TIMESTAMP NULL;

-- Crear tabla de cursos
CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  instructor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(255),
  price_cop DECIMAL(10, 2) DEFAULT 0,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de módulos
CREATE TABLE IF NOT EXISTS course_modules (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  order_number INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de lecciones
CREATE TABLE IF NOT EXISTS course_lessons (
  id SERIAL PRIMARY KEY,
  module_id INTEGER NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  video_url VARCHAR(500),
  video_type VARCHAR(50), -- 'youtube', 'vimeo', 'external'
  duration_minutes INTEGER,
  order_number INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de progreso de cursos
CREATE TABLE IF NOT EXISTS user_course_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  progress_percentage DECIMAL(5, 2) DEFAULT 0,
  started_date TIMESTAMP,
  completed_date TIMESTAMP NULL,
  total_time_spent_minutes INTEGER DEFAULT 0,
  last_accessed TIMESTAMP,
  UNIQUE(user_id, course_id)
);

-- Crear tabla de progreso de lecciones
CREATE TABLE IF NOT EXISTS user_lesson_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id INTEGER NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
  is_completed BOOLEAN DEFAULT FALSE,
  time_spent_minutes INTEGER DEFAULT 0,
  started_date TIMESTAMP,
  completed_date TIMESTAMP NULL,
  last_accessed TIMESTAMP,
  UNIQUE(user_id, lesson_id)
);

-- Crear índices para mejor query performance
CREATE INDEX idx_courses_instructor ON courses(instructor_id);
CREATE INDEX idx_course_modules_course ON course_modules(course_id);
CREATE INDEX idx_course_lessons_module ON course_lessons(module_id);
CREATE INDEX idx_user_course_progress_user ON user_course_progress(user_id);
CREATE INDEX idx_user_course_progress_course ON user_course_progress(course_id);
CREATE INDEX idx_user_lesson_progress_user ON user_lesson_progress(user_id);
CREATE INDEX idx_user_lesson_progress_lesson ON user_lesson_progress(lesson_id);

-- Message
SELECT 'Instructor role y tablas de cursos agregadas correctamente ✅' AS message;
