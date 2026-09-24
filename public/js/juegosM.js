// ==================================================
// CONFIGURACIÓN
// ==================================================
 
const API =
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
 
    JuegoId:
            document.getElementById(
                "JuegoId"
            ).value,

        titulo:
            document.getElementById(
                "titulo"
            ).value,

        genero:
            document.getElementById(
                "genero"
            ).value,

        plataforma:
            document.getElementById(
                "plataforma"
            ).value,

        desarrollador:
            document.getElementById(
                "desarrollador"
            ).value,

        distribuidor:
            document.getElementById(
                "distribuidor"
            ).value,

        fechaLanzamiento:
            document.getElementById(
                "fechaLanzamiento"
            ).value,

        clasificacionEdad:
            document.getElementById(
                "clasificacionEdad"
            ).value,

        modoJuego:
            document.getElementById(
                "modoJuego"
            ).value,

        numeroJugadores:
            document.getElementById(
                "numeroJugadores"
            ).value,

        precio:
            document.getElementById(
                "precio"
            ).value,

        idioma:
            document.getElementById(
                "idioma"
            ).value,

        paisOrigen:
            document.getElementById(
                "paisOrigen"
            ).value,

        descripcion:
            document.getElementById(
                "descripcion"
            ).value,

        imagen:
            imagen
 
    };
}
 
 
function obtenerId() {
 
    return document.getElementById(
        "JuegoId"
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
 
    const juegoV =
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
                        juegoV
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
            "Ingrese el JuegoId"
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
        "JuegoId"
    ).value =
        datos.juegoV.JuegoId;
 
 
    document.getElementById(
        "titulo"
    ).value =
        datos.juegoV.titulo;
 
 
    document.getElementById(
        "genero"
    ).value =
        datos.juegoV.genero;
    
    document.getElementById(
                "plataforma"
    ).value =
        datos.juegoV.plataforma;

    document.getElementById(
                "desarrollador"
            ).value =
        datos.juegoV.desarrollador;

    document.getElementById(
                "distribuidor"
            ).value =
        datos.juegoV.distribuidor;      
        
    document.getElementById(
                "fechaLanzamiento"
            ).value =
        datos.juegoV.fechaLanzamiento;
  
    document.getElementById(
                "clasificacionEdad"
            ).value =
        datos.juegoV.clasificacionEdad;
    
    document.getElementById(
                "modoJuego"
            ).value =
        datos.juegoV.modoJuego;
    
    document.getElementById(
                "numeroJugadores"
            ).value =
        datos.juegoV.numeroJugadores;
    
    document.getElementById(
                "precio"
            ).value =
        datos.juegoV.precio;
    
    document.getElementById(
                "idioma"
            ).value =
        datos.juegoV.idioma;

    document.getElementById(
                "paisOrigen"
            ).value =
        datos.juegoV.paisOrigen;

    document.getElementById(
                "descripcion"
            ).value =
        datos.juegoV.descripcion;

    document.getElementById(
    "vistaPreviaImagen"
).src =
    datos.juegoV.imagen || "";

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
            "Ingrese el JuegoId"
        );
 
        return;
    }
 
 
    const juegoV =
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
                        juegoV
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
            "Ingrese el JuegoId"
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
 
 
    datos.juegosV.forEach(
        juegoV => {
 
            const fila =
                document.createElement(
                    "tr"
                );
 
  //  <td>
                //    ${juegoV._id}
                //</td>
            fila.innerHTML = `
 
                <td>
                    ${juegoV.JuegoId}
                </td>
 
                <td>
                    ${juegoV.titulo}
                </td>
 
                <td>
                    ${juegoV.genero}
                </td>
 
                <td>
                    ${juegoV.plataforma}
                </td>

                  <td>
                    ${juegoV.desarrollador}
                </td>

                  <td>
                    ${juegoV.distribuidor}
                </td>

                  <td>
                    ${juegoV.fechaLanzamiento}
                </td>

                  <td>
                    ${juegoV.clasificacionEdad}
                </td>

                  <td>
                    ${juegoV.modoJuego}
                </td>

                  <td>
                    ${juegoV.numeroJugadores}
                </td>

                  <td>
                    ${juegoV.precio}
                </td>

                  <td>
                    ${juegoV.idioma}
                </td>

                  <td>
                    ${juegoV.paisOrigen}
                </td>
                
                  <td>
                    ${juegoV.descripcion}
                </td>

                  <td>
                     ${ juegoV.imagen
            ? `<img
                    src="${juegoV.imagen}"
                    loading="lazy"
                    width="80"
                    alt="${juegoV.titulo}"
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
 

 
mostrarMongo();