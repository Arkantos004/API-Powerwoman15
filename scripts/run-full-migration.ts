import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:V#qnF8cX@localhost:5432/powerwoman_db',
});

async function runMigration() {
  try {
    console.log('📝 Ejecutando migración de base de datos...');
    
    // Leer y ejecutar init-db.sql
    const initSqlFile = path.join(__dirname, 'init-db.sql');
    const initSql = fs.readFileSync(initSqlFile, 'utf-8');
    
    console.log('📊 Ejecutando init-db.sql...');
    const initStatements = initSql.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of initStatements) {
      try {
        await pool.query(statement);
        console.log('✅ Statement ejecutado');
      } catch (error: any) {
        if (!error.message.includes('already exists') && !error.message.includes('UNIQUE constraint')) {
          console.error('⚠️  Error:', error.message);
        }
      }
    }
    
    console.log('✅ init-db.sql completado');
    
    // Leer y ejecutar seed-data.sql
    const seedSqlFile = path.join(__dirname, 'seed-data.sql');
    const seedSql = fs.readFileSync(seedSqlFile, 'utf-8');
    
    console.log('📊 Ejecutando seed-data.sql...');
    const seedStatements = seedSql.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of seedStatements) {
      try {
        await pool.query(statement);
        console.log('✅ Statement ejecutado');
      } catch (error: any) {
        if (!error.message.includes('already exists') && !error.message.includes('UNIQUE constraint') && !error.message.includes('duplicate key')) {
          console.error('⚠️  Error:', error.message);
        }
      }
    }
    
    console.log('✅ seed-data.sql completado');
    console.log('✅ Migración completada exitosamente');
    await pool.end();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error);
    await pool.end();
    process.exit(1);
  }
}

runMigration();
