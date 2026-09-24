/*
==========================================
Login
==========================================
*/

document.addEventListener("DOMContentLoaded", iniciar);

/*
==========================================
Inicializar
==========================================
*/

function iniciar() {

    const formulario =
        document.getElementById("formLogin");

    formulario.addEventListener(

        "submit",

        autenticar

    );

}

/*
==========================================
Autenticar usuario
==========================================
*/

async function autenticar(evento) {

    evento.preventDefault();

    const usuario =
        document.getElementById("usuario").value.trim();

    const password =
        document.getElementById("password").value.trim();

    const mensaje =
        document.getElementById("mensaje");

    mensaje.innerHTML = "";

    try {

        const respuesta = await fetch(

            "/login",

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify({

                    usuario,

                    password

                })

            }

        );

        const datos = await respuesta.json();

        if (respuesta.ok && datos.ok) {

            mensaje.style.color = "green";

            mensaje.innerHTML =

                "Autenticación correcta...";

            setTimeout(() => {

                window.location.href =
                    "/videojuegos";

            }, 500);

        }
        else {

            mensaje.style.color = "red";

            mensaje.innerHTML =
                datos.mensaje;

        }

    }
    catch (error) {

        mensaje.style.color = "red";

        mensaje.innerHTML =

            "No fue posible conectar con el servidor.";

    }

}
