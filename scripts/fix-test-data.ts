import bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:V#qnF8cX@localhost:5432/powerwoman_db',
});

async function fixData() {
  try {
    console.log('🔧 Arreglando datos de prueba...');
    
    // Generar hash válido para "test123"
    const hashedPassword = await bcrypt.hash('test123', 10);
    console.log('✅ Hash de bcrypt generado:', hashedPassword);
    
    // Actualizar el usuario instructor con el hash correcto
    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE email = $2',
      [hashedPassword, 'instructora@powerwoman.com']
    );
    console.log('✅ Contraseña del usuario instructor actualizada');
    
    // Verificar que los productos tienen price_cop
    const products = await pool.query('SELECT id, name, price_cop FROM products LIMIT 1');
    if (products.rows.length > 0) {
      console.log('✅ Productos verificados:', products.rows[0]);
    }
    
    // Insertar algunos productos de ejemplo si no existen
    const existingProducts = await pool.query('SELECT COUNT(*) as count FROM products');
    if (existingProducts.rows[0].count === 0) {
      console.log('📦 Insertando productos de ejemplo...');
      await pool.query(`
        INSERT INTO products (name, description, category, price_cop, image_url, stock_quantity, is_available)
        VALUES
        ('Paleta de Sombras Sunset', '12 tonos cálidos perfectos', 'Maquillaje', 78000, '/uploads/palette.jpg', 50, true),
        ('Base Fluida Perfecta', 'Cobertura media, acabado natural', 'Maquillaje', 65000, '/uploads/base.jpg', 30, true),
        ('Set de Brochas Pro', '15 brochas profesionales', 'Herramientas', 95000, '/uploads/brushes.jpg', 20, true),
        ('Labial Mate Duradero', 'Disponible en 24 tonos', 'Maquillaje', 32000, '/uploads/lipstick.jpg', 100, true)
      `);
      console.log('✅ Productos de ejemplo insertados');
    }
    
    await pool.end();
    console.log('✅ Datos de prueba arreglados exitosamente');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

fixData();
