import { query } from '../src/config/database';

async function addInstructorRequestFields() {
  try {
    console.log('🔧 Agregando campos de solicitud de instructora...');

    // Agregar campos si no existen
    await query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS instructor_request_date TIMESTAMP;
    `);
    console.log('✅ Campo instructor_request_date agregado');

    await query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS expertise_areas VARCHAR(500);
    `);
    console.log('✅ Campo expertise_areas agregado');

    await query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS portfolio_url VARCHAR(500);
    `);
    console.log('✅ Campo portfolio_url agregado');

    await query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS years_experience INTEGER;
    `);
    console.log('✅ Campo years_experience agregado');

    console.log('✨ Campos agregados exitosamente');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

addInstructorRequestFields();
