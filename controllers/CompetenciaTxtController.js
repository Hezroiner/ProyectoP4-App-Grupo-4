const CompetenciaTxtService = require("../services/CompetenciaTxtService");

const service = new CompetenciaTxtService();

// ==========================================
// CRUD COMPETENCIAS (competencias.txt)
// ==========================================

const obtenerCompetenciasTxt = (req, res) => {
    try {
        res.json(service.obtenerTodos());
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al obtener las competencias" });
    }
};

const crearCompetenciaTxt = (req, res) => {
    try {
        const resultado = service.crear(req.body);

        if (resultado.error) {
            return res.status(resultado.estado).json({ mensaje: resultado.error });
        }

        res.status(201).json(resultado.competencia);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al crear la competencia" });
    }
};

const actualizarCompetenciaTxt = (req, res) => {
    try {
        const resultado = service.actualizar(Number(req.params.id), req.body);

        if (resultado.error) {
            return res.status(resultado.estado).json({ mensaje: resultado.error });
        }

        res.json(resultado.competencia);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al actualizar la competencia" });
    }
};

const eliminarCompetenciaTxt = (req, res) => {
    try {
        const resultado = service.eliminar(Number(req.params.id));

        if (resultado.error) {
            return res.status(resultado.estado).json({ mensaje: resultado.error });
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
