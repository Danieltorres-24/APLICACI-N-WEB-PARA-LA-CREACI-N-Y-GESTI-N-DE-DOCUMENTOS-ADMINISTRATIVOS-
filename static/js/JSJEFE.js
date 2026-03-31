let registrosPorPaginaJefe = 5;
let paginaActualRegistrosJefe = 1;

// Mostrar registros en la tabla de jefe
async function mostrarRegistrosJefe() {
  const res = await fetch("/api/entrada");
  const registros = await res.json();

  const tabla = document.getElementById("tabla-registros-recepcion");
  tabla.innerHTML = "";

  let inicio = (paginaActualRegistrosJefe - 1) * registrosPorPaginaJefe;
  let fin = inicio + registrosPorPaginaJefe;
  let registrosPagina = registros.slice(inicio, fin);

  registrosPagina.forEach((reg) => {
    const oficio = reg.documento_oficio ? `
      <div class="documento-container">
        <a href="/static/uploads/${reg.documento_oficio}" target="_blank">
          📕 ${reg.documento_oficio}
        </a>
        <button onclick="descargarArchivo('${reg.documento_oficio}')" class="btn-descargar">⬇️</button>
      </div>` : "—";

    const anexos = reg.documento_anexo ? reg.documento_anexo.split(",").map(a => `
      <div class="documento-container">
        <a href="/static/uploads/${a}" target="_blank">
          📕 ${a}
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
        <td>
          <button onclick="descargarArchivo('${reg.documento_oficio}')">Descargar Oficio</button>
        </td>
      </tr>`;
  });

  mostrarPaginacionJefe(registros.length);
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

// Paginación
function mostrarPaginacionJefe(total) {
  let paginas = Math.ceil(total / registrosPorPaginaJefe);
  let contenedor = document.getElementById("paginacion-registros-recepcion");
  contenedor.innerHTML = "";
  for (let i = 1; i <= paginas; i++) {
    contenedor.innerHTML += `<button class="${i === paginaActualRegistrosJefe ? "active" : ""}" onclick="cambiarPaginaJefe(${i})">${i}</button>`;
  }
}

function cambiarPaginaJefe(pagina) {
  paginaActualRegistrosJefe = pagina;
  mostrarRegistrosJefe();
}

// Inicializar
document.addEventListener("DOMContentLoaded", () => {
  mostrarRegistrosJefe();
});



// Mostrar documentos creados por el jefe (GET) con paginación del backend
async function mostrarDocumentosArea(pagina = 1) {
  const res = await fetch(`/api/folios?page=${pagina}&per_page=${registrosPorPagina}`);
  const data = await res.json();

  const tabla = document.getElementById("tabla-jefe");
  const tbody = tabla.querySelector("tbody");
  tbody.innerHTML = "";

  // Recorrer los folios devueltos por el backend
  data.folios.forEach(doc => {
    tbody.innerHTML += `
      <tr>
        <td>${doc.numero}</td>
        <td>${doc.dirigido}</td>
        <td>${doc.asunto}</td>
        <td>${doc.tipo}</td>
      </tr>
    `;
  });

  // Paginación dinámica
  const pagContainer = document.getElementById("paginacion-jefe");
  pagContainer.innerHTML = "";

  for (let i = 1; i <= data.totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    if (i === pagina) btn.classList.add("active");
    btn.addEventListener("click", () => {
      paginaActualDocumentos = i;
      mostrarDocumentosArea(i);
    });
    pagContainer.appendChild(btn);
  }
}

// Función de paginación genérica para tablas frontend
function paginarTabla(tablaId, paginacionId, filasPorPagina = 5) {
  const tabla = document.getElementById(tablaId);
  const paginacion = document.getElementById(paginacionId);
  const filas = Array.from(tabla.querySelectorAll("tbody tr"));
  const totalPaginas = Math.ceil(filas.length / filasPorPagina);
  let paginaActual = 1;

  function mostrarPagina(pagina) {
    paginaActual = pagina;
    const inicio = (pagina - 1) * filasPorPagina;
    const fin = inicio + filasPorPagina;

    filas.forEach((fila, idx) => {
      fila.style.display = idx >= inicio && idx < fin ? "" : "none";
    });

    actualizarPaginacion();
  }

  function actualizarPaginacion() {
    paginacion.innerHTML = "";

    const btnPrev = document.createElement("button");
    btnPrev.textContent = "« Anterior";
    btnPrev.disabled = paginaActual === 1;
    btnPrev.addEventListener("click", () => mostrarPagina(paginaActual - 1));
    paginacion.appendChild(btnPrev);

    for (let i = 1; i <= totalPaginas; i++) {
      const btn = document.createElement("button");
      btn.textContent = i;
      if (i === paginaActual) btn.classList.add("active");
      btn.addEventListener("click", () => mostrarPagina(i));
      paginacion.appendChild(btn);
    }

    const btnNext = document.createElement("button");
    btnNext.textContent = "Siguiente »";
    btnNext.disabled = paginaActual === totalPaginas;
    btnNext.addEventListener("click", () => mostrarPagina(paginaActual + 1));
    paginacion.appendChild(btnNext);
  }

  mostrarPagina(1);
}

// Inicializar tablas al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  mostrarRegistrosArea();
  mostrarDocumentosArea(paginaActualDocumentos);
});
