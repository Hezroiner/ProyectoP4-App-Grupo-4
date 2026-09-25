const formVideojuego = document.getElementById("formVideojuego");
const tablaVideojuegos = document.getElementById("tablaVideojuegos");
const btnCancelarVideojuego = document.getElementById("btnCancelarVideojuego");

let videojuegosActuales = [];

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

// ==========================================
// VIDEOJUEGOS - CONSULTAR
// ==========================================
async function cargarVideojuegos() {
    try {
        const respuesta = await fetch("/api/juegos/txt");
        videojuegosActuales = await respuesta.json();
        tablaVideojuegos.innerHTML = "";

        videojuegosActuales.forEach(item => {
            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${item.id}</td>
                <td>${escapar(item.titulo)}</td>
                <td>${escapar(item.categoria)}</td>
                <td>${escapar(item.desarrolladora)}</td>
                <td>${escapar(item.fecha_lanzamiento)}</td>
                <td>${escapar(item.clasificacion_edad)}</td>
                <td>${escapar(item.modalidad_juego)}</td>
                <td>${escapar(item.estado_videojuego)}</td>
                <td>${mostrarImagen(item.portada_videojuego)}</td>
                <td>
                    <button class="btn-editar" onclick="editarVideojuego(${item.id})">Editar</button>
                    <button class="btn-eliminar" onclick="eliminarVideojuego(${item.id})">Eliminar</button>
                </td>
            `;
            tablaVideojuegos.appendChild(fila);
        });
    } catch (error) {
        console.error("Error al cargar videojuegos:", error);
    }
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
            respuesta = await fetch("/api/juegos/txt", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos)
            });
        } else {
            respuesta = await fetch(`/api/juegos/txt/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos)
            });
        }

        if (!respuesta.ok) {
            const error = await respuesta.json().catch(() => ({}));
            throw new Error(error.mensaje || "Error en la operacion");
        }

        limpiarVideojuego();
        await cargarVideojuegos();
    } catch (error) {
        console.error(error);
        alert(`No fue posible realizar la operacion del videojuego: ${error.message}`);
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
    document.getElementById("fechaLanzamiento").value = item.fecha_lanzamiento;
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
        const respuesta = await fetch(`/api/juegos/txt/${id}`, {
            method: "DELETE"
        });

        if (!respuesta.ok) {
            const error = await respuesta.json().catch(() => ({}));
            throw new Error(error.mensaje || "Error al eliminar");
        }

        await cargarVideojuegos();
    } catch (error) {
        console.error(error);
        alert(`No fue posible eliminar el videojuego: ${error.message}`);
    }
}

function limpiarVideojuego() {
    document.getElementById("videojuegoId").value = "";
    formVideojuego.reset();
}

btnCancelarVideojuego.addEventListener("click", limpiarVideojuego);

cargarVideojuegos();
