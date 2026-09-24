const JuegoVDAO =
    require("../dao/JuegoVDAO");
 
 
const mongoDAO =
    new JuegoVDAO();
 
 
class JuegoVService {
 
    // ==================================================
    // MONGODB + DAO
    // ==================================================
 
 
    async crearMongo(juegoV) {
 
        return await mongoDAO.crear(
            juegoV
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
        juegoV
    ) {
 
        return await mongoDAO.actualizar(
            id,
            juegoV
        );
    }
 
 
    async eliminarMongo(id) {
 
        return await mongoDAO.eliminar(
            id
        );
    }
 
}
 
 
module.exports = JuegoVService;