import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:V#qnF8cX@localhost:5432/powerwoman_db',
});

async function addMissingData() {
  try {
    console.log('📝 Agregando columnas faltantes y datos de prueba...');
    
    const sqlFile = path.join(__dirname, 'add-missing-columns.sql');
    const sql = fs.readFileSync(sqlFile, 'utf-8');
    
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of statements) {
      try {
        await pool.query(statement);
        console.log('✅ Statement ejecutado');
      } catch (error: any) {
        if (!error.message.includes('already exists') && !error.message.includes('UNIQUE constraint') && !error.message.includes('duplicate key')) {
          console.error('⚠️  Error:', error.message);
        }
      }
    }
    
    console.log('✅ Datos de prueba agregados exitosamente');
    
    // Verificar que los datos se insertaron
    const userResult = await pool.query('SELECT id, email, full_name, is_instructor FROM users WHERE email = $1', ['instructora@powerwoman.com']);
    if (userResult.rows.length > 0) {
      console.log('👤 Usuario instructor creado:', userResult.rows[0]);
    }
    
    const courseResult = await pool.query('SELECT id, title, instructor_id FROM courses WHERE title LIKE $1', ['%Maquillaje%']);
    console.log(`📚 Cursos creados: ${courseResult.rows.length}`);
    courseResult.rows.forEach(course => {
      console.log(`   - ${course.title} (ID: ${course.id})`);
    });
    
    await pool.end();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error);
    await pool.end();
    process.exit(1);
  }
}

addMissingData();
