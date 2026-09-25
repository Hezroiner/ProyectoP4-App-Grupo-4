const CompetenciaTxtDAO = require("../dao/CompetenciaTxtDAO");
const JuegoTxtDAO = require("../dao/JuegoTxtDAO");

const CAMPOS = [
    "videojuego_id",
    "nombre_competencia",
    "fecha_inicio",
    "fecha_final",
    "sede_competencia",
    "premio_total",
    "formato_torneo",
    "estado_competencia"
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

function serializar(competencia, titulosVideojuegos) {
    return {
        ...competencia,
        videojuego: titulosVideojuegos.get(competencia.videojuego_id) ?? "",
        banner_competencia: serializarImagen(competencia.banner_competencia)
    };
}

function obtenerTitulosVideojuegos() {
    return new Map(
        JuegoTxtDAO.obtenerTodos().map(juego => [juego.id, juego.titulo])
    );
}

// Devuelve el mensaje de error o null si los datos son validos.
function validar(datos, imagen) {
    const faltantes = CAMPOS.filter(campo => datos[campo] === "");

    if (faltantes.length > 0) {
        return `Campos obligatorios: ${faltantes.join(", ")}`;
    }

    // Equivale a la llave foranea de PostgreSQL hacia videojuegos.
    if (!JuegoTxtDAO.obtenerPorId(Number(datos.videojuego_id))) {
        return "El videojuego seleccionado no existe";
    }

    if (!esFecha(datos.fecha_inicio) || !esFecha(datos.fecha_final)) {
        return "Las fechas no son validas";
    }

    const premio = Number(datos.premio_total);

    if (!Number.isFinite(premio) || premio < 0) {
        return "El premio total debe ser un numero mayor o igual a cero";
    }

    if (imagen === null) {
        return "El banner no es una imagen valida";
    }

    return null;
}

// Deja los datos listos para guardar: id numerico y premio con 2 decimales
// (como NUMERIC(12,2) en PostgreSQL).
function normalizar(datos) {
    return {
        ...datos,
        videojuego_id: Number(datos.videojuego_id),
        premio_total: Number(datos.premio_total).toFixed(2)
    };
}

// ==========================================
// Reglas del CRUD de competencias (competencias.txt)
//
// crear, actualizar y eliminar devuelven { error, estado } si algo falla
// (estado es el codigo HTTP que corresponde) o el resultado si todo sale bien.
// ==========================================

class CompetenciaTxtService {
    obtenerTodos() {
        // Equivale a la carga EAGER de PostgreSQL: cada competencia se
        // devuelve junto con el titulo de su videojuego.
        const titulos = obtenerTitulosVideojuegos();

        return CompetenciaTxtDAO.obtenerTodos().map(item => serializar(item, titulos));
    }

    crear(body) {
        const datos = leerCampos(body, CAMPOS);
        const imagen = extraerBase64(body?.banner_competencia);
        const errorValidacion = validar(datos, imagen);

        if (errorValidacion) {
            return { error: errorValidacion, estado: 400 };
        }

        const competencia = CompetenciaTxtDAO.crear({
            ...normalizar(datos),
            banner_competencia: imagen
        });

        return { competencia: serializar(competencia, obtenerTitulosVideojuegos()) };
    }

    actualizar(id, body) {
        const datos = leerCampos(body, CAMPOS);
        const imagen = extraerBase64(body?.banner_competencia);
        const errorValidacion = validar(datos, imagen);

        if (errorValidacion) {
            return { error: errorValidacion, estado: 400 };
        }

        const cambios = normalizar(datos);

        // Igual que COALESCE en PostgreSQL: sin imagen nueva se conserva la anterior.
        if (imagen) {
            cambios.banner_competencia = imagen;
        }

        const competencia = CompetenciaTxtDAO.actualizar(id, cambios);

        if (!competencia) {
            return { error: "Competencia no encontrada", estado: 404 };
        }

        return { competencia: serializar(competencia, obtenerTitulosVideojuegos()) };
    }

    eliminar(id) {
        if (!CompetenciaTxtDAO.eliminar(id)) {
            return { error: "Competencia no encontrada", estado: 404 };
        }

        return {};
    }
}

module.exports = CompetenciaTxtService;
