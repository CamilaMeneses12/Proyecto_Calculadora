// =========================================
// login.js — Maneja el formulario de inicio de sesión
// =========================================

const API_URL = 'http://localhost:3000/api';

const formulario = document.getElementById('formLogin');
const divMensaje = document.getElementById('mensaje');

formulario.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    // Limpiar mensaje anterior
    divMensaje.className = 'mensaje';
    divMensaje.textContent = '';

    try {
        const respuesta = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const datos = await respuesta.json();

        if (respuesta.ok) {
            // Guardar usuario en sessionStorage
            sessionStorage.setItem('usuario', JSON.stringify(datos.usuario));
            mostrarMensaje('exito', `¡Bienvenido, ${datos.usuario.nombre}! Redirigiendo...`);

            setTimeout(() => {
                window.location.href = 'bienvenida.html';
            }, 1000);

        } else {
            mostrarMensaje('error', datos.error || 'Error desconocido');
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
