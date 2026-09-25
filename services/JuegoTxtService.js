const JuegoTxtDAO = require("../dao/JuegoTxtDAO");
const CompetenciaTxtDAO = require("../dao/CompetenciaTxtDAO");

const CAMPOS = [
    "titulo",
    "categoria",
    "desarrolladora",
    "fecha_lanzamiento",
    "clasificacion_edad",
    "modalidad_juego",
    "estado_videojuego"
];

// ==========================================
// Datos que llegan del navegador y salen hacia el
// ==========================================

// Copia solo los campos indicados, como texto y sin espacios sobrantes.
function leerCampos(body, campos) {
    const datos = {};

    campos.forEach(campo => {
        datos[campo] = String(body?.[campo] ?? "").trim();
    });

    return datos;
}

// Recibe la imagen como llega del navegador (data URL o Base64 puro) y devuelve
// solo el Base64. Devuelve "" si no se envio imagen y null si no es Base64 valido.
function extraerBase64(imagen) {
    if (typeof imagen !== "string" || imagen === "") {
        return "";
    }

    const base64 = imagen.includes(",") ? imagen.split(",")[1] : imagen;

    return /^[A-Za-z0-9+/]*={0,2}$/.test(base64) ? base64 : null;
}

function serializarImagen(base64) {
    if (!base64) {
        return "";
    }

    return `data:image/png;base64,${base64}`;
}

function esFecha(valor) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
        return false;
    }

    const [anio, mes, dia] = valor.split("-").map(Number);
    const fecha = new Date(Date.UTC(anio, mes - 1, dia));

    return fecha.getUTCFullYear() === anio
        && fecha.getUTCMonth() === mes - 1
        && fecha.getUTCDate() === dia;
}

function serializar(juego) {
    return {
        ...juego,
        portada_videojuego: serializarImagen(juego.portada_videojuego)
    };
}

// Devuelve el mensaje de error o null si los datos son validos.
function validar(datos, imagen) {
    const faltantes = CAMPOS.filter(campo => datos[campo] === "");

    if (faltantes.length > 0) {
        return `Campos obligatorios: ${faltantes.join(", ")}`;
    }

    if (!esFecha(datos.fecha_lanzamiento)) {
        return "La fecha de lanzamiento no es valida";
    }

    if (imagen === null) {
        return "La portada no es una imagen valida";
    }

    return null;
}

// ==========================================
// Reglas del CRUD de juegos (videojuegos.txt)
//
// crear, actualizar y eliminar devuelven { error, estado } si algo falla
// (estado es el codigo HTTP que corresponde) o el resultado si todo sale bien.
// ==========================================

class JuegoTxtService {
    obtenerTodos() {
        return JuegoTxtDAO.obtenerTodos().map(serializar);
    }

    crear(body) {
        const datos = leerCampos(body, CAMPOS);
        const imagen = extraerBase64(body?.portada_videojuego);
        const errorValidacion = validar(datos, imagen);

        if (errorValidacion) {
            return { error: errorValidacion, estado: 400 };
        }

        const juego = JuegoTxtDAO.crear({ ...datos, portada_videojuego: imagen });

        return { juego: serializar(juego) };
    }

    actualizar(id, body) {
        const datos = leerCampos(body, CAMPOS);
        const imagen = extraerBase64(body?.portada_videojuego);
        const errorValidacion = validar(datos, imagen);

        if (errorValidacion) {
            return { error: errorValidacion, estado: 400 };
        }

        // Igual que COALESCE en PostgreSQL: sin imagen nueva se conserva la anterior.
        if (imagen) {
            datos.portada_videojuego = imagen;
        }

        const juego = JuegoTxtDAO.actualizar(id, datos);

        if (!juego) {
            return { error: "Videojuego no encontrado", estado: 404 };
        }

        return { juego: serializar(juego) };
    }

    eliminar(id) {
        // Equivale a la llave foranea de PostgreSQL: un videojuego con
        // competencias no se puede eliminar.
        const tieneCompetencias = CompetenciaTxtDAO
            .obtenerTodos()
            .some(competencia => competencia.videojuego_id === id);

        if (tieneCompetencias) {
            return {
                error: "No se puede eliminar: el videojuego tiene competencias relacionadas",
                estado: 409
            };
        }

        if (!JuegoTxtDAO.eliminar(id)) {
            return { error: "Videojuego no encontrado", estado: 404 };
        }

        return {};
    }
}

module.exports = JuegoTxtService;
