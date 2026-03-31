document.addEventListener('DOMContentLoaded', function() {
    const tipoRadios = document.getElementsByName('tipo');
    const agregarBtn = document.getElementById('agregarBtn');
    const tableBody = document.getElementById('tableBody');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const pageInfo = document.getElementById('pageInfo');
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');

    let currentPage = 1;
    let totalPages = 1;
    const registrosPorPagina = 5;
    let currentSearchTerm = '';

    agregarBtn.addEventListener('click', addFolio);
    searchForm.addEventListener('submit', handleSearch);
    prevBtn.addEventListener('click', goToPrevPage);
    nextBtn.addEventListener('click', goToNextPage);

    loadFolios();

    async function loadFolios() {
        try {
            const response = await fetch(`/api/folios?page=${currentPage}&per_page=${registrosPorPagina}&search=${currentSearchTerm}`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Error al cargar folios');
            renderFolios(data.folios);
            updatePagination(data.totalPages);
        } catch (error) {
            console.error(error);
            showAlert(error.message, 'error');
        }
    }

    function renderFolios(folios) {
        tableBody.innerHTML = '';
        if (!folios || folios.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No hay folios registrados</td></tr>';
            return;
        }

        folios.forEach(folio => {
            const row = document.createElement('tr');
            row.setAttribute('data-id', folio.IdSalida);

            // Verificar si el folio tiene acuse
            const tieneAcuse = folio.acuse && folio.acuse.trim() !== "";

            row.innerHTML = `
                <td>${folio.folio}</td>
                <td>${folio.Asunto}</td>
                <td>${folio.tipo}</td>
                <td>
                    <button class="delete-btn">
                        <img src="https://cdn-icons-png.flaticon.com/128/1214/1214428.png" alt="Eliminar" style="width:16px; vertical-align:middle;"> Eliminar
                    </button>
                </td>
                <td>
                    <button class="doc-btn">
                        <img src="https://cdn-icons-png.flaticon.com/128/136/136524.png" alt="Documento" style="width:16px; vertical-align:middle;"> Ver Documento
                    </button>
                </td>
                <td>
                    ${tieneAcuse 
                        ? `<button class="acuse-view-btn">
                                <img src="https://cdn-icons-png.flaticon.com/128/1828/1828884.png" alt="Acuse" style="width:16px; vertical-align:middle;"> Ver Acuse
                           </button>` 
                        : `<button class="acuse-upload-btn">
                                <img src="https://cdn-icons-png.flaticon.com/128/992/992651.png" alt="Subir Acuse" style="width:16px; vertical-align:middle;"> Subir Acuse
                           </button>`}
                </td>
            `;
            tableBody.appendChild(row);

            // Botones
            row.querySelector('.delete-btn').addEventListener('click', () => deleteFolio(folio.IdSalida));
            row.querySelector('.doc-btn').addEventListener('click', (event) => goToDocumento(folio.IdSalida, event));

            if (tieneAcuse) {
                row.querySelector('.acuse-view-btn').addEventListener('click', () => {
                    window.open(`/static/acuse/${folio.acuse}`, '_blank');
                });
            } else {
                row.querySelector('.acuse-upload-btn').addEventListener('click', () => subirAcuse(folio.IdSalida, row));
            }
        });
    }

    // Subir acuse PDF
    function subirAcuse(folioId, row) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/pdf';
        input.click();

        input.onchange = async () => {
            const file = input.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('acuse', file);

            try {
                const res = await fetch(`/api/folios/acuse/${folioId}`, { method: 'POST', body: formData });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Error al subir acuse');

                showAlert('Acuse subido correctamente', 'success');

                // Cambiar botón a "Ver Acuse"
                const td = row.querySelector('td:last-child');
                td.innerHTML = `<button class="acuse-view-btn">
                                    <img src="https://cdn-icons-png.flaticon.com/128/1828/1828884.png" alt="Acuse" style="width:16px; vertical-align:middle;"> Ver Acuse
                                </button>`;
                td.querySelector('button').addEventListener('click', () => {
                    window.open(`/static/acuse/${data.file}`, '_blank');
                });

            } catch (err) {
                showAlert(err.message, 'error');
            }
        };
    }


    async function addFolio() {
    const tipo = document.querySelector('input[name="tipo"]:checked').value;
    const asunto = document.getElementById('asuntoInput').value.trim();
    if (!asunto) { showAlert('Debe escribir un asunto', 'error'); return; }

    const formData = new FormData();
    formData.append('tipo', tipo);
    formData.append('asunto', asunto);

    try {
        const response = await fetch('/api/folios', { method: 'POST', body: formData });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Error al agregar folio');

        showAlert(`Folio generado: ${data.folio}`, 'success');

        // Crear fila para el nuevo folio
        const row = document.createElement('tr');
        row.setAttribute('data-id', data.IdSalida);
        row.innerHTML = `
            <td>${data.folio}</td>
            <td>${data.Asunto}</td>
            <td>${data.tipo}</td>
            <td>
                <button class="delete-btn">
                    <img src="https://cdn-icons-png.flaticon.com/128/1214/1214428.png" alt="Eliminar" style="width:16px; vertical-align:middle;"> Eliminar
                </button>
            </td>
            <td>
                <button class="doc-btn">
                    <img src="https://cdn-icons-png.flaticon.com/128/136/136524.png" alt="Documento" style="width:16px; vertical-align:middle;"> Ver Documento
                </button>
            </td>
            <td><button class="acuse-upload-btn">Subir Acuse</button></td>
        `;

        tableBody.prepend(row);

        // Botones
        row.querySelector('.delete-btn').addEventListener('click', () => deleteFolio(data.IdSalida));
        row.querySelector('.doc-btn').addEventListener('click', (event) => goToDocumento(data.IdSalida, event));
        row.querySelector('.acuse-upload-btn').addEventListener('click', () => subirAcuse(data.IdSalida, row));

        // Limpiar input
        document.getElementById('asuntoInput').value = '';

    } catch (error) {
        console.error(error);
        showAlert(error.message, 'error');
    }
}


    async function deleteFolio(id) {
        if (!confirm('¿Desea eliminar este folio?')) return;
        try {
            const response = await fetch(`/api/folios/${id}`, { method: 'DELETE' });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Error al eliminar folio');
            showAlert('Folio eliminado correctamente', 'success');
            loadFolios();
        } catch (error) {
            console.error(error);
            showAlert(error.message, 'error');
        }
    }

    function goToDocumento(folioId, event) {
        event.preventDefault();
        window.location.href = `/documento?folio_id=${folioId}`;
    }

    function handleSearch(e) {
        e.preventDefault();
        currentSearchTerm = searchInput.value.trim();
        currentPage = 1;
        loadFolios();
    }

    function updatePagination(total) {
        totalPages = total;
        prevBtn.disabled = currentPage <= 1;
        nextBtn.disabled = currentPage >= totalPages;
        pageInfo.textContent = totalPages ? `Página ${currentPage} de ${totalPages}` : 'No hay resultados';
    }

    function goToPrevPage() { if (currentPage > 1) { currentPage--; loadFolios(); } }
    function goToNextPage() { if (currentPage < totalPages) { currentPage++; loadFolios(); } }

    function showAlert(msg, type) {
        const alert = document.createElement('div');
        alert.className = `alert ${type}`;
        alert.textContent = msg;
        document.body.appendChild(alert);
        setTimeout(() => alert.remove(), 3000);
    }
});
