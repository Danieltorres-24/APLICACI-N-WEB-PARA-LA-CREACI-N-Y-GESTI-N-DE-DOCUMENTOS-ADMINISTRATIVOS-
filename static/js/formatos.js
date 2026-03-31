document.addEventListener('DOMContentLoaded', () => {
    // Botón para copiar contenido del formato
    document.getElementById('btnCopiar').addEventListener('click', function () {
        fetch('/copiar_doc')
            .then(response => response.json())
            .then(data => {
                if (data.texto) {
                    navigator.clipboard.writeText(data.texto)
                        .then(() => {
                            mostrarNotificacion("Contenido copiado al portapapeles.");
                        })
                        .catch(err => {
                            mostrarNotificacion("No se pudo copiar el contenido.", true);
                            console.error(err);
                        });
                } else if (data.error) {
                    mostrarNotificacion("Error: " + data.error, true);
                }
            })
            .catch(error => {
                mostrarNotificacion("Error al conectar con el servidor.", true);
                console.error(error);
            });
    });

    // Formulario para subir documento
    const form = document.getElementById('formSubir');
    const documentoInput = document.getElementById('documentoInput');

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const archivo = documentoInput.files[0];

        if (!archivo || !archivo.name.toLowerCase().endsWith('.docx')) {
            mostrarNotificacion("Solo se permiten archivos .docx", true);
            return;
        }

        const formData = new FormData();
        formData.append('documento', archivo);

        fetch('/subir_plantilla', {
            method: 'POST',
            body: formData
        })
            .then(res => res.json())
            .then(data => {
                if (data.mensaje) {
                    mostrarNotificacion(data.mensaje);
                    documentoInput.value = '';
                } else if (data.error) {
                    mostrarNotificacion("Error: " + data.error, true);
                }
            })
            .catch(err => {
                mostrarNotificacion("Error al subir el archivo.", true);
                console.error(err);
            });
    });

    // Función para mostrar notificación flotante
    function mostrarNotificacion(mensaje, esError = false) {
        const noti = document.getElementById('notificacion');
        noti.textContent = mensaje;
        noti.style.backgroundColor = esError ? '#f44336' : '#4CAF50';
        noti.style.display = 'block';

        setTimeout(() => {
            noti.style.display = 'none';
        }, 4000);
    }
});
