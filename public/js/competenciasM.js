// ==================================================
// CONFIGURACIÓN
// ==================================================

const API =
    "/api/competencias";

const API_JUEGOS =
    "/api/juegos";

// ==================================================
// FUNCIONES GENERALES
// ==================================================

function obtenerImagen() {

    return new Promise(
        (resolve, reject) => {

            const archivo =
                document.getElementById(
                    "imagen"
                ).files[0];


            if (!archivo) {

                resolve(null);

                return;
            }


            const lector =
                new FileReader();


            lector.onload =
                () => resolve(
                    lector.result
                );


            lector.onerror =
                () => reject(
                    lector.error
                );


            lector.readAsDataURL(
                archivo
            );

        }
    );
}

async function obtenerDatos() {

    const imagen =
        await obtenerImagen();

    return {

        CompetenciaId:
            document.getElementById(
                "CompetenciaId"
            ).value,

        nombreCompetencia:
            document.getElementById(
                "nombreCompetencia"
            ).value,

        JuegoRelacionadoId:
            document.getElementById(
                "JuegoRelacionadoId"
            ).value,

        organizador:
            document.getElementById(
                "organizador"
            ).value,

        tipoCompetencia:
            document.getElementById(
                "tipoCompetencia"
            ).value,

        modalidad:
            document.getElementById(
                "modalidad"
            ).value,

        categoria:
            document.getElementById(
                "categoria"
            ).value,

        pais:
            document.getElementById(
                "pais"
            ).value,

        ciudad:
            document.getElementById(
                "ciudad"
            ).value,

        lugar:
            document.getElementById(
                "lugar"
            ).value,

        fechaInicio:
            document.getElementById(
                "fechaInicio"
            ).value,

        fechaFin:
            document.getElementById(
                "fechaFin"
            ).value,

        horaInicio:
            document.getElementById(
                "horaInicio"
            ).value,

        cupoEquipos:
            document.getElementById(
                "cupoEquipos"
            ).value,

        participantesPorEquipo:
            document.getElementById(
                "participantesPorEquipo"
            ).value,

        totalParticipantes:
            document.getElementById(
                "totalParticipantes"
            ).value,

        premioPrimerLugar:
            document.getElementById(
                "premioPrimerLugar"
            ).value,

        premioSegundoLugar:
            document.getElementById(
                "premioSegundoLugar"
            ).value,

        premioTercerLugar:
            document.getElementById(
                "premioTercerLugar"
            ).value,

        costoInscripcion:
            document.getElementById(
                "costoInscripcion"
            ).value,

        estado:
            document.getElementById(
                "estado"
            ).value,

        formatoTorneo:
            document.getElementById(
                "formatoTorneo"
            ).value,

        plataformaCompetencia:
            document.getElementById(
                "plataformaCompetencia"
            ).value,

        patrocinador:
            document.getElementById(
                "patrocinador"
            ).value,

        imagen:
            imagen

    };
}



function obtenerId() {

    return document.getElementById(
        "CompetenciaId"
    ).value;
}


function mostrarMensaje(texto) {

    document.getElementById(
        "mensaje"
    ).textContent = texto;
}

// ==================================================
// MONGODB + DAO
// ==================================================


// CREAR MONGODB

async function crearMongo() {

    const competencia =
        await obtenerDatos();


    const respuesta =
        await fetch(

            `${API}/mongo`,

            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body:
                    JSON.stringify(
                        competencia
                    )
            }
        );


    const datos =
        await respuesta.json();


    mostrarMensaje(
        datos.mensaje
    );


    mostrarMongo();
}


// CONSULTAR MONGODB

async function consultarMongo() {

    const id =
        obtenerId();


    if (!id) {

        mostrarMensaje(
            "Ingrese el CompetenciaId"
        );

        return;
    }


    const respuesta =
        await fetch(

            `${API}/mongo/${id}`

        );


    const datos =
        await respuesta.json();


    if (!respuesta.ok) {

        mostrarMensaje(
            datos.mensaje
        );

        return;
    }

    document.getElementById(
        "CompetenciaId"
    ).value =
        datos.competencia.CompetenciaId;


    document.getElementById(
        "nombreCompetencia"
    ).value =
        datos.competencia.nombreCompetencia;


    document.getElementById(
        "JuegoRelacionadoId"
    ).value =
        datos.competencia.JuegoRelacionadoId;


    document.getElementById(
        "organizador"
    ).value =
        datos.competencia.organizador;


    document.getElementById(
        "tipoCompetencia"
    ).value =
        datos.competencia.tipoCompetencia;


    document.getElementById(
        "modalidad"
    ).value =
        datos.competencia.modalidad;


    document.getElementById(
        "categoria"
    ).value =
        datos.competencia.categoria;


    document.getElementById(
        "pais"
    ).value =
        datos.competencia.pais;


    document.getElementById(
        "ciudad"
    ).value =
        datos.competencia.ciudad;


    document.getElementById(
        "lugar"
    ).value =
        datos.competencia.lugar;


    document.getElementById(
        "fechaInicio"
    ).value =
        datos.competencia.fechaInicio;


    document.getElementById(
        "fechaFin"
    ).value =
        datos.competencia.fechaFin;


    document.getElementById(
        "horaInicio"
    ).value =
        datos.competencia.horaInicio;


    document.getElementById(
        "cupoEquipos"
    ).value =
        datos.competencia.cupoEquipos;


    document.getElementById(
        "participantesPorEquipo"
    ).value =
        datos.competencia.participantesPorEquipo;


    document.getElementById(
        "totalParticipantes"
    ).value =
        datos.competencia.totalParticipantes;


    document.getElementById(
        "premioPrimerLugar"
    ).value =
        datos.competencia.premioPrimerLugar;


    document.getElementById(
        "premioSegundoLugar"
    ).value =
        datos.competencia.premioSegundoLugar;


    document.getElementById(
        "premioTercerLugar"
    ).value =
        datos.competencia.premioTercerLugar;


    document.getElementById(
        "costoInscripcion"
    ).value =
        datos.competencia.costoInscripcion;


    document.getElementById(
        "estado"
    ).value =
        datos.competencia.estado;


    document.getElementById(
        "formatoTorneo"
    ).value =
        datos.competencia.formatoTorneo;


    document.getElementById(
        "plataformaCompetencia"
    ).value =
        datos.competencia.plataformaCompetencia;


    document.getElementById(
        "patrocinador"
    ).value =
        datos.competencia.patrocinador;


    document.getElementById(
        "vistaPreviaImagen"
    ).src =
        datos.competencia.imagen || "";

    mostrarMensaje(
        datos.mensaje
    );
}



// ACTUALIZAR MONGODB

async function actualizarMongo() {

    const id =
        obtenerId();


    if (!id) {

        mostrarMensaje(
            "Ingrese el CompetenciaId"
        );

        return;
    }


    const competencia =
        await obtenerDatos();


    const respuesta =
        await fetch(

            `${API}/mongo/${id}`,

            {

                method: "PUT",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body:
                    JSON.stringify(
                        competencia
                    )
            }
        );


    const datos =
        await respuesta.json();


    mostrarMensaje(
        datos.mensaje
    );


    mostrarMongo();
}



// ELIMINAR MONGODB

async function eliminarMongo() {

    const id =
        obtenerId();


    if (!id) {

        mostrarMensaje(
            "Ingrese el CompetenciaId"
        );

        return;
    }


    const respuesta =
        await fetch(

            `${API}/mongo/${id}`,

            {

                method: "DELETE"

            }
        );


    const datos =
        await respuesta.json();


    mostrarMensaje(
        datos.mensaje
    );


    mostrarMongo();
}



// MOSTRAR TODOS MONGODB

async function mostrarMongo() {

    const respuesta =
        await fetch(

            `${API}/mongo`

        );


    const datos =
        await respuesta.json();


    const tabla =
        document.getElementById(
            "tablaMongo"
        );


    tabla.innerHTML = "";


    datos.competencias.forEach(
        competencia => {

            const fila =
                document.createElement(
                    "tr"
                );

            fila.innerHTML = `
 
                 <td>
                    ${competencia.CompetenciaId}
                </td>

                <td>
                    ${competencia.nombreCompetencia}
                </td>

                <td>
                    ${competencia.JuegoRelacionadoId}
                </td>

                <td>
                    ${competencia.organizador}
                </td>

                <td>
                    ${competencia.tipoCompetencia}
                </td>

                <td>
                    ${competencia.modalidad}
                </td>

                <td>
                    ${competencia.categoria}
                </td>

                <td>
                    ${competencia.pais}
                </td>

                <td>
                    ${competencia.ciudad}
                </td>

                <td>
                    ${competencia.lugar}
                </td>

                <td>
                    ${competencia.fechaInicio}
                </td>

                <td>
                    ${competencia.fechaFin}
                </td>

                <td>
                    ${competencia.horaInicio}
                </td>

                <td>
                    ${competencia.cupoEquipos}
                </td>

                <td>
                    ${competencia.participantesPorEquipo}
                </td>

                <td>
                    ${competencia.totalParticipantes}
                </td>

                <td>
                    ${competencia.premioPrimerLugar}
                </td>

                <td>
                    ${competencia.premioSegundoLugar}
                </td>

                <td>
                    ${competencia.premioTercerLugar}
                </td>

                <td>
                    ${competencia.costoInscripcion}
                </td>

                <td>
                    ${competencia.estado}
                </td>

                <td>
                    ${competencia.formatoTorneo}
                </td>

                <td>
                    ${competencia.plataformaCompetencia}
                </td>

                <td>
                    ${competencia.patrocinador}
                </td>

                <td>

                    ${competencia.imagen
                    ? `<img
                                src="${competencia.imagen}"
                                    loading="lazy"
                                    width="80"
                                    alt="${competencia.nombreCompetencia}"
                               >`
                    : "Sin imagen"
                }

                </td>

 
            `;


            tabla.appendChild(
                fila
            );

        }
    );
}

// ==================================================
// CARGA LAZY - JUEGO RELACIONADO
// ==================================================

async function cargarJuegoRelacionado() {

    const id =
        document.getElementById(
            "JuegoRelacionadoId"
        ).value;


    if (!id) {

        mostrarMensaje(
            "No hay juego relacionado"
        );

        return;
    }


    const respuesta =
        await fetch(
            `${API_JUEGOS}/mongo/${id}`
        );


    const datos =
        await respuesta.json();


    if (!respuesta.ok) {

        mostrarMensaje(
            datos.mensaje
        );

        return;
    }


    mostrarMensaje(
        datos.juegoV.JuegoId +
        " - " +
        datos.juegoV.titulo +
        " - " +
        datos.juegoV.desarrollador
    );
}

mostrarMongo();