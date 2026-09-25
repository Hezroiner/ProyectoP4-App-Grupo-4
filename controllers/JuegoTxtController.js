const JuegoTxtService = require("../services/JuegoTxtService");

const service = new JuegoTxtService();

// ==========================================
// CRUD JUEGOS (videojuegos.txt)
// ==========================================

const obtenerJuegosTxt = (req, res) => {
    try {
        res.json(service.obtenerTodos());
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al obtener los videojuegos" });
    }
};

const crearJuegoTxt = (req, res) => {
    try {
        const resultado = service.crear(req.body);

        if (resultado.error) {
            return res.status(resultado.estado).json({ mensaje: resultado.error });
        }

        res.status(201).json(resultado.juego);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al crear el videojuego" });
    }
};

const actualizarJuegoTxt = (req, res) => {
    try {
        const resultado = service.actualizar(Number(req.params.id), req.body);

        if (resultado.error) {
            return res.status(resultado.estado).json({ mensaje: resultado.error });
        }

        res.json(resultado.juego);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al actualizar el videojuego" });
    }
};

const eliminarJuegoTxt = (req, res) => {
    try {
        const resultado = service.eliminar(Number(req.params.id));

        if (resultado.error) {
            return res.status(resultado.estado).json({ mensaje: resultado.error });
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
