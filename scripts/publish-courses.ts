import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:V#qnF8cX@localhost:5432/powerwoman_db',
});

async function publishCourses() {
  try {
    console.log('📝 Publicando cursos...');
    
    // Actualizar todos los cursos para que estén publicados
    const result = await pool.query(
      'UPDATE courses SET is_published = true RETURNING id, title, is_published'
    );
    
    console.log('✅ Cursos publicados:');
    result.rows.forEach(course => {
      console.log(`   - ${course.title} (ID: ${course.id}, Published: ${course.is_published})`);
    });
    
    // Verificar que aparecen en el endpoint público
    const coursesResult = await pool.query(`
      SELECT c.id, c.title, c.is_published, u.full_name as instructor_name
      FROM courses c
      JOIN users u ON c.instructor_id = u.id
      WHERE c.is_published = true
      ORDER BY c.created_at DESC
    `);
    
    console.log(`\n📚 Total de cursos publicados visibles: ${coursesResult.rows.length}`);
    coursesResult.rows.forEach(course => {
      console.log(`   - ${course.title} (por ${course.instructor_name})`);
    });
    
    await pool.end();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

publishCourses();
