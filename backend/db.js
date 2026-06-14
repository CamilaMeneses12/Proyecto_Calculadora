// =========================================
// db.js — Conexión a MySQL con pool de conexiones
// =========================================
require('dotenv').config();
const mysql = require('mysql2');

const pool = mysql.createPool({
    host:     process.env.DB_HOST,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const promisePool = pool.promise();

// Verificar conexión al iniciar
promisePool.query('SELECT 1')
    .then(() => console.log('✓ Conexión a MySQL exitosa'))
    .catch(err => console.error('✗ Error MySQL:', err.message));

module.exports = promisePool;
