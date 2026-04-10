const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:V%23qnF8cX@localhost:5432/powerwoman_db',
});

async function checkUsers() {
  try {
    const result = await pool.query('SELECT id, email, full_name, created_at FROM users ORDER BY created_at DESC LIMIT 10;');
    console.log('\n📊 Usuarios en la base de datos:\n');
    console.table(result.rows);
    console.log(`\nTotal: ${result.rows.length} usuarios\n`);
  } catch (error) {
    console.error('Error consultando base de datos:', error);
  } finally {
    await pool.end();
  }
}

checkUsers();
