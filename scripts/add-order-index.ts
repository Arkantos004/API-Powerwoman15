import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:V#qnF8cX@localhost:5432/powerwoman_db',
});

async function addOrderIndex() {
  try {
    await pool.query('ALTER TABLE course_lessons ADD COLUMN IF NOT EXISTS order_index INTEGER');
    console.log('✅ Columna order_index agregada a course_lessons');
    await pool.end();
  } catch (error: any) {
    console.error('Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

addOrderIndex();
