document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    const nombreInput = document.getElementById('nombreInput');
    const cargoInput = document.getElementById('cargoInput');
    const agregarBtn = document.getElementById('agregarBtn');
    const tableBody = document.getElementById('tableBody');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const pageInfo = document.getElementById('pageInfo');
    
    let currentPage = 1;
    let totalPages = 1;
    let currentEditId = null;
    
    loadDestinatarios();
    
    agregarBtn.addEventListener('click', addDestinatario);
    prevBtn.addEventListener('click', goToPrevPage);
    nextBtn.addEventListener('click', goToNextPage);
    searchInput.addEventListener('input', handleSearch);
    
    tableBody.addEventListener('click', function(e) {
        const btn = e.target.closest('button');
        if (!btn) return;
        
        const row = btn.closest('tr');
        const id = row.getAttribute('data-id');
        
        if (btn.classList.contains('edit-btn')) {
            startEditing(row, id);
        } else if (btn.classList.contains('delete-btn')) {
            deleteDestinatario(id, row);
        } else if (btn.classList.contains('save-btn')) {
            saveEditedDestinatario(row, id);
        } else if (btn.classList.contains('cancel-btn')) {
            cancelEdit(row, id);
        }
    });
    
    
    async function loadDestinatarios() {
        try {
            const response = await fetch(`/api/destinatarios?page=${currentPage}&search=${encodeURIComponent(searchInput.value.trim())}`);
            
            if (!response.ok) {
                throw new Error('Error al cargar destinatarios');
            }
            
            const data = await response.json();
            
            totalPages = data.total_pages || 1;
            currentPage = data.current_page || 1;
            
            renderTable(data.destinatarios || []);
            updatePagination();
        } catch (error) {
            console.error('Error:', error);
            showAlert(error.message || 'Error al cargar destinatarios', 'error');
        }
    }
    
    function renderTable(destinatarios) {
        tableBody.innerHTML = '';
        
        if (destinatarios.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="3" class="no-data">No hay destinatarios registrados</td></tr>';
            return;
        }
        
        destinatarios.forEach(destinatario => {
            const row = document.createElement('tr');
            row.setAttribute('data-id', destinatario.id);
            row.innerHTML = `
                <td class="nombre-cell">${destinatario.nombre}</td>
                <td class="cargo-cell">${destinatario.cargo}</td>
                <td class="actions">
                    <button type="button" class="icon-btn edit-btn" title="Editar">
                        <img src="https://cdn-icons-png.flaticon.com/128/8188/8188360.png" alt="Editar">
                    </button>
                    <button type="button" class="icon-btn delete-btn" title="Eliminar">
                        <img src="https://cdn-icons-png.flaticon.com/128/3221/3221897.png" alt="Eliminar">
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }
    
    async function addDestinatario() {
        const nombre = nombreInput.value.trim();
        const cargo = cargoInput.value.trim();
        
        if (!nombre || !cargo) {
            showAlert('Por favor complete todos los campos', 'error');
            return;
        }
        
        try {
            const response = await fetch('/api/destinatarios', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nombre, cargo }),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al agregar destinatario');
            }
            
            showAlert('Destinatario agregado correctamente', 'success');
            nombreInput.value = '';
            cargoInput.value = '';
            loadDestinatarios();
        } catch (error) {
            console.error('Error:', error);
            showAlert(error.message, 'error');
        }
    }
    
    function startEditing(row, id) {
        if (currentEditId && currentEditId !== id) {
            const previousEditRow = document.querySelector(`tr[data-id="${currentEditId}"]`);
            if (previousEditRow) cancelEdit(previousEditRow, currentEditId);
        }
        
        currentEditId = id;
        
        const nombre = row.querySelector('.nombre-cell').textContent;
        const cargo = row.querySelector('.cargo-cell').textContent;
        
        row.querySelector('.nombre-cell').innerHTML = `
            <input type="text" class="edit-input" value="${nombre}" data-field="nombre">
        `;
        row.querySelector('.cargo-cell').innerHTML = `
            <input type="text" class="edit-input" value="${cargo}" data-field="cargo">
        `;
        
        row.querySelector('.actions').innerHTML = `
            <button type="button" class="icon-btn save-btn" title="Guardar">
                <img src="https://cdn-icons-png.flaticon.com/128/5667/5667029.png" alt="Guardar">
            </button>
            <button type="button" class="icon-btn cancel-btn" title="Cancelar">
                <img src="https://cdn-icons-png.flaticon.com/128/753/753345.png" alt="Cancelar">
            </button>
        `;
        
        row.querySelector('.edit-input').focus();
    }
    
    async function saveEditedDestinatario(row, id) {
        const nombre = row.querySelector('[data-field="nombre"]').value.trim();
        const cargo = row.querySelector('[data-field="cargo"]').value.trim();
        
        if (!nombre || !cargo) {
            showAlert('Por favor complete todos los campos', 'error');
            return;
        }
        
        try {
            const response = await fetch(`/api/destinatarios/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nombre, cargo }),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al actualizar destinatario');
            }
            
            showAlert('Destinatario actualizado correctamente', 'success');
            loadDestinatarios();
        } catch (error) {
            console.error('Error:', error);
            showAlert(error.message, 'error');
        } finally {
            currentEditId = null;
        }
    }
    
    function cancelEdit(row, id) {
        currentEditId = null;
        loadDestinatarios();
    }
    
    async function deleteDestinatario(id, row) {
        if (!confirm('¿Está seguro de que desea eliminar este destinatario?')) return;
        
        try {
            const response = await fetch(`/api/destinatarios/${id}`, {
                method: 'DELETE',
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al eliminar destinatario');
            }
            
            showAlert('Destinatario eliminado correctamente', 'success');
            loadDestinatarios();
        } catch (error) {
            console.error('Error:', error);
            showAlert(error.message, 'error');
        }
    }
    
    function handleSearch() {
        currentPage = 1;
        loadDestinatarios();
    }
    
    function updatePagination() {
        pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage === totalPages || totalPages === 0;
    }
    
    function goToPrevPage() {
        if (currentPage > 1) {
            currentPage--;
            loadDestinatarios();
        }
    }
    
    function goToNextPage() {
        if (currentPage < totalPages) {
            currentPage++;
            loadDestinatarios();
        }
    }
    
    function showAlert(message, type) {
        const alert = document.createElement('div');
        alert.className = `notification ${type}`;
        alert.textContent = message;
        document.body.appendChild(alert);
        
        setTimeout(() => {
            alert.remove();
        }, 3000);
    }
});