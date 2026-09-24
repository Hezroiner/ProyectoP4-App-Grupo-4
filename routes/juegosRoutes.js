const express = require("express");
const router = express.Router();

const {
    obtenerVideojuegos,
    crearVideojuego,
    actualizarVideojuego,
    eliminarVideojuego,
    obtenerEquipos,
    crearEquipo,
    actualizarEquipo,
    eliminarEquipo
} = require("../controllers/juegosController");

// VIDEOJUEGOS
router.get("/videojuegos", obtenerVideojuegos);
router.post("/videojuegos", crearVideojuego);
router.put("/videojuegos/:id", actualizarVideojuego);
router.delete("/videojuegos/:id", eliminarVideojuego);

// EQUIPOS
router.get("/equipos", obtenerEquipos);
router.post("/equipos", crearEquipo);
router.put("/equipos/:id", actualizarEquipo);
router.delete("/equipos/:id", eliminarEquipo);

module.exports = router;
