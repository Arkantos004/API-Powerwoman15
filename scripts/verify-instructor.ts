import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:V#qnF8cX@localhost:5432/powerwoman_db',
});

async function verifyInstructorStatus() {
  try {
    console.log('🔍 Verificando estado de María Rodríguez...');
    
    // Buscar a María Rodríguez
    const result = await pool.query(
      'SELECT id, email, full_name, is_instructor, instructor_approved FROM users WHERE email = $1',
      ['instructora@powerwoman.com']
    );
    
    if (result.rows.length === 0) {
      console.log('❌ María Rodríguez no encontrada');
      await pool.end();
      process.exit(1);
    }
    
    const user = result.rows[0];
    console.log('👤 Usuario encontrado:', user);
    
    // Si no está marcada como instructora, actualizarla
    if (!user.is_instructor || !user.instructor_approved) {
      console.log('⚙️  Actualizando status de instructora...');
      await pool.query(
        'UPDATE users SET is_instructor = true, instructor_approved = true WHERE id = $1',
        [user.id]
      );
      console.log('✅ María Rodríguez ahora es instructora aprobada');
    } else {
      console.log('✅ María Rodríguez ya es instructora aprobada');
    }
    
    // Verificar todos los usuarios para ver sus roles
    console.log('\n📊 Todos los usuarios:');
    const allUsers = await pool.query(
      'SELECT id, email, full_name, is_admin, is_instructor, instructor_approved FROM users ORDER BY created_at DESC'
    );
    
    allUsers.rows.forEach(u => {
      console.log(`   ${u.full_name} (${u.email}) - Admin: ${u.is_admin}, Instructor: ${u.is_instructor}, Aprobada: ${u.instructor_approved}`);
    });
    
    await pool.end();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

verifyInstructorStatus();
