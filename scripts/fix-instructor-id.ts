import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:V#qnF8cX@localhost:5432/powerwoman_db',
});

async function fixInstructorId() {
  try {
    console.log('🔧 Asignando instructor a los cursos...');
    
    // Obtener el ID del instructor
    const instructorResult = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      ['instructora@powerwoman.com']
    );
    
    if (instructorResult.rows.length === 0) {
      throw new Error('Instructor no encontrado');
    }
    
    const instructorId = instructorResult.rows[0].id;
    console.log(`✅ Instructor encontrado: ID ${instructorId}`);
    
    // Actualizar los cursos sin instructor
    const updateResult = await pool.query(
      'UPDATE courses SET instructor_id = $1 WHERE instructor_id IS NULL RETURNING id, title',
      [instructorId]
    );
    
    console.log(`✅ ${updateResult.rows.length} cursos actualizados:`);
    updateResult.rows.forEach(course => {
      console.log(`   - ${course.title}`);
    });
    
    // Verificar
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

fixInstructorId();
