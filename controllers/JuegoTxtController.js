const JuegoTxtDAO = require("../dao/JuegoTxtDAO");
const CompetenciaTxtDAO = require("../dao/CompetenciaTxtDAO");

const {
    extraerBase64,
    serializarImagen,
    esFecha,
    leerCampos
} = require("./txtHelpers");

const CAMPOS = [
    "titulo",
    "categoria",
    "desarrolladora",
    "fecha_lanzamiento",
    "clasificacion_edad",
    "modalidad_juego",
    "estado_videojuego"
];

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
// CRUD JUEGOS (videojuegos.txt)
// ==========================================

const obtenerJuegosTxt = (req, res) => {
    try {
        res.json(JuegoTxtDAO.obtenerTodos().map(serializar));
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al obtener los videojuegos" });
    }
};

const crearJuegoTxt = (req, res) => {
    try {
        const datos = leerCampos(req.body, CAMPOS);
        const imagen = extraerBase64(req.body?.portada_videojuego);
        const errorValidacion = validar(datos, imagen);

        if (errorValidacion) {
            return res.status(400).json({ mensaje: errorValidacion });
        }

        const juego = JuegoTxtDAO.crear({ ...datos, portada_videojuego: imagen });
        res.status(201).json(serializar(juego));
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al crear el videojuego" });
    }
};

const actualizarJuegoTxt = (req, res) => {
    try {
        const id = Number(req.params.id);
        const datos = leerCampos(req.body, CAMPOS);
        const imagen = extraerBase64(req.body?.portada_videojuego);
        const errorValidacion = validar(datos, imagen);

        if (errorValidacion) {
            return res.status(400).json({ mensaje: errorValidacion });
        }

        // Igual que COALESCE en PostgreSQL: sin imagen nueva se conserva la anterior.
        if (imagen) {
            datos.portada_videojuego = imagen;
        }

        const juego = JuegoTxtDAO.actualizar(id, datos);

        if (!juego) {
            return res.status(404).json({ mensaje: "Videojuego no encontrado" });
        }

        res.json(serializar(juego));
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al actualizar el videojuego" });
    }
};

const eliminarJuegoTxt = (req, res) => {
    try {
        const id = Number(req.params.id);

        // Equivale a la llave foranea de PostgreSQL: un videojuego con
        // competencias no se puede eliminar.
        const tieneCompetencias = CompetenciaTxtDAO
            .obtenerTodos()
            .some(competencia => competencia.videojuego_id === id);

        if (tieneCompetencias) {
            return res.status(409).json({
                mensaje: "No se puede eliminar: el videojuego tiene competencias relacionadas"
            });
        }

        if (!JuegoTxtDAO.eliminar(id)) {
            return res.status(404).json({ mensaje: "Videojuego no encontrado" });
        }

        res.json({ mensaje: "Videojuego eliminado correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al eliminar el videojuego" });
    }
};

module.exports = {
    obtenerJuegosTxt,
    crearJuegoTxt,
    actualizarJuegoTxt,
    eliminarJuegoTxt
};
