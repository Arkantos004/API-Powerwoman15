-- Agregar campo instructor_request_date a la tabla users si no existe
ALTER TABLE users
ADD COLUMN IF NOT EXISTS instructor_request_date TIMESTAMP;

-- Agregar campo bio a la tabla users si no existe (para que llenen información sobre ellas)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS expertise_areas VARCHAR(500);

ALTER TABLE users
ADD COLUMN IF NOT EXISTS portfolio_url VARCHAR(500);

ALTER TABLE users
ADD COLUMN IF NOT EXISTS years_experience INTEGER;

SELECT 'Campos agregados exitosamente' as result;
