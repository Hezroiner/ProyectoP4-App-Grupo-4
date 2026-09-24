const fs = require("fs");
const path = require("path");


/*
==========================================
Ubicación del archivo usuarios.txt
==========================================
*/

const archivo = path.join(

    __dirname,

    "..",

    "data",

    "usuario.txt"

);



/*
==========================================
Validar credenciales
==========================================
*/

function validarCredenciales(usuario, password) {


    console.log("Archivo usuarios:", archivo);



    const contenido = fs.readFileSync(

        archivo,

        "utf8"

    );


    console.log("Contenido leído:");

    console.log(contenido);



    const lineas = contenido.split("\n");



    for (let linea of lineas) {


        linea = linea.trim();



        if (linea === "") {

            continue;

        }



        const datos = linea.split(";");


        console.log(datos);



        const usuarioArchivo =
            datos[0];


        const passwordArchivo =
            datos[1];



        if (

            usuarioArchivo === usuario &&

            passwordArchivo === password

        ) {


            return {

                usuario: usuarioArchivo

            };


        }


    }


    return null;

}



module.exports = {

    validarCredenciales

};
