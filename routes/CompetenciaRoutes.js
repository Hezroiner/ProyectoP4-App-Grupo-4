const express = require("express");
 
const router = express.Router();
 
const CompetenciaController =
    require("../controllers/CompetenciaController");
 
// ======================================================
// MONGODB + DAO
//
// IMPORTANTE:
// Estas rutas deben estar ANTES de /:id
// ======================================================
 
 
// CREAR MONGODB
router.post(
    "/mongo",
    CompetenciaController.crearMongo
);
 
 
// CONSULTAR TODOS MONGODB
router.get(
    "/mongo",
    CompetenciaController.obtenerTodosMongo
);
 
 
// CONSULTAR UNO MONGODB
router.get(
    "/mongo/:id",
    CompetenciaController.obtenerPorIdMongo
);
 
 
// ACTUALIZAR MONGODB
router.put(
    "/mongo/:id",
    CompetenciaController.actualizarMongo
);
 
 
// ELIMINAR MONGODB
router.delete(
    "/mongo/:id",
    CompetenciaController.eliminarMongo
);
 
 
module.exports = router;