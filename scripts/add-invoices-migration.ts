import * as fs from 'fs';
import * as path from 'path';
import { query } from '../src/config/database';

async function runMigration() {
  try {
    console.log('🔄 Ejecutando migración para agregar tabla de facturas...');
    
    const sqlPath = path.join(__dirname, 'add-invoices-table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    await query(sql);
    
    console.log('✅ Tabla de facturas creada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en la migración:', error);
    process.exit(1);
  }
}

runMigration();
