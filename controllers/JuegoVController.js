const JuegoVService =
    require("../services/JuegoVService");


const service =
    new JuegoVService();


class JuegoVController {

    // ==================================================
    // MONGODB + DAO
    // ==================================================


    static async crearMongo(
        req,
        res
    ) {

        try {

            const juegoV =
                await service.crearMongo(
                    req.body
                );


            res.json({

                mensaje:
                    "MongoDB: juego creado",

                juegoV

            });


        } catch (error) {

            console.error(error);

            res.status(500).json({

                mensaje:
                    "Error al crear en MongoDB"

            });
        }
    }



    static async obtenerTodosMongo(
        req,
        res
    ) {

        try {

            let juegosV =
                await service.obtenerTodosMongo();


            juegosV =
                juegosV.map(
                    juegoV => {

                        if (
                            juegoV.imagen &&
                            juegoV.imagen._bsontype === "Binary"
                        ) {

                            juegoV.imagen =
                                `data:image/png;base64,${juegoV.imagen.toString("base64")}`;
                        }

                        return juegoV;
                    }
                );


            res.json({

                mensaje:
                    "MongoDB: consulta realizada",

                juegosV

            });


        } catch (error) {

            console.error(error);

            res.status(500).json({

                mensaje:
                    "Error consultando MongoDB"

            });
        }
    }



    static async obtenerPorIdMongo(
        req,
        res
    ) {

        try {

            let juegoV =
                await service.obtenerPorIdMongo(
                    req.params.id
                );


            if (!juegoV) {

                return res.status(404).json({

                    mensaje:
                        "Juego no encontrado en MongoDB"

                });
            }

            if (
                juegoV.imagen &&
                juegoV.imagen._bsontype === "Binary"
            ) {

                juegoV.imagen =
                    `data:image/png;base64,${juegoV.imagen.toString("base64")}`;
            }

            res.json({

                mensaje:
                    "MongoDB: juego encontrado",

                juegoV

            });


        } catch (error) {

            console.error(error);

            res.status(500).json({

                mensaje:
                    "Error consultando MongoDB"

            });
        }
    }

    static async actualizarMongo(
        req,
        res
    ) {

        try {

            const juegoV =
                await service.actualizarMongo(

                    req.params.id,

                    req.body

                );


            if (!juegoV) {

                return res.status(404).json({

                    mensaje:
                        "Juego no encontrado en MongoDB"

                });
            }


            res.json({

                mensaje:
                    "MongoDB: juego actualizado",

                juegoV

            });


        } catch (error) {

            console.error(error);

            res.status(500).json({

                mensaje:
                    "Error actualizando MongoDB"

            });
        }
    }



    static async eliminarMongo(
        req,
        res
    ) {

        try {

            const juegoV =
                await service.eliminarMongo(
                    req.params.id
                );


            if (!juegoV) {

                return res.status(404).json({

                    mensaje:
                        "Juego no encontrado en MongoDB"

                });
            }


            res.json({

                mensaje:
                    "MongoDB: juego eliminado",

                juegoV

            });


        } catch (error) {

            console.error(error);

            res.status(500).json({

                mensaje:
                    "Error eliminando MongoDB"

            });
        }
    }

}


module.exports =
    JuegoVController;