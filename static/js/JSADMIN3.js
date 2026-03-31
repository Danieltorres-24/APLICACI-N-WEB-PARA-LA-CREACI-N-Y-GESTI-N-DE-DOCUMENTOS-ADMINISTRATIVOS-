document.addEventListener("DOMContentLoaded", function () {
    const table = document.getElementById("grupos-table");
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
        fetch('/get_grupos') // Asegúrate de tener una ruta para obtener los grupos
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al cargar los datos');
                }
                return response.json();
            })
            .then(data => {
                tbody.innerHTML = ''; // Limpiar la tabla antes de cargar nuevos datos
                data.forEach(grupo => {
                    const newRow = document.createElement("tr");
                    newRow.dataset.existing = "true";

                    newRow.innerHTML = `
                        <td>${grupo.idGrupo}</td>
                        <td>${grupo.nombre}</td>
                        <td>${grupo.fecha}</td>
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

    if (addBtn) {
        addBtn.addEventListener("click", function () {
            const newRow = document.createElement("tr");
            newRow.innerHTML = `
                <td></td> <!-- ID se generará automáticamente -->
                <td><input type="text" placeholder="Ingrese el nombre del grupo" /></td>
                <td></td> <!-- Fecha se generará automáticamente -->
            `;
            newRow.dataset.existing = "false"; // Indicar que es una nueva fila
            tbody.appendChild(newRow);
            selectedRow = newRow; // Seleccionar la nueva fila
            setupRowSelection();
        });
    }

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
            if (confirm("¿Estás seguro de que deseas eliminar este grupo?")) {
                const cells = selectedRow.querySelectorAll("td");
                const idGrupo = cells[0].textContent;
                fetch(`/delete_grupo/${idGrupo}`, {
                    method: 'POST'
                })
                .then(response => {
                    if (response.ok) {
                        selectedRow.remove();
                        selectedRow = null;
                    } else {
                        alert("Error al eliminar el grupo.");
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert("Error al eliminar el grupo.");
                });
            }
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
            if (!updatedData[1]) {
                return alert("Por favor, completa el campo nombre.");
            }

            const isExisting = selectedRow.dataset.existing === "true";
            let endpoint, body;
            
            if (isExisting) {
                endpoint = `/edit_grupo/${rowId}`;
                body = {
                    nombre: updatedData[1],
                    fecha: updatedData[2] // Si decides permitir la edición de la fecha
                };
            } else {
                endpoint = `/add_grupo`;
                body = {
                    nombre: updatedData[1]
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
