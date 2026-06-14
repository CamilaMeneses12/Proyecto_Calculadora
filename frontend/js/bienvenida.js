// =========================================
// bienvenida.js — Verifica sesión y muestra nombre
// =========================================

window.onload = function () {
    const usuarioJSON = sessionStorage.getItem('usuario');

    // Si no hay sesión, redirigir al login
    if (!usuarioJSON) {
        window.location.href = 'index.html';
        return;
    }

    const usuario = JSON.parse(usuarioJSON);

    // Mostrar nombre del usuario
    const el = document.getElementById('nombreUsuario');
    if (el) el.textContent = usuario.nombre;
};

// Cierra sesión: borra sessionStorage y vuelve al login
function cerrarSesion() {
    sessionStorage.clear();
    window.location.href = 'index.html';
}
