const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
    : {
        host: 'localhost',
        port: 5432,
        database: 'marketplace_db',
        user: 'postgres',
        password: '',
      }
);

pool.connect((err, client, release) => {
  if (err) {
    console.error('Error al conectar con PostgreSQL:', err.message);
  } else {
    console.log('Conexión a PostgreSQL establecida');
    release();
  }
});

module.exports = pool;