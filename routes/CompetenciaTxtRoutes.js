const express = require("express");
const router = express.Router();

const {
    obtenerCompetenciasTxt,
    crearCompetenciaTxt,
    actualizarCompetenciaTxt,
    eliminarCompetenciaTxt
} = require("../controllers/CompetenciaTxtController");

// COMPETENCIAS - ARCHIVO TXT
router.get("/txt", obtenerCompetenciasTxt);
router.post("/txt", crearCompetenciaTxt);
router.put("/txt/:id", actualizarCompetenciaTxt);
router.delete("/txt/:id", eliminarCompetenciaTxt);

module.exports = router;
