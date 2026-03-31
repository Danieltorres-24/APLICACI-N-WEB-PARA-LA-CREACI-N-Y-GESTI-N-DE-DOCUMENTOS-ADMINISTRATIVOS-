document.addEventListener("DOMContentLoaded", function () {
    const table = document.getElementById("areas-table");
    let selectedRow = null;
    const tbody = table.querySelector("tbody");

    const setupRowSelection = () => {
        const rows = tbody.querySelectorAll("tr");
        rows.forEach(row => {
            row.addEventListener("click", function () {
                if (selectedRow) selectedRow.classList.remove("selected");
                selectedRow = this;
                selectedRow.classList.add("selected");
            });
        });
    };
    setupRowSelection();

    const loadData = () => {
        fetch('/get_areas')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al cargar los datos');
                }
                return response.json();
            })
            .then(data => {
                data.forEach(area => {
                    const newRow = document.createElement("tr");
                    newRow.dataset.existing = "true";

                    newRow.innerHTML = `
                        <td>${area.id}</td>
                        <td>${area.nombre}</td>
                        <td>${area.UI}</td>
                        <td>${area.CC}</td>
                        <td>${area.siglas}</td>
                        <td>${area.fecha}</td>
                    `;

                    tbody.appendChild(newRow);
                });
                setupRowSelection();
            })
            .catch(error => {
                console.error('Error:', error);
                alert("Error al cargar los datos.");
            });
    };

    const editBtn = table.querySelector(".edit-btn");
    const deleteBtn = table.querySelector(".delete-btn");
    const addBtn = table.querySelector(".add-btn");
    const saveBtn = table.querySelector(".save-btn");

    if (editBtn) {
        editBtn.addEventListener("click", function () {
            if (!selectedRow) return alert("Selecciona una fila para editar.");
            const cells = selectedRow.querySelectorAll("td");
            cells.forEach((cell, index) => {
                if (index !== 0) { // No editar la columna ID (0)
                    const value = cell.textContent.trim();
                    cell.innerHTML = `<input type="text" value="${value}" />`;
                }
            });
        });
    }

    if (deleteBtn) {
        deleteBtn.addEventListener("click", function () {
            if (!selectedRow) return alert("Selecciona una fila para eliminar.");
            if (confirm("¿Estás seguro de que deseas eliminar esta fila?")) {
                const areaId = selectedRow.cells[0].textContent;
                fetch(`/delete_area/${areaId}`, {
                    method: 'POST'
                })
                .then(response => {
                    if (response.ok) {
                        selectedRow.remove();
                        selectedRow = null;
                    } else {
                        alert("Error al eliminar el área.");
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert("Error al eliminar el área.");
                });
            }
        });
    }

    if (addBtn) {
        addBtn.addEventListener("click", function () {
            const newRow = document.createElement("tr");
            const columnCount = table.querySelector("thead tr").children.length;

            // Generar un nuevo ID basado en el número de filas existentes
            const newId = tbody.querySelectorAll("tr").length + 1; // Asumiendo que el ID comienza en 1

            for (let i = 0; i < columnCount; i++) {
                const td = document.createElement("td");
                if (i === 0) {
                    td.textContent = newId; // Asignar el nuevo ID
                } else if (i === 5) { // Columna de fecha
                    td.innerHTML = `<input type="text" placeholder="Ingrese fecha" />`; 
                } else {
                    td.innerHTML = `<input type="text" placeholder="Ingrese valor" />`;
                }
                newRow.appendChild(td);
            }

            newRow.dataset.existing = "false";
            tbody.appendChild(newRow);
            if (selectedRow) selectedRow.classList.remove("selected");
            selectedRow = newRow;
            newRow.classList.add("selected");
            
            setupRowSelection();
        });
    }

    if (saveBtn) {
        saveBtn.addEventListener("click", function () {
            if (!selectedRow) return alert("Selecciona una fila para guardar.");
            
            const cells = selectedRow.querySelectorAll("td");
            const rowId = cells[0].textContent;
            const updatedData = {};
            
            cells.forEach((cell, index) => {
                const input = cell.querySelector("input");
                updatedData[index] = input ? input.value : cell.textContent;
            });

            // Validación de datos
            if (!updatedData[1] || !updatedData[2] || !updatedData[3] || !updatedData[4] || !updatedData[5]) {
                return alert("Por favor, completa todos los campos requeridos.");
            }

            const isExisting = selectedRow.dataset.existing === "true";
            let endpoint, body;
            
            if (isExisting) {
                endpoint = `/edit_area/${rowId}`;
                body = {
                    nombre: updatedData[1],
                    UI: updatedData[2],
                    CC: updatedData[3],
                    siglas: updatedData[4],
                    fecha: updatedData[5]
                };
            } else {
                endpoint = `/add_area`;
                body = {
                    nombre: updatedData[1],
                    UI: updatedData[2],
                    CC: updatedData[3],
                    siglas: updatedData[4],
                    fecha: updatedData[5]
                };
            }
            
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
                alert(data.message);
                // Actualizamos las celdas con los nuevos valores
                cells.forEach((cell, index) => {
                    if (index !== 0) { // No actualizar la columna ID (0)
                        cell.textContent = updatedData[index];
                    }
                });
                selectedRow.dataset.existing = "true";
            })
            .catch(error => {
                console.error('Error:', error);
                alert(error.error || "Error al procesar la solicitud.");
            });
        });
    }

    // Cargar los datos al cargar la página
    loadData();
});
