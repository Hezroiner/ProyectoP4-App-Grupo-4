const formCompetencia = document.getElementById("formCompetencia");
const tablaCompetencias = document.getElementById("tablaCompetencias");
const btnCancelarCompetencia = document.getElementById("btnCancelarCompetencia");

let videojuegosActuales = [];
let competenciasActuales = [];

function leerImagen(input) {
    return new Promise((resolve, reject) => {
        const archivo = input.files[0];

        if (!archivo) {
            resolve("");
            return;
        }

        const lector = new FileReader();
        lector.onload = () => resolve(lector.result);
        lector.onerror = () => reject(new Error("No fue posible leer la imagen"));
        lector.readAsDataURL(archivo);
    });
}

function mostrarImagen(imagen) {
    if (!imagen) {
        return "Sin imagen";
    }

    return `<img class="imagen-tabla" src="${imagen}" alt="Imagen registrada">`;
}

// Los datos vienen de un archivo txt editable, por eso se escapan antes de
// insertarlos como HTML.
function escapar(texto) {
    return String(texto ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

async function cargarDatosRelacionados() {
    try {
        const respuesta = await fetch("/api/juegos/txt");
        videojuegosActuales = await respuesta.json();

        cargarSelectVideojuegos();
    } catch (error) {
        console.error("Error al cargar datos relacionados:", error);
    }
}

function cargarSelectVideojuegos() {
    const select = document.getElementById("videojuegoCompetencia");
    const valorActual = select.value;
    select.innerHTML = '<option value="">Seleccione</option>';

    videojuegosActuales.forEach(item => {
        select.innerHTML += `<option value="${item.id}">${escapar(item.titulo)}</option>`;
    });

    select.value = valorActual;
}

// ==========================================
// COMPETENCIAS - CONSULTAR
// ==========================================
async function cargarCompetencias() {
    try {
        const respuesta = await fetch("/api/competencias/txt");
        competenciasActuales = await respuesta.json();
        tablaCompetencias.innerHTML = "";

        competenciasActuales.forEach(item => {
            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${item.id}</td>
                <td>${escapar(item.videojuego)}</td>
                <td>${escapar(item.nombre_competencia)}</td>
                <td>${escapar(item.fecha_inicio)}</td>
                <td>${escapar(item.fecha_final)}</td>
                <td>${escapar(item.sede_competencia)}</td>
                <td>${escapar(item.premio_total)}</td>
                <td>${escapar(item.formato_torneo)}</td>
                <td>${escapar(item.estado_competencia)}</td>
                <td>${mostrarImagen(item.banner_competencia)}</td>
                <td>
                    <button class="btn-editar" onclick="editarCompetencia(${item.id})">Editar</button>
                    <button class="btn-eliminar" onclick="eliminarCompetencia(${item.id})">Eliminar</button>
                </td>
            `;
            tablaCompetencias.appendChild(fila);
        });
    } catch (error) {
        console.error("Error al cargar competencias:", error);
    }
}

// ==========================================
// COMPETENCIAS - CREAR O ACTUALIZAR
// ==========================================
formCompetencia.addEventListener("submit", async function(event) {
    event.preventDefault();

    const id = document.getElementById("competenciaId").value;
    const banner = await leerImagen(document.getElementById("bannerCompetencia"));

    const datos = {
        videojuego_id: document.getElementById("videojuegoCompetencia").value,
        nombre_competencia: document.getElementById("nombreCompetencia").value,
        fecha_inicio: document.getElementById("fechaInicio").value,
        fecha_final: document.getElementById("fechaFinal").value,
        sede_competencia: document.getElementById("sedeCompetencia").value,
        premio_total: document.getElementById("premioTotal").value,
        formato_torneo: document.getElementById("formatoTorneo").value,
        estado_competencia: document.getElementById("estadoCompetencia").value,
        banner_competencia: banner
    };

    try {
        let respuesta;

        if (id === "") {
            respuesta = await fetch("/api/competencias/txt", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos)
            });
        } else {
            respuesta = await fetch(`/api/competencias/txt/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos)
            });
        }

        if (!respuesta.ok) {
            const error = await respuesta.json().catch(() => ({}));
            throw new Error(error.mensaje || "Error en la operacion");
        }

        limpiarCompetencia();
        await cargarCompetencias();
    } catch (error) {
        console.error(error);
        alert(`No fue posible realizar la operacion de la competencia: ${error.message}`);
    }
});

function editarCompetencia(id) {
    const item = competenciasActuales.find(c => c.id === id);

    if (!item) {
        return;
    }

    document.getElementById("competenciaId").value = item.id;
    document.getElementById("videojuegoCompetencia").value = item.videojuego_id;
    document.getElementById("nombreCompetencia").value = item.nombre_competencia;
    document.getElementById("fechaInicio").value = item.fecha_inicio;
    document.getElementById("fechaFinal").value = item.fecha_final;
    document.getElementById("sedeCompetencia").value = item.sede_competencia;
    document.getElementById("premioTotal").value = item.premio_total;
    document.getElementById("formatoTorneo").value = item.formato_torneo;
    document.getElementById("estadoCompetencia").value = item.estado_competencia;
    document.getElementById("nombreCompetencia").focus();
}

async function eliminarCompetencia(id) {
    if (!confirm("¿Desea eliminar esta competencia?")) {
        return;
    }

    try {
        const respuesta = await fetch(`/api/competencias/txt/${id}`, {
            method: "DELETE"
        });

        if (!respuesta.ok) {
            const error = await respuesta.json().catch(() => ({}));
            throw new Error(error.mensaje || "Error al eliminar");
        }

        await cargarCompetencias();
    } catch (error) {
        console.error(error);
        alert(`No fue posible eliminar la competencia: ${error.message}`);
    }
}

function limpiarCompetencia() {
    document.getElementById("competenciaId").value = "";
    formCompetencia.reset();
}

btnCancelarCompetencia.addEventListener("click", limpiarCompetencia);

cargarDatosRelacionados().then(cargarCompetencias);
