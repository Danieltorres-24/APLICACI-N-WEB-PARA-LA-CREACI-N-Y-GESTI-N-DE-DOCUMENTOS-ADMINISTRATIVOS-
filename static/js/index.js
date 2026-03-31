document.addEventListener('DOMContentLoaded', () => {
    const foliosBody = document.getElementById('folios-body');
    let currentPage = 1;

    function cargarFolios(page = 1) {
        fetch(`/api/folios?page=${page}`)
            .then(async res => {
                if (!res.ok) {
                    const error = await res.json();
                    throw new Error(error.error || 'Error al cargar folios');
                }
                return res.json();
            })
            .then(data => {
                mostrarFolios(data.folios);
            })
            .catch(err => {
                foliosBody.innerHTML = `<tr><td colspan="4">${err.message}</td></tr>`;
                console.error(err);
            });
    }

    function mostrarFolios(folios) {
        foliosBody.innerHTML = '';

        if (!folios || folios.length === 0) {
            foliosBody.innerHTML = `<tr><td colspan="4">No hay folios disponibles</td></tr>`;
            return;
        }

        folios.forEach(folio => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${folio.IdSalida}</td>
                <td>${folio.origenArea}</td>
                <td>${folio.folio}</td>
                <td>${folio.tipo}</td>
                <td>${folio.fecha_registro}</td>
            `;
            foliosBody.appendChild(fila);
        });
    }

    cargarFolios(currentPage);
});
