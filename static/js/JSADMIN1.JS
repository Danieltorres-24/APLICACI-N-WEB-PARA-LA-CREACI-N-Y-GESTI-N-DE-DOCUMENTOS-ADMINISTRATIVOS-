document.addEventListener("DOMContentLoaded", function () {
    const table = document.getElementById("unidades-table"); // Selecciona solo la tabla de unidades
    let selectedRow = null;
    const tbody = table.querySelector("tbody");

    const setupRowSelection = () => {
        const rows = tbody.querySelectorAll("tr");
        rows.forEach(row => {
            if (!row.hasAttribute('data-existing')) {
                row.dataset.existing = "true";
            }
            
            row.addEventListener("click", function () {
                if (selectedRow) selectedRow.classList.remove("selected");
                selectedRow = this;
                selectedRow.classList.add("selected");
            });
        });
    };
    setupRowSelection();

    const loadData = () => {
        fetch('/get_unidades') // Asegúrate de que este endpoint esté definido en tu servidor
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al cargar los datos');
                }
                return response.json();
            })
            .then(data => {
                // Verifica que los datos no estén vacíos
                if (!Array.isArray(data) || data.length === 0) {
                    alert("No se encontraron unidades.");
                    return;
                }

                data.forEach(unidad => {
                    const newRow = document.createElement("tr");
                    newRow.dataset.existing = "true"; // Marca la fila como existente

                    // Asegúrate de que las propiedades coincidan con las que devuelve el servidor
                    newRow.innerHTML = `
                        <td>${unidad.id}</td>
                        <td>${unidad.nombre}</td>
                        <td>${unidad.descripcion}</td>
                        <td>${unidad.localidad}</td>
                        <td>${new Date(unidad.fecha).toLocaleString()}</td>
                    `;

                    tbody.appendChild(newRow);
                });
                setupRowSelection(); // Vuelve a configurar la selección de filas
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
                if (index !== 0 && index !== 4) { // No editar la columna ID (0) ni la fecha (4)
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
                const unidadId = selectedRow.cells[0].textContent;
                fetch(`/delete_unidad/${unidadId}`, {
                    method: 'POST'
                })
                .then(response => {
                    if (response.ok) {
                        selectedRow.remove();
                        selectedRow = null;
                    } else {
                        alert("Error al eliminar la unidad.");
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert("Error al eliminar la unidad.");
                });
            }
        });
    }

    if (addBtn) {
        addBtn.addEventListener("click", function () {
            const columnCount = table.querySelector("thead tr").children.length;
            const newRow = document.createElement("tr");
            const rows = tbody.querySelectorAll("tr");
            let newId = 1;

            if (rows.length > 0) {
                const ids = Array.from(rows).map(row => {
                    const idCell = row.cells[0];
                    return parseInt(idCell.textContent) || 0;
                });
                newId = Math.max(...ids) + 1;
            }

            for (let i = 0; i < columnCount; i++) {
                const td = document.createElement("td");
                if (i === 0) {
                    td.textContent = newId; 
                } else if (i === 4) { // Columna de fecha
                    td.textContent = new Date().toLocaleString(); // Establecer la fecha actual
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
            
            // Recopilamos los datos actualizados
            cells.forEach((cell, index) => {
                const input = cell.querySelector("input");
                updatedData[index] = input ? input.value : cell.textContent;
            });

            // Validación de datos
            if (!updatedData[1] || !updatedData[2] || !updatedData[3]) {
                return alert("Por favor, completa todos los campos requeridos.");
            }

            // Determinar si es una edición o un nuevo registro
            const isExisting = selectedRow.dataset.existing === "true";

            let endpoint, body;
            
            if (isExisting) {
                endpoint = `/edit_unidad/${rowId}`;
                body = {
                    nombre: updatedData[1],
                    descripcion: updatedData[2],
                    localidad: updatedData[3]
                };
            } else {
                endpoint = `/add_unidad`;
                body = {
                    nombre: updatedData[1],
                    descripcion: updatedData[2],
                    localidad: updatedData[3]
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
                    if (index !== 0 && index !== 4) { // No actualizar la columna ID (0) ni la fecha (4)
                        cell.textContent = updatedData[index];
                    }
                });
                // Marcamos la fila como existente
                selectedRow.dataset.existing = "true";
                
                // Si es nuevo registro, actualizar el ID con el que devuelve el servidor
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

    // Cargar los datos al cargar la página
    loadData();
});
