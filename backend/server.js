// =========================================
// server.js — Servidor Express con todos los endpoints
// =========================================
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const bcrypt  = require('bcrypt');
const db      = require('./db');

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Ruta raíz de prueba ──────────────────────────
app.get('/', (req, res) => {
    res.json({ mensaje: 'Servidor backend funcionando ✓' });
});

// =========================================
// POST /api/registro
// Registra un nuevo usuario
// =========================================
app.post('/api/registro', async (req, res) => {
    try {
        const { nombre, email, password, telefono } = req.body;

        // Validaciones
        if (!nombre || !email || !password || !telefono) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }

        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regexEmail.test(email)) {
            return res.status(400).json({ error: 'El correo electrónico no es válido' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'La contraseña debe tener mínimo 6 caracteres' });
        }

        if (!/^\d{10}$/.test(telefono)) {
            return res.status(400).json({ error: 'El teléfono debe tener exactamente 10 dígitos' });
        }

        // Verificar si el correo ya existe
        const [existentes] = await db.query(
            'SELECT id FROM usuarios WHERE email = ?', [email]
        );
        if (existentes.length > 0) {
            return res.status(409).json({ error: 'El correo ya está registrado' });
        }

        // Cifrar contraseña
        const passwordCifrada = await bcrypt.hash(password, 10);

        // Insertar usuario
        const [resultado] = await db.query(
            'INSERT INTO usuarios (nombre, email, password, telefono) VALUES (?, ?, ?, ?)',
            [nombre, email, passwordCifrada, telefono]
        );

        res.status(201).json({
            mensaje: 'Usuario registrado exitosamente',
            id: resultado.insertId
        });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// =========================================
// POST /api/login
// Inicia sesión con email y contraseña
// =========================================
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
        }

        const [usuarios] = await db.query(
            'SELECT id, nombre, email, password FROM usuarios WHERE email = ?', [email]
        );

        if (usuarios.length === 0) {
            return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
        }

        const passwordValida = await bcrypt.compare(password, usuarios[0].password);
        if (!passwordValida) {
            return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
        }

        // Devolver datos del usuario SIN la contraseña
        const { password: _, ...usuarioSinPassword } = usuarios[0];

        res.json({
            mensaje: 'Inicio de sesión exitoso',
            usuario: usuarioSinPassword
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// =========================================
// GET /api/usuarios
// Devuelve la lista de todos los usuarios
// =========================================
app.get('/api/usuarios', async (req, res) => {
    try {
        const [usuarios] = await db.query(
            'SELECT id, nombre, email, telefono, fecha_registro FROM usuarios ORDER BY fecha_registro DESC'
        );
        res.json(usuarios);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
});

// =========================================
// POST /api/calculos
// Guarda un cálculo en el historial del usuario
// =========================================
app.post('/api/calculos', async (req, res) => {
    try {
        const { usuario_id, operacion, resultado } = req.body;

        if (!usuario_id || !operacion || resultado === undefined) {
            return res.status(400).json({ error: 'usuario_id, operacion y resultado son obligatorios' });
        }

        const [insert] = await db.query(
            'INSERT INTO calculos (usuario_id, operacion, resultado) VALUES (?, ?, ?)',
            [usuario_id, operacion, String(resultado)]
        );

        res.status(201).json({ mensaje: 'Cálculo guardado', id: insert.insertId });

    } catch (error) {
        console.error('Error al guardar cálculo:', error);
        res.status(500).json({ error: 'Error al guardar el cálculo' });
    }
});

// =========================================
// GET /api/calculos/:usuario_id
// Devuelve el historial de cálculos de un usuario
// =========================================
app.get('/api/calculos/:usuario_id', async (req, res) => {
    try {
        const { usuario_id } = req.params;

        const [calculos] = await db.query(
            'SELECT id, operacion, resultado, fecha FROM calculos WHERE usuario_id = ? ORDER BY fecha DESC LIMIT 20',
            [usuario_id]
        );

        res.json(calculos);

    } catch (error) {
        console.error('Error al obtener historial:', error);
        res.status(500).json({ error: 'Error al obtener historial' });
    }
});

// ─── Iniciar servidor ─────────────────────────────
app.listen(PORT, () => {
    console.log(`✓ Servidor corriendo en http://localhost:${PORT}`);
});
