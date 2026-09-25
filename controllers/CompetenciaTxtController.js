const CompetenciaTxtDAO = require("../dao/CompetenciaTxtDAO");
const JuegoTxtDAO = require("../dao/JuegoTxtDAO");

const {
    extraerBase64,
    serializarImagen,
    esFecha,
    leerCampos
} = require("./txtHelpers");

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
// CRUD COMPETENCIAS (competencias.txt)
// ==========================================

const obtenerCompetenciasTxt = (req, res) => {
    try {
        // Equivale a la carga EAGER de PostgreSQL: cada competencia se
        // devuelve junto con el titulo de su videojuego.
        const titulos = obtenerTitulosVideojuegos();

        res.json(
            CompetenciaTxtDAO.obtenerTodos().map(item => serializar(item, titulos))
        );
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al obtener las competencias" });
    }
};

const crearCompetenciaTxt = (req, res) => {
    try {
        const datos = leerCampos(req.body, CAMPOS);
        const imagen = extraerBase64(req.body?.banner_competencia);
        const errorValidacion = validar(datos, imagen);

        if (errorValidacion) {
            return res.status(400).json({ mensaje: errorValidacion });
        }

        const competencia = CompetenciaTxtDAO.crear({
            ...normalizar(datos),
            banner_competencia: imagen
        });

        res.status(201).json(serializar(competencia, obtenerTitulosVideojuegos()));
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al crear la competencia" });
    }
};

const actualizarCompetenciaTxt = (req, res) => {
    try {
        const id = Number(req.params.id);
        const datos = leerCampos(req.body, CAMPOS);
        const imagen = extraerBase64(req.body?.banner_competencia);
        const errorValidacion = validar(datos, imagen);

        if (errorValidacion) {
            return res.status(400).json({ mensaje: errorValidacion });
        }

        const cambios = normalizar(datos);

        // Igual que COALESCE en PostgreSQL: sin imagen nueva se conserva la anterior.
        if (imagen) {
            cambios.banner_competencia = imagen;
        }

        const competencia = CompetenciaTxtDAO.actualizar(id, cambios);

        if (!competencia) {
            return res.status(404).json({ mensaje: "Competencia no encontrada" });
        }

        res.json(serializar(competencia, obtenerTitulosVideojuegos()));
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al actualizar la competencia" });
    }
};

const eliminarCompetenciaTxt = (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!CompetenciaTxtDAO.eliminar(id)) {
            return res.status(404).json({ mensaje: "Competencia no encontrada" });
        }

        res.json({ mensaje: "Competencia eliminada correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al eliminar la competencia" });
    }
};

module.exports = {
    obtenerCompetenciasTxt,
    crearCompetenciaTxt,
    actualizarCompetenciaTxt,
    eliminarCompetenciaTxt
};
