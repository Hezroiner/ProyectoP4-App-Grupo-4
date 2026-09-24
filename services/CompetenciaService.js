const CompetenciaDAO =
    require("../dao/CompetenciaDAO");
 
 
const mongoDAO =
    new CompetenciaDAO();
 
 
class CompetenciaService {
 
    // ==================================================
    // MONGODB + DAO
    // ==================================================
 
 
    async crearMongo(competencia) {
 
        return await mongoDAO.crear(
            competencia
        );
    }
 
 
    async obtenerTodosMongo() {
 
        return await mongoDAO.obtenerTodos();
    }
 
 
    async obtenerPorIdMongo(id) {
 
        return await mongoDAO.obtenerPorId(
            id
        );
    }
 
 
    async actualizarMongo(
        id,
        competencia
    ) {
 
        return await mongoDAO.actualizar(
            id,
            competencia
        );
    }
 
 
    async eliminarMongo(id) {
 
        return await mongoDAO.eliminar(
            id
        );
    }
 
}
 
 
module.exports = CompetenciaService;