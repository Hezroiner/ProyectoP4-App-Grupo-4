/**
 * ==========================================
 * Servicio de Autenticación
 * ==========================================
 */

const UsuarioDAO = require("../dao/usuarioDAO");

/*=========================================
  Autenticar usuario
=========================================*/
function autenticar(usuario,password){


    const encontrado =
    UsuarioDAO.validarCredenciales(
        usuario,
        password
    );


    if(!encontrado){

        throw new Error(
            "Usuario o contraseña incorrectos."
        );

    }


    return encontrado;

}

/*=========================================
  Buscar usuario
=========================================*/

function buscarPorUsuario(usuario) {

    if (!usuario || usuario.trim() === "") {

        return null;

    }

    return UsuarioDAO.buscarPorUsuario(
        usuario.trim()
    );

}

/*=========================================
  Listar usuarios
=========================================*/

function listar() {

    return UsuarioDAO.listar();

}

/*=========================================
  Exportar funciones
=========================================*/
module.exports = {

    autenticar,

    buscarPorUsuario,

    listar

};
