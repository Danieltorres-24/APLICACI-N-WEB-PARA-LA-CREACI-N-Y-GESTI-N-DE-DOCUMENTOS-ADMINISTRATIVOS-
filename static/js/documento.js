let currentFolioId = null;
let currentFolioData = null;
let currentBorradorData = null;
let destinatariosSeleccionados = [];
let quill = null; // Agregado para Quill

document.addEventListener('DOMContentLoaded', function() {
    currentFolioId = folioId;
    currentFolioData = folioData;
    currentBorradorData = borradorData;

    if (!currentFolioId || !currentFolioData) {
        alert('No se ha especificado un folio válido');
        window.location.href = '/folios';
        return;
    }

    // Inicializar Quill
    quill = new Quill('#editor', {
        theme: 'snow',
        modules: {
            toolbar: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'align': [] }],
                [{ 'color': [] }, { 'background': [] }],
                ['link', 'image', 'video'],
                ['table'],
                ['clean']
            ]
        }
    });

    // Cargar contenido del borrador en Quill si existe
    if (currentBorradorData?.cuerpo) {
        quill.root.innerHTML = currentBorradorData.cuerpo;
    }

    // Botones
    document.getElementById('preview-btn')?.addEventListener('click', generatePreview);
    document.getElementById('generate-btn')?.addEventListener('click', generateWordDocument);
    document.getElementById('cancel-btn')?.addEventListener('click', () => window.location.href='/folios');

    // Eventos de inputs (vista previa automática)
    quill.on('text-change', generatePreview);

    // Cargar destinatarios del select
    loadDestinatarios();

    // Cargar destinatarios del borrador si existen
    if (currentBorradorData?.destinatarios) {
        currentBorradorData.destinatarios.forEach(d => agregarDestinatario(d.id, d.nombre, d.cargo));
    }

    // Vista previa inicial
    setTimeout(generatePreview, 500);
});

// -------------------- DESTINATARIOS --------------------
function loadDestinatarios() {
    const select = document.getElementById('destinatario');
    if (!select) return;
    select.addEventListener('change', manejarSeleccionDestinatarios);
}

function manejarSeleccionDestinatarios() {
    const select = document.getElementById('destinatario');
    Array.from(select.selectedOptions).forEach(opt => {
        const id = opt.value;
        const nombre = opt.getAttribute('data-nombre');
        const cargo = opt.getAttribute('data-cargo');
        if (!destinatariosSeleccionados.some(d => d.id === id)) {
            destinatariosSeleccionados.push({id, nombre, cargo});
        }
    });
    actualizarChipsDestinatarios();
    generatePreview();
}

function agregarDestinatario(id, nombre, cargo) {
    if (!destinatariosSeleccionados.some(d => d.id === id)) {
        destinatariosSeleccionados.push({id, nombre, cargo});
        actualizarChipsDestinatarios();
    }
}

function actualizarChipsDestinatarios() {
    const cont = document.getElementById('destinatariosSeleccionados');
    if (!cont) return;
    cont.innerHTML = '';
    destinatariosSeleccionados.forEach(d => {
        const div = document.createElement('div');
        div.className = 'destinatario-chip';
        div.innerHTML = `<span>${d.nombre} - ${d.cargo}</span> <button data-id="${d.id}">×</button>`;
        cont.appendChild(div);
        div.querySelector('button').addEventListener('click', () => quitarDestinatario(d.id));
    });
}

function quitarDestinatario(id) {
    destinatariosSeleccionados = destinatariosSeleccionados.filter(d => d.id !== id);
    actualizarChipsDestinatarios();
    generatePreview();
}

// -------------------- VISTA PREVIA --------------------
function generatePreview() {
    const cuerpo = quill.root.innerHTML; // Usamos Quill
    const elaborador = document.getElementById('elaborador').value;
    const autorizo = document.getElementById('autorizo').value;
    const conCopia = document.getElementById('con_copia').value;

    const areaNombre = currentFolioData.origenArea || '';
    const unidadNombre = 'Unidad de medicina familiar No9';
    const folioNumero = currentFolioData.folio || '----';
    const fechaActual = new Date().toLocaleDateString('es-ES', { day:'2-digit', month:'long', year:'numeric' });

    let destinatariosHTML = '';
    if (destinatariosSeleccionados.length > 0) {
        destinatariosHTML = destinatariosSeleccionados.map(d => `${d.nombre} - ${d.cargo}`).join('<br>');
    } else {
        destinatariosHTML = 'Por favor seleccione al menos un destinatario';
    }

    const previewHTML = `
        <div><strong>Of. N° ${folioNumero}</strong></div>
        <div>Acapulco de Juárez, Gro., a ${fechaActual}</div>
        <div><strong>Unidad:</strong> ${unidadNombre}</div>
        <div><strong>Área:</strong> ${areaNombre}</div>
        <div>${destinatariosHTML}</div>
        <div><strong>PRESENTE.</strong></div>
        <p>${cuerpo}</p>
        <p>Sin más por el momento, reciba un cordial saludo.</p>
        <div><strong>Atentamente,</strong></div>
        <div>Ing. Javier Alfonso Endañu Zapi</div>
        <div>Titular de la Coordinación de Informática</div>
        <div>Elaboró: ${elaborador}</div>
        <div>Autorizó: ${autorizo}</div>
        <div>Con copia: ${conCopia}</div>
    `;
    document.getElementById('preview-content').innerHTML = previewHTML;
}

// -------------------- GENERAR WORD --------------------
async function generateWordDocument() {
    const elaborador = document.getElementById('elaborador').value;
    const autorizo = document.getElementById('autorizo').value;
    const conCopia = document.getElementById('con_copia').value;

    // Tomar destinatarios si no hay
    if (!destinatariosSeleccionados || destinatariosSeleccionados.length === 0) {
        const select = document.getElementById('destinatario');
        destinatariosSeleccionados = Array.from(select.selectedOptions).map(opt => ({
            id: opt.value,
            nombre: opt.getAttribute('data-nombre') || '',
            cargo: opt.getAttribute('data-cargo') || ''
        }));
    }

    if (destinatariosSeleccionados.length === 0) { 
        alert('Seleccione al menos un destinatario'); 
        return; 
    }

    const payload = {
        folio_id: currentFolioId,
        destinatarios: destinatariosSeleccionados,
        cuerpo: quill.root.innerHTML, 
        elaborador: elaborador,
        autorizo: autorizo,
        copia: conCopia
    };

    const res = await fetch('/generar_documento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert('Error al generar documento: ' + (err.error || res.statusText));
        return;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const nombreFolio = (currentFolioData?.folio || 'Oficio').replace(/[\/\\:*\?"<>|]/g, '_');
    a.download = `Oficio_${nombreFolio}.docx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    alert('Documento descargado correctamente');
}

// -------------------- ALERTAS --------------------
function showAlert(message, type) {
    document.querySelectorAll('.alert').forEach(alert => alert.remove());
    const alert = document.createElement('div');
    alert.className = `alert ${type}`;
    alert.innerHTML = message;
    alert.style.cssText = `
        position: fixed; top: 20px; right: 20px; padding: 15px 20px; border-radius: 8px;
        color: white; font-weight: 500; z-index: 10000; animation: slideIn 0.3s ease; max-width: 400px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    if (type === 'error') alert.style.background = '#e74c3c';
    else if (type === 'success') alert.style.background = '#27ae60';
    else alert.style.background = '#3498db';
    document.body.appendChild(alert);
    setTimeout(() => { 
        alert.style.animation = 'slideOut 0.3s ease'; 
        setTimeout(() => { if (alert.parentNode) alert.parentNode.removeChild(alert); }, 300); 
    }, 4000);
}
