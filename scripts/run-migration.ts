import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'powerwoman',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'admin',
});

async function runMigration() {
  try {
    console.log('📝 Ejecutando migración de base de datos...');
    
    const sqlFile = path.join(__dirname, '../../scripts/add-instructor-role.sql');
    const sql = fs.readFileSync(sqlFile, 'utf-8');
    
    // Dividir por punto y coma y ejecutar cada statement
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of statements) {
      try {
        await pool.query(statement);
        console.log('✅ Statement ejecutado');
      } catch (error: any) {
        // Algunos errores son OK (como "CREATE TABLE IF NOT EXISTS" si ya existe)
        if (!error.message.includes('already exists') && !error.message.includes('UNIQUE constraint')) {
          console.error('⚠️  Error:', error.message);
        }
      }
    }
    
    console.log('✅ Migración completada exitosamente');
    await pool.end();
  } catch (error: any) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

runMigration();
