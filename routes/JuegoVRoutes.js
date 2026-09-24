const express = require("express");
 
const router = express.Router();
 
const JuegoVController =
    require("../controllers/JuegoVController");
 
// ======================================================
// MONGODB + DAO
//
// IMPORTANTE:
// Estas rutas deben estar ANTES de /:id
// ======================================================
 
 
// CREAR MONGODB
router.post(
    "/mongo",
    JuegoVController.crearMongo
);
 
 
// CONSULTAR TODOS MONGODB
router.get(
    "/mongo",
    JuegoVController.obtenerTodosMongo
);
 
 
// CONSULTAR UNO MONGODB
router.get(
    "/mongo/:id",
    JuegoVController.obtenerPorIdMongo
);
 
 
// ACTUALIZAR MONGODB
router.put(
    "/mongo/:id",
    JuegoVController.actualizarMongo
);
 
 
// ELIMINAR MONGODB
router.delete(
    "/mongo/:id",
    JuegoVController.eliminarMongo
);
 
 
module.exports = router;