/**
 * ==========================================
 * Controlador de Autenticación
 * ==========================================
 */

const path = require("path");



const AuthService = require("../services/authService");

/*=========================================
  Mostrar pantalla de login
=========================================*/

function mostrarLogin(req, res) {

    res.sendFile(
        path.join(__dirname, "..", "views", "login.html")
    );

}

/*=========================================
  Procesar login
=========================================*/




function iniciarSesion(req,res){

    try{

        const usuario =
        req.body.usuario;


        const password =
        req.body.password;

        /********************************* */
        console.log(
            "Usuario recibido:",
            usuario
        );


        console.log(
            "Password recibido:",
            password
        );
        /********************************* */

        AuthService.autenticar(
            usuario,
            password
        );


        res.json({

            ok:true

        });


    }
    catch(error){


        res.status(401).json({

            ok:false,

            mensaje:error.message

        });


    }

}

/*=========================================
  Cerrar sesión
=========================================*/

function cerrarSesion(req, res) {

    res.redirect("/");

}

/*=========================================
  Exportar funciones
=========================================*/

module.exports = {

    mostrarLogin,

    iniciarSesion,

    cerrarSesion

};
