// =========================================
// listado.js — Carga y muestra la lista de usuarios
// =========================================

const API_URL = 'http://localhost:3000/api';

window.onload = async function () {
    // Verificar sesión
    const usuarioJSON = sessionStorage.getItem('usuario');
    if (!usuarioJSON) {
        window.location.href = 'index.html';
        return;
    }

    const divMensaje   = document.getElementById('mensaje');
    const tablaUsuarios = document.getElementById('tablaUsuarios');

    try {
        const respuesta = await fetch(`${API_URL}/usuarios`);
        const usuarios  = await respuesta.json();

        if (!respuesta.ok) {
            divMensaje.className = 'mensaje error';
            divMensaje.textContent = 'Error al cargar usuarios';
            return;
        }

        if (usuarios.length === 0) {
            tablaUsuarios.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center; color:#6c757d;">
                        No hay usuarios registrados.
                    </td>
                </tr>`;
            return;
        }

        // Construir filas de la tabla
        tablaUsuarios.innerHTML = usuarios.map((u, i) => `
            <tr>
                <td>${i + 1}</td>
                <td>${u.nombre}</td>
                <td>${u.email}</td>
                <td>${u.telefono}</td>
                <td>${new Date(u.fecha_registro).toLocaleString('es-CO')}</td>
            </tr>
        `).join('');

    } catch (err) {
        console.error(err);
        divMensaje.className = 'mensaje error';
        divMensaje.textContent = 'No se pudo conectar con el servidor.';
    }
};
