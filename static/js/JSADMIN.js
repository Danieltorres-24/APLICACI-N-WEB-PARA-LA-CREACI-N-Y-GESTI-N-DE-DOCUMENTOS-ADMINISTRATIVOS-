// Funciones generales
function toggleDropdown() {
    document.getElementById("dropdown-content").classList.toggle("show");
}

function showTable(type) {
    const tables = document.querySelectorAll(".data-table");
    tables.forEach(t => t.style.display = "none");
    document.getElementById(type + "-table").style.display = "table";
    document.getElementById("dropdown-content").classList.remove("show");
    
    currentTable = type;
    currentPage = 1;
    updatePagination();
}

window.onclick = function(event) {
    if (!event.target.matches('.dropdown-btn')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        for (let i = 0; i < dropdowns.length; i++) {
            dropdowns[i].classList.remove("show");
        }
    }
}

// Paginación
let currentPage = 1;
const rowsPerPage = 10;
let currentTable = 'usuarios';

function updatePagination() {
    const table = document.getElementById(currentTable + "-table");
    if (!table) return;
    
    const tbody = table.querySelector("tbody");
    const rows = Array.from(tbody.querySelectorAll("tr"));
    const totalPages = Math.max(1, Math.ceil(rows.length / rowsPerPage));
    
    currentPage = Math.max(1, Math.min(currentPage, totalPages));
    
    rows.forEach(row => row.style.display = "none");
    
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    rows.slice(start, end).forEach(row => row.style.display = "table-row");
    
    const pageInfo = document.getElementById("pageInfo");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    
    if (pageInfo) pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages || totalPages === 0;
}

function changePage(step) {
    const table = document.getElementById(currentTable + "-table");
    if (!table) return;
    
    const tbody = table.querySelector("tbody");
    const rows = tbody.querySelectorAll("tr");
    const totalPages = Math.max(1, Math.ceil(rows.length / rowsPerPage));
    
    const button = step === -1 ? document.getElementById("prevBtn") : document.getElementById("nextBtn");
    if (button) {
        button.style.transform = "scale(0.95)";
        setTimeout(() => {
            button.style.transform = "";
        }, 200);
    }
    
    currentPage += step;
    updatePagination();
}

// Funciones específicas para la tabla de usuarios
function setupRowSelection() {
    const table = document.getElementById("usuarios-table");
    if (!table) return;
    
    const tbody = table.querySelector("tbody");
    const rows = tbody.querySelectorAll("tr");
    
    rows.forEach(row => {
        if (!row.hasAttribute('data-existing')) {
            row.dataset.existing = "true";
        }
        
        row.addEventListener("click", function() {
            if (selectedRow) selectedRow.classList.remove("selected");
            selectedRow = this;
            selectedRow.classList.add("selected");
        });
    });
}

function createRoleSelector(currentValue = 'usuario') {
    const select = document.createElement('select');
    select.className = 'rol-select';
    
    const roles = [
        { value: 'usuario', text: 'Usuario' },
        { value: 'administrador', text: 'Administrador' },
        { value: 'jefe', text: 'Jefe' },
        { value: 'recepcion', text: 'Recepción' }
    ];
    
    roles.forEach(role => {
        const option = document.createElement('option');
        option.value = role.value;
        option.textContent = role.text;
        if (role.value === currentValue) option.selected = true;
        select.appendChild(option);
    });
    
    return select;
}

// Variables globales
let selectedRow = null;

// Event Listeners
document.addEventListener("DOMContentLoaded", function() {
    // Paginación
    document.getElementById("prevBtn").addEventListener("click", () => changePage(-1));
    document.getElementById("nextBtn").addEventListener("click", () => changePage(1));
    updatePagination();
    
    // Tabla de usuarios
    const table = document.getElementById("usuarios-table");
    if (!table) return;
    
    setupRowSelection();
    
    const editBtn = table.querySelector(".edit-btn");
    const deleteBtn = table.querySelector(".delete-btn");
    const addBtn = table.querySelector(".add-btn");
    const saveBtn = table.querySelector(".save-btn");
    
    // Editar fila
    if (editBtn) {
        editBtn.addEventListener("click", function() {
            if (!selectedRow) return alert("Selecciona una fila para editar.");
            
            const cells = selectedRow.querySelectorAll("td");
            cells.forEach((cell, index) => {
                if (index === 0 || index === cells.length - 1) return; // No editar ID ni Fecha
                
                if (index === 7) { // Campo Rol
                    const currentValue = cell.textContent.trim();
                    cell.innerHTML = '';
                    cell.appendChild(createRoleSelector(currentValue));
                } else {
                    const value = cell.textContent.trim();
                    const inputType = index === 3 ? 'password' : 'text';
                    cell.innerHTML = `<input type="${inputType}" value="${value}" />`;
                }
            });
            
            selectedRow.classList.add("edit-mode");
        });
    }
    
    // Eliminar fila
    if (deleteBtn) {
        deleteBtn.addEventListener("click", function() {
            if (!selectedRow) return alert("Selecciona una fila para eliminar.");
            
            if (confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
                const userId = selectedRow.cells[0].textContent;
                
                fetch(`/delete_user/${userId}`, {
                    method: 'POST'
                })
                .then(response => {
                    if (response.ok) {
                        selectedRow.remove();
                        selectedRow = null;
                        updatePagination();
                    } else {
                        alert("Error al eliminar el usuario.");
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert("Error al eliminar el usuario.");
                });
            }
        });
    }
    
    // Añadir fila
    if (addBtn) {
        addBtn.addEventListener("click", function() {
            const tbody = table.querySelector("tbody");
            const columnCount = table.querySelector("thead tr").children.length;
            const newRow = document.createElement("tr");
            
            // Generar nuevo ID
            const rows = tbody.querySelectorAll("tr");
            let newId = 1;
            if (rows.length > 0) {
                const ids = Array.from(rows).map(row => {
                    return parseInt(row.cells[0].textContent) || 0;
                });
                newId = Math.max(...ids) + 1;
            }
            
            // Crear celdas
            for (let i = 0; i < columnCount; i++) {
                const td = document.createElement("td");
                
                if (i === 0) { // ID
                    td.textContent = newId;
                } else if (i === columnCount - 1) { // Fecha
                    td.textContent = new Date().toLocaleString();
                } else if (i === 7) { // Rol (selector)
                    td.appendChild(createRoleSelector());
                } else { // Otros campos (inputs)
                    const inputType = i === 3 ? 'password' : 'text';
                    td.innerHTML = `<input type="${inputType}" placeholder="Ingrese valor" />`;
                }
                
                newRow.appendChild(td);
            }
            
            newRow.dataset.existing = "false";
            tbody.appendChild(newRow);
            
            if (selectedRow) selectedRow.classList.remove("selected");
            selectedRow = newRow;
            newRow.classList.add("selected");
            newRow.classList.add("edit-mode");
            
            setupRowSelection();
            updatePagination();
        });
    }
    
    // Guardar fila
    if (saveBtn) {
        saveBtn.addEventListener("click", function() {
            if (!selectedRow) return alert("Selecciona una fila para guardar.");
            
            const cells = selectedRow.querySelectorAll("td");
            const rowId = cells[0].textContent;
            const updatedData = {};
            
            // Recopilar datos
            cells.forEach((cell, index) => {
                const input = cell.querySelector("input");
                const select = cell.querySelector("select");
                
                if (select) {
                    updatedData[index] = select.value;
                } else if (input) {
                    updatedData[index] = input.value;
                } else {
                    updatedData[index] = cell.textContent;
                }
            });
            
            // Determinar si es edición o nuevo
            const isExisting = selectedRow.dataset.existing === "true";
            const endpoint = isExisting ? `/edit_user/${rowId}` : '/add_user';
            
            // Preparar datos para enviar
            const body = {
                nombre: updatedData[1],
                correo: updatedData[2],
                cargo: updatedData[4],
                siglas: updatedData[5],
                area: updatedData[6],
                rol: updatedData[7]
            };
            
            // Solo añadir contraseña si se modificó
            if (updatedData[3] && updatedData[3] !== "") {
                body.contrasena = updatedData[3];
            }
            
            // Enviar al servidor
            fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw err; });
                }
                return response.json();
            })
            .then(data => {
                alert(data.message || "Cambios guardados correctamente");
                
                // Actualizar la fila con los nuevos valores
                cells.forEach((cell, index) => {
                    if (index === 0) return; // No tocar ID
                    
                    if (index === 3 && updatedData[3]) { // Contraseña
                        cell.textContent = "••••••";
                    } else if (index === cells.length - 1) { // Fecha
                        cell.textContent = new Date().toLocaleString();
                    } else {
                        cell.textContent = updatedData[index];
                    }
                });
                
                selectedRow.dataset.existing = "true";
                selectedRow.classList.remove("edit-mode");
                
                // Si es nuevo registro, actualizar ID con el del servidor
                if (data.id && !isExisting) {
                    cells[0].textContent = data.id;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert(error.error || "Error al procesar la solicitud.");
            });
        });
    }
});