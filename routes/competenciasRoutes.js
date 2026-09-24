const express = require("express");
const router = express.Router();

const {
    obtenerCompetencias,
    crearCompetencia,
    actualizarCompetencia,
    eliminarCompetencia,
    obtenerEncuentros,
    crearEncuentro,
    actualizarEncuentro,
    eliminarEncuentro
} = require("../controllers/competenciasController");

// COMPETENCIAS
router.get("/competencias", obtenerCompetencias);
router.post("/competencias", crearCompetencia);
router.put("/competencias/:id", actualizarCompetencia);
router.delete("/competencias/:id", eliminarCompetencia);

// ENCUENTROS
router.get("/encuentros", obtenerEncuentros);
router.post("/encuentros", crearEncuentro);
router.put("/encuentros/:id", actualizarEncuentro);
router.delete("/encuentros/:id", eliminarEncuentro);

module.exports = router;
