import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:V#qnF8cX@localhost:5432/powerwoman_db',
});

async function debugCourses() {
  try {
    console.log('🔍 Depurando cursos...');
    
    // Ver todos los cursos
    const allCourses = await pool.query('SELECT id, title, instructor_id, is_published FROM courses');
    console.log('\n📚 Todos los cursos:');
    allCourses.rows.forEach(course => {
      console.log(`   - ID: ${course.id}, Título: ${course.title}, Instructor: ${course.instructor_id}, Publicado: ${course.is_published}`);
    });
    
    // Ver todos los usuarios
    const allUsers = await pool.query('SELECT id, email, full_name, is_instructor FROM users');
    console.log('\n👥 Todos los usuarios:');
    allUsers.rows.forEach(user => {
      console.log(`   - ID: ${user.id}, Email: ${user.email}, Nombre: ${user.full_name}, Instructor: ${user.is_instructor}`);
    });
    
    // Test del JOIN
    const joined = await pool.query(`
      SELECT c.id, c.title, c.is_published, u.full_name as instructor_name
      FROM courses c
      LEFT JOIN users u ON c.instructor_id = u.id
      WHERE c.is_published = true
    `);
    console.log('\n✅ Cursos con JOIN (LEFT):');
    joined.rows.forEach(course => {
      console.log(`   - ${course.title} (Instructor: ${course.instructor_name || 'SIN INSTRUCTOR'})`);
    });
    
    await pool.end();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

debugCourses();
