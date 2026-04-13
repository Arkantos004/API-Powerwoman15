const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  try {
    console.log('📝 Ejecutando migración de base de datos...');
    
    await client.connect();
    
    const sqlFile = path.join(__dirname, './add-instructor-role.sql');
    const sql = fs.readFileSync(sqlFile, 'utf-8');
    
    // Dividir por punto y coma y ejecutar cada statement
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of statements) {
      try {
        await client.query(statement);
        console.log('✅ Statement ejecutado');
      } catch (error) {
        // Algunos errores son OK
        if (!error.message.includes('already exists') && !error.message.includes('UNIQUE constraint')) {
          console.log('⚠️  Warning:', error.message);
        }
      }
    }
    
    console.log('✅ Migración completada exitosamente');
    await client.end();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

runMigration();
