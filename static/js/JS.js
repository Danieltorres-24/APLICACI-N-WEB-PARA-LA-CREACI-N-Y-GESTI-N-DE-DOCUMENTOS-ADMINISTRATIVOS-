// Cargar PDF
document.getElementById('pdf-upload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file.type === "application/pdf") {
        const fileURL = URL.createObjectURL(file);
        document.getElementById('pdf-viewer').src = fileURL;
    }
});

// Funciones de edición
function formatText(command) {
    document.execCommand(command, false, null);
}

function changeTextColor(color) {
    document.execCommand('foreColor', false, color);
}

function guardarDocumento() {
    const contenido = document.getElementById('editable-content').innerHTML;
    // Aquí iría la lógica para guardar el documento
    alert('Documento guardado exitosamente');
}

let usuarios = [];

// Función para cargar usuarios desde la base de datos
async function cargarUsuarios() {
    try {
        const response = await fetch('/api/usuarios');
        usuarios = await response.json();
        mostrarUsuarios(usuarios);
    } catch (error) {
        console.error('Error cargando usuarios:', error);
    }
}

// Función para mostrar usuarios en el dropdown
function mostrarUsuarios(listaUsuarios) {
    const dropdown = document.getElementById('usuarios-dropdown');
    dropdown.innerHTML = listaUsuarios
        .map(usuario => `
            <div class="usuario-item" 
                 data-id="${usuario.Idusuario}"
                 onclick="seleccionarUsuario('${usuario.nombre}', ${usuario.Idusuario})">
                ${usuario.nombre}
            </div>
        `).join('');
}

// Función para seleccionar usuario
function seleccionarUsuario(nombre, id) {
    document.getElementById('nombre-seleccionado').value = nombre;
    toggleDropdown();
    cargarDatosUsuario(id);
}

// Función para cargar datos adicionales del usuario
async function cargarDatosUsuario(idUsuario) {
    try {
        const response = await fetch(`/api/usuarios/${idUsuario}`);
        const usuario = await response.json();
        
        // Aquí puedes cargar los demás datos en el formulario
        console.log('Datos del usuario:', usuario);
    } catch (error) {
        console.error('Error cargando datos del usuario:', error);
    }
}

// Modifica la función toggleDropdown
function toggleDropdown() {
    const dropdown = document.getElementById('usuarios-dropdown');
    const inputRect = document.querySelector('.nombre-input').getBoundingClientRect();
    
    dropdown.style.top = `${inputRect.top}px`;
    dropdown.style.left = `${inputRect.right + 10}px`;
    
    dropdown.classList.toggle('active');
    
    if (dropdown.classList.contains('active') && usuarios.length === 0) {
        cargarUsuarios();
    }
}

// Actualiza el event listener para cerrar el dropdown
document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('usuarios-dropdown');
    const input = document.querySelector('.nombre-input');
    
    if (!input.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove('active');
    }
});

// Funciones generales para los dropdowns
function toggleDropdown(tipo) {
    const dropdown = document.getElementById(`${tipo}-dropdown`);
    const todosDropdowns = document.querySelectorAll('.dropdown-list');
    
    // Cerrar todos los dropdowns primero
    todosDropdowns.forEach(d => d.classList.remove('active'));
    
    // Abrir el seleccionado si no está activo
    if (!dropdown.classList.contains('active')) {
        dropdown.classList.add('active');
        
        // Cargar datos si es necesario
        switch(tipo) {
            case 'usuarios':
                if(usuarios.length === 0) cargarUsuarios();
                break;
            case 'unidades':
                if(unidades.length === 0) cargarUnidades();
                break;
            case 'areas':
                if(areas.length === 0) cargarAreas();
                break;
        }
    }
}

// Cargar datos de ejemplo
let unidades = [];
let areas = [];

async function cargarUnidades() {
    // Simular llamada API
    await new Promise(resolve => setTimeout(resolve, 500));
    unidades = [
        { id: 1, nombre: 'Unidad Administrativa' },
        { id: 2, nombre: 'Unidad Técnica' },
        { id: 3, nombre: 'Unidad de Soporte' }
    ];
    mostrarOpciones('unidades', unidades);
}

async function cargarAreas() {
    // Simular llamada API
    await new Promise(resolve => setTimeout(resolve, 500));
    areas = [
        { id: 1, nombre: 'Recursos Humanos' },
        { id: 2, nombre: 'Tecnología' },
        { id: 3, nombre: 'Contabilidad' }
    ];
    mostrarOpciones('areas', areas);
}

function mostrarOpciones(tipo, datos) {
    const dropdown = document.getElementById(`${tipo}-dropdown`);
    dropdown.innerHTML = datos.map(item => `
        <div class="dropdown-item" 
             onclick="seleccionarItem('${tipo}', '${item.nombre}', ${item.id})">
            ${item.nombre}
        </div>
    `).join('');
}

function seleccionarItem(tipo, nombre, id) {
    document.getElementById(`${tipo}-seleccionad${tipo === 'areas' ? 'a' : 'o'}`).value = nombre;
    cerrarDropdowns();
    
    // Aquí puedes agregar lógica adicional según la selección
    console.log(`${tipo} seleccionad${tipo === 'areas' ? 'a' : 'o'}:`, { id, nombre });
}

function cerrarDropdowns() {
    document.querySelectorAll('.dropdown-list').forEach(d => d.classList.remove('active'));
}

// Cerrar dropdowns al hacer click fuera
document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown-container')) {
        cerrarDropdowns();
    }
});

// Nuevas variables globales
let destinatarios = [];
let grupos = [];
let salidas = [];
let entradas = [];

// Actualiza la función toggleDropdown
function toggleDropdown(tipo) {
    const dropdown = document.getElementById(`${tipo}-dropdown`);
    const todosDropdowns = document.querySelectorAll('.dropdown-list');
    
    todosDropdowns.forEach(d => d.classList.remove('active'));
    
    if (!dropdown.classList.contains('active')) {
        dropdown.classList.add('active');
        
        switch(tipo) {
            case 'destinatarios':
                if(destinatarios.length === 0) cargarDestinatarios();
                break;
            case 'grupos':
                if(grupos.length === 0) cargarGrupos();
                break;
            case 'salidas':
                if(salidas.length === 0) cargarSalidas();
                break;
            case 'entradas':
                if(entradas.length === 0) cargarEntradas();
                break;
            // ... casos anteriores
        }
    }
}

// Funciones de carga de datos (ejemplo)
async function cargarDestinatarios() {
    // Simular API
    await new Promise(resolve => setTimeout(resolve, 500));
    destinatarios = [
        { id: 1, nombre: 'Clientes Internos' },
        { id: 2, nombre: 'Proveedores' },
        { id: 3, nombre: 'Órganos de Control' }
    ];
    mostrarOpciones('destinatarios', destinatarios);
}

async function cargarGrupos() {
    await new Promise(resolve => setTimeout(resolve, 500));
    grupos = [
        { id: 1, nombre: 'Grupo Directivo' },
        { id: 2, nombre: 'Grupo Técnico' },
        { id: 3, nombre: 'Grupo Operativo' }
    ];
    mostrarOpciones('grupos', grupos);
}

async function cargarSalidas() {
    await new Promise(resolve => setTimeout(resolve, 500));
    salidas = [
        { id: 1, nombre: 'Informes Técnicos' },
        { id: 2, nombre: 'Reportes Ejecutivos' },
        { id: 3, nombre: 'Documentos Legales' }
    ];
    mostrarOpciones('salidas', salidas);
}

async function cargarEntradas() {
    await new Promise(resolve => setTimeout(resolve, 500));
    entradas = [
        { id: 1, nombre: 'Requerimientos' },
        { id: 2, nombre: 'Solicitudes' },
        { id: 3, nombre: 'Directrices' }
    ];
    mostrarOpciones('entradas', entradas);
}

// Actualiza la función de selección
function seleccionarItem(tipo, nombre, id) {
    const sufijo = tipo.endsWith('s') ? tipo.slice(0, -1) + 'a' : tipo + 'o';
    document.getElementById(`${tipo}-seleccionad${sufijo}`).value = nombre;
    cerrarDropdowns();
    
    // Lógica adicional según el tipo
    switch(tipo) {
        case 'destinatarios':
            console.log('Destinatario seleccionado:', nombre);
            break;
        case 'grupos':
            console.log('Grupo seleccionado:', nombre);
            break;
        case 'salidas':
            console.log('Salida seleccionada:', nombre);
            break;
        case 'entradas':
            console.log('Entrada seleccionada:', nombre);
            break;
    }
}