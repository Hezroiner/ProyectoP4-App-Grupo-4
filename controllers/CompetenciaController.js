const CompetenciaService =
    require("../services/CompetenciaService");


const service =
    new CompetenciaService();


class CompetenciaController {

    // ==================================================
    // MONGODB + DAO
    // ==================================================


    static async crearMongo(
        req,
        res
    ) {

        try {

            const competencia =
                await service.crearMongo(
                    req.body
                );


            res.json({

                mensaje:
                    "MongoDB: competencia creada",

                competencia

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

            let competencias =
                await service.obtenerTodosMongo();


            competencias =
                competencias.map(
                    competencia => {

                        if (
                            competencia.imagen &&
                            competencia.imagen._bsontype === "Binary"
                        ) {

                            competencia.imagen =
                                `data:image/png;base64,${competencia.imagen.toString("base64")}`;
                        }

                        return competencia;
                    }
                );


            res.json({

                mensaje:
                    "MongoDB: consulta realizada",

                competencias

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

            let competencia =
                await service.obtenerPorIdMongo(
                    req.params.id
                );


            if (!competencia) {

                return res.status(404).json({

                    mensaje:
                        "Competencia no encontrada en MongoDB"

                });
            }

            if (
                competencia.imagen &&
                competencia.imagen._bsontype === "Binary"
            ) {

                competencia.imagen =
                    `data:image/png;base64,${competencia.imagen.toString("base64")}`;
            }

            res.json({

                mensaje:
                    "MongoDB: competencia encontrada",

                competencia

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

            const competencia =
                await service.actualizarMongo(

                    req.params.id,

                    req.body

                );


            if (!competencia) {

                return res.status(404).json({

                    mensaje:
                        "Competencia no encontrada en MongoDB"

                });
            }


            res.json({

                mensaje:
                    "MongoDB: competencia actualizada",

                competencia

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

            const competencia =
                await service.eliminarMongo(
                    req.params.id
                );


            if (!competencia) {

                return res.status(404).json({

                    mensaje:
                        "Competencia no encontrada en MongoDB"

                });
            }


            res.json({

                mensaje:
                    "MongoDB: competencia eliminada",

                competencia

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
    CompetenciaController;