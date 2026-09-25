const express = require("express");
const router = express.Router();

const {
    obtenerJuegosTxt,
    crearJuegoTxt,
    actualizarJuegoTxt,
    eliminarJuegoTxt
} = require("../controllers/JuegoTxtController");

// JUEGOS - ARCHIVO TXT
router.get("/txt", obtenerJuegosTxt);
router.post("/txt", crearJuegoTxt);
router.put("/txt/:id", actualizarJuegoTxt);
router.delete("/txt/:id", eliminarJuegoTxt);

module.exports = router;
