const formVideojuego = document.getElementById("formVideojuego");
const formEquipo = document.getElementById("formEquipo");
const tablaVideojuegos = document.getElementById("tablaVideojuegos");
const tablaEquipos = document.getElementById("tablaEquipos");
const btnCancelarVideojuego = document.getElementById("btnCancelarVideojuego");
const btnCancelarEquipo = document.getElementById("btnCancelarEquipo");

let videojuegosActuales = [];
let equiposActuales = [];

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

// ==========================================
// VIDEOJUEGOS - CONSULTAR
// ==========================================
async function cargarVideojuegos() {
    try {
        const respuesta = await fetch("/api/juegos/videojuegos");
        videojuegosActuales = await respuesta.json();
        tablaVideojuegos.innerHTML = "";

        videojuegosActuales.forEach(item => {
            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${item.id}</td>
                <td>${item.titulo}</td>
                <td>${item.categoria}</td>
                <td>${item.desarrolladora}</td>
                <td>${fechaCorta(item.fecha_lanzamiento)}</td>
                <td>${item.clasificacion_edad}</td>
                <td>${item.modalidad_juego}</td>
                <td>${item.estado_videojuego}</td>
                <td>${mostrarImagen(item.portada_videojuego)}</td>
                <td>
                    <button class="btn-editar" onclick="editarVideojuego(${item.id})">Editar</button>
                    <button class="btn-eliminar" onclick="eliminarVideojuego(${item.id})">Eliminar</button>
                </td>
            `;
            tablaVideojuegos.appendChild(fila);
        });

        cargarSelectVideojuegos();
    } catch (error) {
        console.error("Error al cargar videojuegos:", error);
    }
}

function cargarSelectVideojuegos() {
    const select = document.getElementById("videojuegoEquipo");
    const valorActual = select.value;
    select.innerHTML = '<option value="">Seleccione</option>';

    videojuegosActuales.forEach(item => {
        select.innerHTML += `<option value="${item.id}">${item.titulo}</option>`;
    });

    select.value = valorActual;
}

// ==========================================
// VIDEOJUEGOS - CREAR O ACTUALIZAR
// ==========================================
formVideojuego.addEventListener("submit", async function(event) {
    event.preventDefault();

    const id = document.getElementById("videojuegoId").value;
    const portada = await leerImagen(document.getElementById("portadaVideojuego"));

    const datos = {
        titulo: document.getElementById("titulo").value,
        categoria: document.getElementById("categoria").value,
        desarrolladora: document.getElementById("desarrolladora").value,
        fecha_lanzamiento: document.getElementById("fechaLanzamiento").value,
        clasificacion_edad: document.getElementById("clasificacionEdad").value,
        modalidad_juego: document.getElementById("modalidadJuego").value,
        estado_videojuego: document.getElementById("estadoVideojuego").value,
        portada_videojuego: portada
    };

    try {
        let respuesta;

        if (id === "") {
            respuesta = await fetch("/api/juegos/videojuegos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos)
            });
        } else {
            respuesta = await fetch(`/api/juegos/videojuegos/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos)
            });
        }

        if (!respuesta.ok) {
            throw new Error("Error en la operacion");
        }

        limpiarVideojuego();
        await cargarVideojuegos();
        await cargarEquipos();
    } catch (error) {
        console.error(error);
        alert("No fue posible realizar la operacion del videojuego");
    }
});

function editarVideojuego(id) {
    const item = videojuegosActuales.find(v => v.id === id);

    if (!item) {
        return;
    }

    document.getElementById("videojuegoId").value = item.id;
    document.getElementById("titulo").value = item.titulo;
    document.getElementById("categoria").value = item.categoria;
    document.getElementById("desarrolladora").value = item.desarrolladora;
    document.getElementById("fechaLanzamiento").value = fechaCorta(item.fecha_lanzamiento);
    document.getElementById("clasificacionEdad").value = item.clasificacion_edad;
    document.getElementById("modalidadJuego").value = item.modalidad_juego;
    document.getElementById("estadoVideojuego").value = item.estado_videojuego;
    document.getElementById("titulo").focus();
}

async function eliminarVideojuego(id) {
    if (!confirm("¿Desea eliminar este videojuego?")) {
        return;
    }

    try {
        const respuesta = await fetch(`/api/juegos/videojuegos/${id}`, {
            method: "DELETE"
        });

        if (!respuesta.ok) {
            throw new Error("Error al eliminar");
        }

        await cargarVideojuegos();
        await cargarEquipos();
    } catch (error) {
        console.error(error);
        alert("No fue posible eliminar el videojuego. Verifique sus relaciones.");
    }
}

function limpiarVideojuego() {
    document.getElementById("videojuegoId").value = "";
    formVideojuego.reset();
}

btnCancelarVideojuego.addEventListener("click", limpiarVideojuego);

// ==========================================
// EQUIPOS - CONSULTAR
// ==========================================
async function cargarEquipos() {
    try {
        const respuesta = await fetch("/api/juegos/equipos");
        equiposActuales = await respuesta.json();
        tablaEquipos.innerHTML = "";

        equiposActuales.forEach(item => {
            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${item.id}</td>
                <td>${item.videojuego}</td>
                <td>${item.nombre_equipo}</td>
                <td>${item.siglas}</td>
                <td>${item.region_equipo}</td>
                <td>${item.entrenador}</td>
                <td>${fechaCorta(item.fecha_fundacion)}</td>
                <td>${item.ranking_equipo}</td>
                <td>${item.patrocinador_equipo}</td>
                <td>${mostrarImagen(item.logo_equipo)}</td>
                <td>
                    <button class="btn-editar" onclick="editarEquipo(${item.id})">Editar</button>
                    <button class="btn-eliminar" onclick="eliminarEquipo(${item.id})">Eliminar</button>
                </td>
            `;
            tablaEquipos.appendChild(fila);
        });
    } catch (error) {
        console.error("Error al cargar equipos:", error);
    }
}

// ==========================================
// EQUIPOS - CREAR O ACTUALIZAR
// ==========================================
formEquipo.addEventListener("submit", async function(event) {
    event.preventDefault();

    const id = document.getElementById("equipoId").value;
    const logo = await leerImagen(document.getElementById("logoEquipo"));

    const datos = {
        videojuego_id: document.getElementById("videojuegoEquipo").value,
        nombre_equipo: document.getElementById("nombreEquipo").value,
        siglas: document.getElementById("siglasEquipo").value,
        region_equipo: document.getElementById("regionEquipo").value,
        entrenador: document.getElementById("entrenadorEquipo").value,
        fecha_fundacion: document.getElementById("fechaFundacion").value,
        ranking_equipo: document.getElementById("rankingEquipo").value,
        patrocinador_equipo: document.getElementById("patrocinadorEquipo").value,
        logo_equipo: logo
    };

    try {
        let respuesta;

        if (id === "") {
            respuesta = await fetch("/api/juegos/equipos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos)
            });
        } else {
            respuesta = await fetch(`/api/juegos/equipos/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos)
            });
        }

        if (!respuesta.ok) {
            throw new Error("Error en la operacion");
        }

        limpiarEquipo();
        await cargarEquipos();
    } catch (error) {
        console.error(error);
        alert("No fue posible realizar la operacion del equipo");
    }
});

function editarEquipo(id) {
    const item = equiposActuales.find(e => e.id === id);

    if (!item) {
        return;
    }

    document.getElementById("equipoId").value = item.id;
    document.getElementById("videojuegoEquipo").value = item.videojuego_id;
    document.getElementById("nombreEquipo").value = item.nombre_equipo;
    document.getElementById("siglasEquipo").value = item.siglas;
    document.getElementById("regionEquipo").value = item.region_equipo;
    document.getElementById("entrenadorEquipo").value = item.entrenador;
    document.getElementById("fechaFundacion").value = fechaCorta(item.fecha_fundacion);
    document.getElementById("rankingEquipo").value = item.ranking_equipo;
    document.getElementById("patrocinadorEquipo").value = item.patrocinador_equipo;
    document.getElementById("nombreEquipo").focus();
}

async function eliminarEquipo(id) {
    if (!confirm("¿Desea eliminar este equipo?")) {
        return;
    }

    try {
        const respuesta = await fetch(`/api/juegos/equipos/${id}`, {
            method: "DELETE"
        });

        if (!respuesta.ok) {
            throw new Error("Error al eliminar");
        }

        await cargarEquipos();
    } catch (error) {
        console.error(error);
        alert("No fue posible eliminar el equipo. Verifique sus encuentros relacionados.");
    }
}

function limpiarEquipo() {
    document.getElementById("equipoId").value = "";
    formEquipo.reset();
}

btnCancelarEquipo.addEventListener("click", limpiarEquipo);

cargarVideojuegos().then(cargarEquipos);
