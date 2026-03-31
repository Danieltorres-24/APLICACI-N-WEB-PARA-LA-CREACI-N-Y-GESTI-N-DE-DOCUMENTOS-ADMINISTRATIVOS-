let registrosPorPagina = 5;
let paginaActualRegistros = 1;

// Fecha automática en formato YYYY-MM-DD
document.addEventListener("DOMContentLoaded", () => {
  const hoy = new Date().toISOString().split("T")[0];
  document.getElementById("fecha").value = hoy;
  mostrarRegistros();
});

// Subir archivo al servidor
async function subirArchivo(file, tipo = "documento") { 
  if (!file) return null;
  const formData = new FormData();
  formData.append(tipo, file);

  const res = await fetch("/upload", {
    method: "POST",
    body: formData 
  });

  const data = await res.json();  
  if (res.ok) return data.filename;
  alert(data.error || "Error al subir archivo");
  return null;
}

// Guardar registro
async function guardarRegistro() {
  const numero = document.getElementById("numero").value.trim();
  const area = document.getElementById("area").value.trim();
  const descripcion = document.getElementById("descripcion").value.trim();
  const fecha = document.getElementById("fecha").value;
  const cantidad_anexos = document.getElementById("cantidad_anexos").value.trim();

  const archivoOficio = document.getElementById("documento_oficio").files[0];
  const archivosAnexo = document.getElementById("documento_anexo").files;

  if (numero && area && descripcion && fecha) {
    const nombreOficio = await subirArchivo(archivoOficio, "documento_oficio");

    // Subir múltiples archivos de anexos
    let nombresAnexos = [];
    for (let i = 0; i < archivosAnexo.length; i++) {
      const nombre = await subirArchivo(archivosAnexo[i], "documento_anexo");
      if (nombre) nombresAnexos.push(nombre);
    }
    const nombreAnexoStr = nombresAnexos.join(",");

    await fetch("/api/entrada", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        folio: numero,
        area,
        descripcion,
        fecha,
        documento_oficio: nombreOficio,
        documento_anexo: nombreAnexoStr,
        cantidad_anexos: cantidad_anexos
      })
    });

    limpiarFormulario();
    mostrarRegistros();
  } else {
    alert("Por favor llena todos los campos obligatorios.");
  }
}

// Limpiar formulario
function limpiarFormulario() {
  document.getElementById("numero").value = "";
  document.getElementById("area").value = "";
  document.getElementById("descripcion").value = "";
  document.getElementById("fecha").value = new Date().toISOString().split("T")[0];
  document.getElementById("documento_oficio").value = "";
  document.getElementById("documento_anexo").value = "";
  document.getElementById("cantidad_anexos").value = 0;
}

// Función para obtener el icono según la extensión del archivo
function obtenerIconoArchivo(nombreArchivo) {
  if (!nombreArchivo) return "";
  const extension = nombreArchivo.split('.').pop().toLowerCase();
  const iconos = { pdf: "📕" };
  return iconos[extension] || "📄";
}

// Mostrar registros
async function mostrarRegistros() {
  const res = await fetch("/api/entrada");
  const registros = await res.json();

  const tabla = document.getElementById("tabla-registros");
  tabla.innerHTML = "";

  let inicio = (paginaActualRegistros - 1) * registrosPorPagina;
  let fin = inicio + registrosPorPagina;
  let registrosPagina = registros.slice(inicio, fin);

  registrosPagina.forEach((reg) => {
    const oficio = reg.documento_oficio ? `
      <div class="documento-container">
        <a href="/static/uploads/${reg.documento_oficio}" target="_blank" class="doc-link">
          ${obtenerIconoArchivo(reg.documento_oficio)} ${reg.documento_oficio}
        </a>
        <button onclick="descargarArchivo('${reg.documento_oficio}')" class="btn-descargar">⬇️</button>
      </div>` : "—";

    // Mostrar múltiples anexos
    const anexos = reg.documento_anexo ? reg.documento_anexo.split(",").map(a => `
      <div class="documento-container">
        <a href="/static/uploads/${a}" target="_blank" class="doc-link">
          ${obtenerIconoArchivo(a)} ${a}
        </a>
        <button onclick="descargarArchivo('${a}')" class="btn-descargar">⬇️</button>
      </div>
    `).join("") : "—";

    tabla.innerHTML += `
      <tr id="fila-${reg.IdEntrada}">
        <td>${reg.folio}</td>
        <td>${reg.area}</td>
        <td>${reg.descripcion}</td>
        <td>${new Date(reg.fecha).toLocaleDateString()}</td>
        <td>${oficio}</td>
        <td>${anexos}</td>
        <td>${reg.cantidad_anexos || 0}</td>
        <td class="acciones">
          <button onclick="editarRegistro(${reg.IdEntrada})">Editar</button>
          <button onclick="borrarRegistro(${reg.IdEntrada})">Borrar</button>
        </td>
      </tr>`;
  });

  mostrarPaginacion("registros", registros.length);
}

// Descargar archivo
function descargarArchivo(nombreArchivo) {
  const enlace = document.createElement("a");
  enlace.href = `/static/uploads/${nombreArchivo}`;
  enlace.download = nombreArchivo;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
}

// Editar registro
async function editarRegistro(idEntrada) {
  const res = await fetch("/api/entrada");
  const registros = await res.json();
  const reg = registros.find(r => r.IdEntrada === idEntrada);
  const fila = document.getElementById(`fila-${idEntrada}`);

  fila.innerHTML = `
    <td><input type="text" id="edit-numero-${idEntrada}" value="${reg.folio}"></td>
    <td><input type="text" id="edit-area-${idEntrada}" value="${reg.area}"></td>
    <td><input type="text" id="edit-descripcion-${idEntrada}" value="${reg.descripcion}"></td>
    <td><input type="date" id="edit-fecha-${idEntrada}" value="${new Date(reg.fecha).toISOString().split("T")[0]}"></td>

    <!-- Documento Oficio -->
    <td>
      <input type="file" id="edit-documento-oficio-${idEntrada}" accept="application/pdf">
      ${reg.documento_oficio ? `
        <div class="documento-container">
          <a href="/static/uploads/${reg.documento_oficio}" target="_blank" class="doc-link">
            ${obtenerIconoArchivo(reg.documento_oficio)} ${reg.documento_oficio}
          </a>
          <button onclick="descargarArchivo('${reg.documento_oficio}')">⬇️</button>
        </div>` : "—"}
    </td>

    <!-- Documentos Anexos -->
    <td>
      <input type="file" id="edit-documento-anexo-${idEntrada}" accept="application/pdf" multiple>
      ${reg.documento_anexo ? reg.documento_anexo.split(",").map(a => `
        <div class="documento-container">
          <a href="/static/uploads/${a}" target="_blank" class="doc-link">
            ${obtenerIconoArchivo(a)} ${a}
          </a>
          <button onclick="descargarArchivo('${a}')">⬇️</button>
        </div>
      `).join("") : "—"}
    </td>

    <!-- Cantidad de Anexos -->
    <td><input type="number" id="edit-cantidad-anexo-${idEntrada}" value="${reg.cantidad_anexos || 0}" min="0"></td>

    <td>
      <button onclick="guardarEdicion(${idEntrada}, '${reg.documento_oficio || ""}', '${reg.documento_anexo || ""}')">Guardar</button>
      <button onclick="mostrarRegistros()">Cancelar</button>
    </td>
  `;
}

// Guardar edición
async function guardarEdicion(idEntrada, documentoActualOficio, documentoActualAnexo) {
  const folio = document.getElementById(`edit-numero-${idEntrada}`).value.trim();
  const area = document.getElementById(`edit-area-${idEntrada}`).value.trim();
  const descripcion = document.getElementById(`edit-descripcion-${idEntrada}`).value.trim();
  const fecha = document.getElementById(`edit-fecha-${idEntrada}`).value;
  const cantidad_anexos = document.getElementById(`edit-cantidad-anexo-${idEntrada}`).value.trim();

  const archivoOficio = document.getElementById(`edit-documento-oficio-${idEntrada}`);
  const archivosAnexo = document.getElementById(`edit-documento-anexo-${idEntrada}`).files;

  let nombreOficio = documentoActualOficio;

  if (archivoOficio.files.length > 0) {
    nombreOficio = await subirArchivo(archivoOficio.files[0], "documento_oficio");
  }

  // Subir múltiples archivos de anexos
  let nombresAnexos = documentoActualAnexo ? documentoActualAnexo.split(",") : [];
  for (let i = 0; i < archivosAnexo.length; i++) {
    const nombre = await subirArchivo(archivosAnexo[i], "documento_anexo");
    if (nombre) nombresAnexos.push(nombre);
  }
  const nombreAnexoStr = nombresAnexos.join(",");

  await fetch(`/api/entrada/${idEntrada}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      folio,
      area,
      descripcion,
      fecha,
      documento_oficio: nombreOficio,
      documento_anexo: nombreAnexoStr,
      cantidad_anexos: cantidad_anexos
    })
  });

  mostrarRegistros();
}

// Borrar registro
async function borrarRegistro(idEntrada) {
  await fetch(`/api/entrada/${idEntrada}`, { method: "DELETE" });
  mostrarRegistros();
}

// Paginación
function mostrarPaginacion(tipo, total) {
  let paginas = Math.ceil(total / registrosPorPagina);
  let contenedor = document.getElementById("paginacion-registros");
  contenedor.innerHTML = "";
  for (let i = 1; i <= paginas; i++) {
    contenedor.innerHTML += `<button class="${i === paginaActualRegistros ? "active" : ""}" onclick="cambiarPagina(${i})">${i}</button>`;
  }
}

function cambiarPagina(pagina) {
  paginaActualRegistros = pagina;
  mostrarRegistros();
}
