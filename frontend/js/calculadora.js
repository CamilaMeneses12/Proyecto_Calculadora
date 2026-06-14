// =========================================
// calculadora.js — Calculadora científica con historial en MySQL
// =========================================

const API_URL = 'http://localhost:3000/api';

let expresion = '';     // Expresión interna (con Math.)
let usuarioId = null;   // ID del usuario logueado

// ─── Verificar sesión ─────────────────────────────
window.onload = function () {
    const usuarioJSON = sessionStorage.getItem('usuario');
    if (!usuarioJSON) {
        window.location.href = 'index.html';
        return;
    }

    const usuario = JSON.parse(usuarioJSON);
    usuarioId = usuario.id;

    const el = document.getElementById('nombreUsuario');
    if (el) el.textContent = usuario.nombre;
};

// ─── Botones del teclado (data-val) ──────────────
document.querySelectorAll('.tecla[data-val]').forEach(btn => {
    btn.addEventListener('click', () => {
        const val = btn.getAttribute('data-val');
        expresion += val;
        actualizarPantalla();
    });
});

// ─── Borrar un carácter ──────────────────────────
document.getElementById('btnBorrar').addEventListener('click', () => {
    expresion = expresion.slice(0, -1);
    actualizarPantalla();
});

// ─── Limpiar todo ────────────────────────────────
document.getElementById('btnLimpiar').addEventListener('click', () => {
    expresion = '';
    actualizarPantalla();
});

// ─── Calcular resultado ──────────────────────────
document.getElementById('btnIgual').addEventListener('click', calcular);

// ─── Botón mostrar historial ─────────────────────
document.getElementById('btnHistorial').addEventListener('click', () => {
    const panel = document.getElementById('panelHistorial');
    panel.style.display = 'block';
    cargarHistorial();
});

// ─── Botón cerrar historial ──────────────────────
document.getElementById('btnCerrarHistorial').addEventListener('click', () => {
    document.getElementById('panelHistorial').style.display = 'none';
});

// ─── Teclado físico ──────────────────────────────
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter')     calcular();
    else if (e.key === 'Backspace') { expresion = expresion.slice(0, -1); actualizarPantalla(); }
    else if (e.key === 'Escape')    { expresion = ''; actualizarPantalla(); }
    else if (/[\d\+\-\*\/\.\(\)]/.test(e.key)) { expresion += e.key; actualizarPantalla(); }
});

// ─── Funciones internas ───────────────────────────

function actualizarPantalla() {
    // Versión legible para mostrar al usuario
    const visible = expresionLegible(expresion);
    document.getElementById('pantalla').value = visible || '0';
}

// Convierte la expresión interna a texto legible
function expresionLegible(expr) {
    return expr
        .replace(/Math\.sin\(/g,   'sin(')
        .replace(/Math\.cos\(/g,   'cos(')
        .replace(/Math\.tan\(/g,   'tan(')
        .replace(/Math\.log10\(/g, 'log(')
        .replace(/Math\.log\(/g,   'ln(')
        .replace(/Math\.sqrt\(/g,  '√(')
        .replace(/Math\.PI/g,      'π')
        .replace(/\*\*/g,          '^')
        .replace(/\*/g,            '×')
        .replace(/\//g,            '÷');
}

async function calcular() {
    if (!expresion.trim()) return;

    // Guardamos la operación visible ANTES de calcular
    const operacionVisible = expresionLegible(expresion);

    try {
        // eslint-disable-next-line no-eval
        const resultado = eval(expresion);

        if (resultado === undefined || resultado === null || isNaN(resultado)) {
            document.getElementById('pantalla').value = 'Error';
            expresion = '';
            return;
        }

        const resultadoStr = String(Number(resultado.toFixed(10)));

        // Mostrar resultado en pantalla
        document.getElementById('pantalla').value = resultadoStr;

        // Guardar en BD: operación completa con resultado
        // Ejemplo guardado: "sin(30) + 5 = 8.5"
        const registroCompleto = `${operacionVisible} = ${resultadoStr}`;
        await guardarCalculo(registroCompleto, resultadoStr);

        // La pantalla queda con el resultado para seguir operando
        expresion = resultadoStr;

    } catch (err) {
        document.getElementById('pantalla').value = 'Error de expresión';
        expresion = '';
    }
}

async function guardarCalculo(operacion, resultado) {
    try {
        await fetch(`${API_URL}/calculos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                usuario_id: usuarioId,
                operacion,   // ej: "5 × 3 = 15"
                resultado    // ej: "15"
            })
        });
    } catch (err) {
        console.warn('No se pudo guardar el cálculo:', err);
    }
}

async function cargarHistorial() {
    const lista = document.getElementById('listaHistorial');
    lista.innerHTML = '<li class="historial-vacio">Cargando...</li>';

    try {
        const resp = await fetch(`${API_URL}/calculos/${usuarioId}`);
        const calculos = await resp.json();

        if (!calculos.length) {
            lista.innerHTML = '<li class="historial-vacio">No hay operaciones guardadas aún.</li>';
            return;
        }

        // Mostrar cada registro como "operacion completa" ya que guardamos "expr = resultado"
        lista.innerHTML = calculos.map((c, i) => `
            <li>
                <span class="historial-num">${i + 1}.</span>
                <span class="historial-expr">${c.operacion}</span>
                <span class="historial-fecha">${new Date(c.fecha).toLocaleString('es-CO')}</span>
            </li>
        `).join('');

    } catch (err) {
        lista.innerHTML = '<li class="historial-vacio">No se pudo cargar el historial.</li>';
    }
}
