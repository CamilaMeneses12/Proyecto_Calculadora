// =========================================
// registro.js — Maneja el formulario de registro
// =========================================

const API_URL = 'http://localhost:3000/api';

const formulario = document.getElementById('formRegistro');
const divMensaje = document.getElementById('mensaje');

formulario.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre   = document.getElementById('nombre').value.trim();
    const email    = document.getElementById('email').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const password = document.getElementById('password').value;

    divMensaje.className = 'mensaje';
    divMensaje.textContent = '';

    try {
        const respuesta = await fetch(`${API_URL}/registro`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, email, password, telefono })
        });

        const datos = await respuesta.json();

        if (respuesta.ok) {
            mostrarMensaje('exito', '¡Registro exitoso! Redirigiendo al login...');
            formulario.reset();

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);

        } else {
            mostrarMensaje('error', datos.error || 'Error al registrar');
        }

    } catch (err) {
        console.error(err);
        mostrarMensaje('error', 'No se pudo conectar con el servidor. ¿Está corriendo el backend?');
    }
});

function mostrarMensaje(tipo, texto) {
    divMensaje.className = 'mensaje ' + tipo;
    divMensaje.textContent = texto;
}
