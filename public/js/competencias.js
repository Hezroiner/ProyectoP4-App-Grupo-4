const formCompetencia = document.getElementById("formCompetencia");
const formEncuentro = document.getElementById("formEncuentro");
const tablaCompetencias = document.getElementById("tablaCompetencias");
const tablaEncuentros = document.getElementById("tablaEncuentros");
const btnCancelarCompetencia = document.getElementById("btnCancelarCompetencia");
const btnCancelarEncuentro = document.getElementById("btnCancelarEncuentro");

let videojuegosActuales = [];
let equiposActuales = [];
let competenciasActuales = [];
let encuentrosActuales = [];

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

function fechaCorta(fecha) {
    return fecha ? String(fecha).substring(0, 10) : "";
}

function horaCorta(hora) {
    return hora ? String(hora).substring(0, 5) : "";
}

async function cargarDatosRelacionados() {
    try {
        const respuestaVideojuegos = await fetch("/api/juegos/videojuegos");
        videojuegosActuales = await respuestaVideojuegos.json();

        const respuestaEquipos = await fetch("/api/juegos/equipos");
        equiposActuales = await respuestaEquipos.json();

        cargarSelectVideojuegos();
        cargarSelectEquipos();
    } catch (error) {
        console.error("Error al cargar datos relacionados:", error);
    }
}

function cargarSelectVideojuegos() {
    const select = document.getElementById("videojuegoCompetencia");
    const valorActual = select.value;
    select.innerHTML = '<option value="">Seleccione</option>';

    videojuegosActuales.forEach(item => {
        select.innerHTML += `<option value="${item.id}">${item.titulo}</option>`;
    });

    select.value = valorActual;
}

function cargarSelectEquipos() {
    const select1 = document.getElementById("equipo1Encuentro");
    const select2 = document.getElementById("equipo2Encuentro");
    const valor1 = select1.value;
    const valor2 = select2.value;

    select1.innerHTML = '<option value="">Seleccione</option>';
    select2.innerHTML = '<option value="">Seleccione</option>';

    equiposActuales.forEach(item => {
        const opcion = `<option value="${item.id}">${item.nombre_equipo}</option>`;
        select1.innerHTML += opcion;
        select2.innerHTML += opcion;
    });

    select1.value = valor1;
    select2.value = valor2;
}

// ==========================================
// COMPETENCIAS - CONSULTAR
// ==========================================
async function cargarCompetencias() {
    try {
        const respuesta = await fetch("/api/competencias/competencias");
        competenciasActuales = await respuesta.json();
        tablaCompetencias.innerHTML = "";

        competenciasActuales.forEach(item => {
            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${item.id}</td>
                <td>${item.videojuego}</td>
                <td>${item.nombre_competencia}</td>
                <td>${fechaCorta(item.fecha_inicio)}</td>
                <td>${fechaCorta(item.fecha_final)}</td>
                <td>${item.sede_competencia}</td>
                <td>${item.premio_total}</td>
                <td>${item.formato_torneo}</td>
                <td>${item.estado_competencia}</td>
                <td>${mostrarImagen(item.banner_competencia)}</td>
                <td>
                    <button class="btn-editar" onclick="editarCompetencia(${item.id})">Editar</button>
                    <button class="btn-eliminar" onclick="eliminarCompetencia(${item.id})">Eliminar</button>
                </td>
            `;
            tablaCompetencias.appendChild(fila);
        });

        cargarSelectCompetencias();
    } catch (error) {
        console.error("Error al cargar competencias:", error);
    }
}

function cargarSelectCompetencias() {
    const select = document.getElementById("competenciaEncuentro");
    const valorActual = select.value;
    select.innerHTML = '<option value="">Seleccione</option>';

    competenciasActuales.forEach(item => {
        select.innerHTML += `<option value="${item.id}">${item.nombre_competencia}</option>`;
    });

    select.value = valorActual;
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
            respuesta = await fetch("/api/competencias/competencias", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos)
            });
        } else {
            respuesta = await fetch(`/api/competencias/competencias/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos)
            });
        }

        if (!respuesta.ok) {
            throw new Error("Error en la operacion");
        }

        limpiarCompetencia();
        await cargarCompetencias();
        await cargarEncuentros();
    } catch (error) {
        console.error(error);
        alert("No fue posible realizar la operacion de la competencia");
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
    document.getElementById("fechaInicio").value = fechaCorta(item.fecha_inicio);
    document.getElementById("fechaFinal").value = fechaCorta(item.fecha_final);
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
        const respuesta = await fetch(`/api/competencias/competencias/${id}`, {
            method: "DELETE"
        });

        if (!respuesta.ok) {
            throw new Error("Error al eliminar");
        }

        await cargarCompetencias();
        await cargarEncuentros();
    } catch (error) {
        console.error(error);
        alert("No fue posible eliminar la competencia. Verifique sus encuentros relacionados.");
    }
}

function limpiarCompetencia() {
    document.getElementById("competenciaId").value = "";
    formCompetencia.reset();
}

btnCancelarCompetencia.addEventListener("click", limpiarCompetencia);

// ==========================================
// ENCUENTROS - CONSULTAR
// ==========================================
async function cargarEncuentros() {
    try {
        const respuesta = await fetch("/api/competencias/encuentros");
        encuentrosActuales = await respuesta.json();
        tablaEncuentros.innerHTML = "";

        encuentrosActuales.forEach(item => {
            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${item.id}</td>
                <td>${item.competencia}</td>
                <td>${item.equipo_1}</td>
                <td>${item.equipo_2}</td>
                <td>${item.ronda_encuentro}</td>
                <td>${fechaCorta(item.fecha_encuentro)}</td>
                <td>${horaCorta(item.hora_encuentro)}</td>
                <td>${item.puntaje_equipo_1}</td>
                <td>${item.puntaje_equipo_2}</td>
                <td>${item.formato_serie}</td>
                <td>${item.estado_encuentro}</td>
                <td>${mostrarImagen(item.imagen_encuentro)}</td>
                <td>
                    <button class="btn-editar" onclick="editarEncuentro(${item.id})">Editar</button>
                    <button class="btn-eliminar" onclick="eliminarEncuentro(${item.id})">Eliminar</button>
                </td>
            `;
            tablaEncuentros.appendChild(fila);
        });
    } catch (error) {
        console.error("Error al cargar encuentros:", error);
    }
}

// ==========================================
// ENCUENTROS - CREAR O ACTUALIZAR
// ==========================================
formEncuentro.addEventListener("submit", async function(event) {
    event.preventDefault();

    const id = document.getElementById("encuentroId").value;
    const imagen = await leerImagen(document.getElementById("imagenEncuentro"));

    const equipo1 = document.getElementById("equipo1Encuentro").value;
    const equipo2 = document.getElementById("equipo2Encuentro").value;

    if (equipo1 === equipo2) {
        alert("Seleccione dos equipos diferentes");
        return;
    }

    const datos = {
        competencia_id: document.getElementById("competenciaEncuentro").value,
        equipo_1_id: equipo1,
        equipo_2_id: equipo2,
        ronda_encuentro: document.getElementById("rondaEncuentro").value,
        fecha_encuentro: document.getElementById("fechaEncuentro").value,
        hora_encuentro: document.getElementById("horaEncuentro").value,
        puntaje_equipo_1: document.getElementById("puntajeEquipo1").value,
        puntaje_equipo_2: document.getElementById("puntajeEquipo2").value,
        formato_serie: document.getElementById("formatoSerie").value,
        estado_encuentro: document.getElementById("estadoEncuentro").value,
        imagen_encuentro: imagen
    };

    try {
        let respuesta;

        if (id === "") {
            respuesta = await fetch("/api/competencias/encuentros", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos)
            });
        } else {
            respuesta = await fetch(`/api/competencias/encuentros/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos)
            });
        }

        if (!respuesta.ok) {
            throw new Error("Error en la operacion");
        }

        limpiarEncuentro();
        await cargarEncuentros();
    } catch (error) {
        console.error(error);
        alert("No fue posible realizar la operacion del encuentro");
    }
});

function editarEncuentro(id) {
    const item = encuentrosActuales.find(e => e.id === id);

    if (!item) {
        return;
    }

    document.getElementById("encuentroId").value = item.id;
    document.getElementById("competenciaEncuentro").value = item.competencia_id;
    document.getElementById("equipo1Encuentro").value = item.equipo_1_id;
    document.getElementById("equipo2Encuentro").value = item.equipo_2_id;
    document.getElementById("rondaEncuentro").value = item.ronda_encuentro;
    document.getElementById("fechaEncuentro").value = fechaCorta(item.fecha_encuentro);
    document.getElementById("horaEncuentro").value = horaCorta(item.hora_encuentro);
    document.getElementById("puntajeEquipo1").value = item.puntaje_equipo_1;
    document.getElementById("puntajeEquipo2").value = item.puntaje_equipo_2;
    document.getElementById("formatoSerie").value = item.formato_serie;
    document.getElementById("estadoEncuentro").value = item.estado_encuentro;
    document.getElementById("rondaEncuentro").focus();
}

async function eliminarEncuentro(id) {
    if (!confirm("¿Desea eliminar este encuentro?")) {
        return;
    }

    try {
        const respuesta = await fetch(`/api/competencias/encuentros/${id}`, {
            method: "DELETE"
        });

        if (!respuesta.ok) {
            throw new Error("Error al eliminar");
        }

        await cargarEncuentros();
    } catch (error) {
        console.error(error);
        alert("No fue posible eliminar el encuentro");
    }
}

function limpiarEncuentro() {
    document.getElementById("encuentroId").value = "";
    formEncuentro.reset();
}

btnCancelarEncuentro.addEventListener("click", limpiarEncuentro);

cargarDatosRelacionados()
    .then(cargarCompetencias)
    .then(cargarEncuentros);
