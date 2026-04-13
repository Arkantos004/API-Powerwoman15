import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import pool from '../src/config/database';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initializeDatabase() {
  try {
    console.log('🔄 Inicializando base de datos...');
    
    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, 'init-db.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    
    // Ejecutar el SQL
    await pool.query(sql);
    console.log('✅ Tablas creadas exitosamente');

    // Crear usuario admin
    const adminEmail = 'admin@powerwoman.com';
    const adminPassword = 'Admin123456!';
    const adminName = 'Administrador POWERWOMAN';

    // Verificar si el admin ya existe
    const existingAdmin = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [adminEmail]
    );

    if (existingAdmin.rows.length === 0) {
      // Hashear contraseña
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      // Insertar admin
      await pool.query(
        'INSERT INTO users (email, full_name, password_hash, phone, address, city, country, postal_code, is_admin) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)',
        [
          adminEmail,
          adminName,
          hashedPassword,
          '+57 300 0000000',
          'Calle Administrativa 123',
          'Medellín',
          'Colombia',
          '050001'
        ]
      );

      console.log('✅ Usuario admin creado:');
      console.log(`   📧 Email: ${adminEmail}`);
      console.log(`   🔐 Contraseña: ${adminPassword}`);
      console.log('   ⚠️  CAMBIA ESTA CONTRASEÑA EN PRODUCCIÓN');
    } else {
      console.log('ℹ️  El usuario admin ya existe');
    }

    console.log('✅ Base de datos inicializada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error inicializando la base de datos:', error);
    process.exit(1);
  }
}

initializeDatabase();
