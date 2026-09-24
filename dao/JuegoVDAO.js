const conectarMongoDB =
    require("../config/mongodb");
 
const { Binary } =
    require("mongodb");
 
class JuegoVDAO {
 
 
    // ==========================
    // CREAR
    // ==========================
 
    async crear(juegoV) {
 
        const db =
            await conectarMongoDB();
     
        let imagenBinaria =
    null;


if (juegoV.imagen) {

    const base64 =
        juegoV.imagen.includes(",")
            ? juegoV.imagen.split(",")[1]
            : juegoV.imagen;


    const buffer =
        Buffer.from(
            base64,
            "base64"
        );
    
    imagenBinaria =
        new Binary(
            buffer
        );
    }
        const documento = {

            JuegoId: juegoV.JuegoId,

            titulo: juegoV.titulo,

            genero: juegoV.genero,

            plataforma: juegoV.plataforma,

            desarrollador: juegoV.desarrollador,

            distribuidor: juegoV.distribuidor,

            fechaLanzamiento: juegoV.fechaLanzamiento,
          
            clasificacionEdad: juegoV.clasificacionEdad,
            modoJuego: juegoV.modoJuego,

            numeroJugadores: Number (
                juegoV.numeroJugadores
            ),
            
            precio: Number(
                juegoV.precio
            ),

            idioma: juegoV.idioma,

            paisOrigen: juegoV.paisOrigen,

            descripcion: juegoV.descripcion,

            imagen: imagenBinaria
            
        };
 
 
        const resultado =
            await db
                .collection("CollMongoDB")
                .insertOne(documento);
 
 
        return {
 
            _id: resultado.insertedId,
 
            ...documento
 
        };
    }
 
 
    // ==========================
    // CONSULTAR TODOS
    // ==========================
 
    async obtenerTodos() {
 
        const db =
            await conectarMongoDB();
 
 
        return await db
            .collection("CollMongoDB")
            .find({
            JuegoId: {
                $exists: true
            }
        })
            .toArray();
    }
 
 
    // ==========================
    // CONSULTAR UNO
    // ==========================
 
    async obtenerPorId(id) {
 
        const db =
            await conectarMongoDB();
 
 
        return await db
            .collection("CollMongoDB")
            .findOne({
                 JuegoId:
                 id
            });
    }
 
 
    // ==========================
    // ACTUALIZAR
    // ==========================
 
    async actualizar(id, juegoV) {
 
        const db =
            await conectarMongoDB();
 
        const datos = {
 
            JuegoId: juegoV.JuegoId,

            titulo: juegoV.titulo,

            genero: juegoV.genero,

            plataforma: juegoV.plataforma,

            desarrollador: juegoV.desarrollador,

            distribuidor: juegoV.distribuidor,

            fechaLanzamiento: juegoV.fechaLanzamiento,
          
            clasificacionEdad: juegoV.clasificacionEdad,
            modoJuego: juegoV.modoJuego,

            numeroJugadores: Number (
                juegoV.numeroJugadores
            ),
            
            precio: Number(
                juegoV.precio
            ),

            idioma: juegoV.idioma,

            paisOrigen: juegoV.paisOrigen,

            descripcion: juegoV.descripcion
        };

            if (juegoV.imagen) {

        const base64 =
            juegoV.imagen.includes(",")
                ? juegoV.imagen.split(",")[1]
                : juegoV.imagen;


        const buffer =
            Buffer.from(
                base64,
                "base64"
            );


        datos.imagen =
            new Binary(
                buffer
            );
    }
 
        const resultado =
            await db
                .collection("CollMongoDB")
                .updateOne(
 
                    {
                        
                     JuegoId: 
                     id
        
                    },
                    
                    {
                        $set: datos
                    }
 
                );
 
 
        if (resultado.matchedCount === 0) {
 
            return null;
        }
 
 
        return await this.obtenerPorId(id);
    }
 
 
    // ==========================
    // ELIMINAR
    // ==========================
 
    async eliminar(id) {
 
        const db =
            await conectarMongoDB();
 
 
        const juegoV =
            await this.obtenerPorId(id);
 
 
        if (!juegoV) {
            return null;
        }
 
 
        await db
            .collection("CollMongoDB")
            .deleteOne({
 
                JuegoId:
                id
 
            });
 
 
        return juegoV;
    }
 
}
 
 
module.exports = JuegoVDAO;