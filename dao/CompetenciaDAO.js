const conectarMongoDB =
    require("../config/mongodb");

const { Binary } =
    require("mongodb");

class CompetenciaDAO {


    // ==========================
    // CREAR
    // ==========================

    async crear(competencia) {

        const db =
            await conectarMongoDB();

        let imagenBinaria =
            null;


        if (competencia.imagen) {

            const base64 =
                competencia.imagen.includes(",")
                    ? competencia.imagen.split(",")[1]
                    : competencia.imagen;


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

            CompetenciaId:
                competencia.CompetenciaId,

            nombreCompetencia:
                competencia.nombreCompetencia,

            JuegoRelacionadoId:
                competencia.JuegoRelacionadoId,

            organizador:
                competencia.organizador,

            tipoCompetencia:
                competencia.tipoCompetencia,

            modalidad:
                competencia.modalidad,

            categoria:
                competencia.categoria,

            pais:
                competencia.pais,

            ciudad:
                competencia.ciudad,

            lugar:
                competencia.lugar,

            fechaInicio:
                competencia.fechaInicio,

            fechaFin:
                competencia.fechaFin,

            horaInicio:
                competencia.horaInicio,

            cupoEquipos:
                Number(
                    competencia.cupoEquipos
                ),

            participantesPorEquipo:
                Number(
                    competencia.participantesPorEquipo
                ),

            totalParticipantes:
                Number(
                    competencia.totalParticipantes
                ),

            premioPrimerLugar:
                Number(
                    competencia.premioPrimerLugar
                ),

            premioSegundoLugar:
                Number(
                    competencia.premioSegundoLugar
                ),

            premioTercerLugar:
                Number(
                    competencia.premioTercerLugar
                ),

            costoInscripcion:
                Number(
                    competencia.costoInscripcion
                ),

            estado:
                competencia.estado,

            formatoTorneo:
                competencia.formatoTorneo,

            plataformaCompetencia:
                competencia.plataformaCompetencia,

            patrocinador:
                competencia.patrocinador,

            imagen:
                imagenBinaria
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
                CompetenciaId: {
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
                CompetenciaId:
                    id
            });
    }


    // ==========================
    // ACTUALIZAR
    // ==========================

    async actualizar(id, competencia) {

        const db =
            await conectarMongoDB();

        const datos = {

            CompetenciaId:
                competencia.CompetenciaId,

            nombreCompetencia:
                competencia.nombreCompetencia,

            JuegoRelacionadoId:
                competencia.JuegoRelacionadoId,

            organizador:
                competencia.organizador,

            tipoCompetencia:
                competencia.tipoCompetencia,

            modalidad:
                competencia.modalidad,

            categoria:
                competencia.categoria,

            pais:
                competencia.pais,

            ciudad:
                competencia.ciudad,

            lugar:
                competencia.lugar,

            fechaInicio:
                competencia.fechaInicio,

            fechaFin:
                competencia.fechaFin,

            horaInicio:
                competencia.horaInicio,

            cupoEquipos:
                Number(
                    competencia.cupoEquipos
                ),

            participantesPorEquipo:
                Number(
                    competencia.participantesPorEquipo
                ),

            totalParticipantes:
                Number(
                    competencia.totalParticipantes
                ),

            premioPrimerLugar:
                Number(
                    competencia.premioPrimerLugar
                ),

            premioSegundoLugar:
                Number(
                    competencia.premioSegundoLugar
                ),

            premioTercerLugar:
                Number(
                    competencia.premioTercerLugar
                ),

            costoInscripcion:
                Number(
                    competencia.costoInscripcion
                ),

            estado:
                competencia.estado,

            formatoTorneo:
                competencia.formatoTorneo,

            plataformaCompetencia:
                competencia.plataformaCompetencia,

            patrocinador:
                competencia.patrocinador
        };


        if (competencia.imagen) {

            const base64 =
                competencia.imagen.includes(",")
                    ? competencia.imagen.split(",")[1]
                    : competencia.imagen;


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

                        CompetenciaId:
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


        const competencia =
            await this.obtenerPorId(id);


        if (!competencia) {
            return null;
        }


        await db
            .collection("CollMongoDB")
            .deleteOne({

                CompetenciaId:
                    id

            });


        return competencia;
    }

}


module.exports = CompetenciaDAO;