# Guía: módulo de Login (para copiar al proyecto nuevo)

Este documento trae el módulo de autenticación **tal cual está en el lab** (mismo estilo del profesor: una instrucción por línea, comentarios con bloques `====`). La idea es pegar cada bloque en el proyecto nuevo **en el orden indicado**, porque cada capa depende de la anterior (`require`). Si las creas en otro orden, Node no va a tronar igual (los `require` en Node no se resuelven hasta que se ejecutan), pero sí es más fácil que se te olvide algún archivo si no sigues el orden.

## 0. Estructura de carpetas que necesitas antes de empezar

```
tu-proyecto-nuevo/
├── app.js
├── package.json
├── controllers/
│   └── authController.js
├── services/
│   └── authService.js
├── dao/
│   └── usuarioDAO.js
├── models/
│   └── usuario.js
├── data/
│   └── usuario.txt
├── routes/
│   └── authRoutes.js
├── views/
│   └── login.html
└── public/
    ├── css/estilos.css
    └── js/login.js
```

Antes de pegar código:
```
npm init -y
npm install express
```

Y en `package.json`, dentro de `"scripts"`, agrega (igual que el lab):
```json
"scripts": {
  "start": "node app.js",
  "dev": "node --watch app.js"
}
```

---

## 1. `data/usuario.txt` (la "base de datos" de usuarios)

Formato: `usuario;password` uno por línea, sin encabezado.

```
admin;12345
profesor;abc123
secretaria;clave456
```

Puedes cambiar estos usuarios de prueba por los tuyos, pero **respeta el formato** `usuario;password` porque el DAO lo lee así.

---

## 2. `models/usuario.js`

```js
/**
 * ==========================================
 * Modelo Usuario
 * ==========================================
 */

class Usuario {

    constructor(usuario, password) {

        this.usuario = usuario;
        this.password = password;

    }

}

module.exports = Usuario;
```

---

## 3. `dao/usuarioDAO.js`

```js
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
```

> Nota: este DAO solo exporta `validarCredenciales`. Es importante porque en el paso 4 vas a ver que `authService.js` intenta usar dos funciones más (`buscarPorUsuario` y `listar`) que **no existen aquí**. En el lab original tampoco existen — es intencional dejarlo así (ver sección de advertencias al final).

---

## 4. `services/authService.js`

```js
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
```

> Igual que arriba: `buscarPorUsuario` y `listar` de este archivo llaman a funciones que el DAO no tiene. **Mientras nadie los llame desde un controller/ruta, no truenan** (JS no valida que la función exista hasta que se ejecuta). Si tú no vas a usar login con esas funciones, cópialo tal cual y no las toques.

---

## 5. `controllers/authController.js`

```js
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
```

> ⚠️ **Ojo con esta línea:** en el archivo original del lab dice
> `const AuthService = require("../services/AuthService");` (con A y S mayúsculas), pero el archivo real se llama `authService.js` (minúsculas). En Windows funciona porque el sistema de archivos no distingue mayúsculas de minúsculas, pero **si el proyecto nuevo llega a correr en Linux/Mac o en un hosting que sí distingue mayúsculas, esa línea truena con `MODULE_NOT_FOUND`.** Arriba ya te lo dejé corregido (`../services/authService`) — cópialo así para evitarte el dolor de cabeza, es el único cambio real que se aparta del archivo original.

---

## 6. `routes/authRoutes.js`

```js
/**
 * ==========================================
 * Rutas de Autenticación
 * ==========================================
 */

const express = require("express");

const router = express.Router();

const AuthController =
    require("../controllers/authController");

/*=========================================
  GET
  Mostrar Login
=========================================*/

router.get(

    "/",

    AuthController.mostrarLogin

);

/*=========================================
  POST
  Iniciar Sesión
=========================================*/

router.post(

    "/login",

    AuthController.iniciarSesion

);

/*=========================================
  GET
  Cerrar Sesión
=========================================*/

router.get(

    "/logout",

    AuthController.cerrarSesion

);

/*=========================================
  Exportar Router
=========================================*/

module.exports = router;
```

---

## 7. `app.js` (servidor principal)

```js
const express = require("express");

const path = require("path");

const app = express();


/*
=================================
Middleware
=================================
*/


app.use(express.json());

app.use(express.urlencoded({
    extended:true
}));


/*
=================================
Archivos públicos
=================================
*/

app.use(express.static(
    path.join(__dirname,"public")
));


/*
=================================
Rutas
=================================
*/

const authRoutes =
require("./routes/authRoutes");


app.use("/",authRoutes);


/*
=================================
Servidor
=================================
*/

app.listen(2000,()=>{

    console.log(
        "Servidor iniciado en puerto 2000"
    );

});
```

> Este `app.js` de aquí **solo trae la parte de login** (quité el `require` y el `app.use` de `estudianteRoutes`, porque esa parte es tu CRUD nuevo, no el login). Cuando armes tus rutas de Videojuego/Competencia, agrégalas con el mismo patrón:
> ```js
> const videojuegoRoutes = require("./routes/videojuegoRoutes");
> app.use("/", videojuegoRoutes);
> ```
> El puerto `2000` está fijo en el código (igual que en el lab) — si en tu proyecto nuevo vas a correr otra cosa en ese puerto al mismo tiempo, es el único número que tendrías que tocar.

---

## 8. `views/login.html`

```html
<!DOCTYPE html>

<html lang="es">

<head>

    <meta charset="UTF-8">

    <meta name="viewport"
          content="width=device-width, initial-scale=1.0">

    <title>Autenticación</title>

    <link rel="stylesheet"
          href="/css/estilos.css">

</head>

<body>

    <div class="contenedor-login">

        <h1>Autenticación</h1>

        <form id="formLogin">

            <label>Usuario</label>

            <input
                type="text"
                id="usuario"
                required>

            <label>Contraseña</label>

            <input
                type="password"
                id="password"
                required>

            <br><br>

            <button type="submit">

                Ingresar

            </button>

        </form>

        <br>

        <div id="mensaje"></div>

    </div>

    <script src="/js/login.js"></script>

</body>

</html>
```

---

## 9. `public/js/login.js`

```js
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
                    "/estudiantes/pagina";

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
```

> ⚠️ **Esta es la línea que SÍ tienes que cambiar tú mismo, sin falta:**
> ```js
> window.location.href = "/estudiantes/pagina";
> ```
> Ese `"/estudiantes/pagina"` es la página a la que redirige después de un login correcto en el lab original. En tu proyecto nuevo todavía no existe esa ruta — tienes que apuntarlo a la página principal de tu CRUD (por ejemplo `/videojuegos/pagina` o la que definas cuando armes tus rutas). Si lo dejas como está, el login "funciona" (te dice "Autenticación correcta") pero después redirige a un 404 porque esa ruta no existe en tu proyecto todavía.

---

## 10. `public/css/estilos.css`

Este es 100% reutilizable, no tiene nada específico de "estudiante" — son solo estilos genéricos (login, tabla, botones, inputs). Cópialo completo:

```css
/*=========================================
    Estilo general
=========================================*/

*{
    margin:0;
    padding:0;
    box-sizing:border-box;
    font-family:Arial, Helvetica, sans-serif;
}

/*=========================================
    Página
=========================================*/

body{

    background:#f2f2f2;

    padding:30px;

}

/*=========================================
    Contenedor principal
=========================================*/

.contenedor,
.contenedor-login{

    width:700px;

    margin:auto;

    background:white;

    padding:30px;

    border-radius:8px;

    box-shadow:0px 0px 10px gray;

}

/*=========================================
    Títulos
=========================================*/

h1{

    text-align:center;

    margin-bottom:20px;

    color:#1b4f72;

}

h2{

    margin-top:15px;

    margin-bottom:15px;

}

/*=========================================
    Etiquetas
=========================================*/

label{

    display:block;

    margin-top:10px;

    margin-bottom:5px;

    font-weight:bold;

}

/*=========================================
    Cajas de texto
=========================================*/

input{

    width:100%;

    padding:10px;

    border:1px solid gray;

    border-radius:5px;

    font-size:16px;

}

/*=========================================
    Botones
=========================================*/

button{

    margin-top:10px;

    margin-right:5px;

    padding:10px 20px;

    cursor:pointer;

    border:none;

    border-radius:5px;

    background:#2874A6;

    color:white;

    font-size:15px;

}

button:hover{

    background:#1F618D;

}

/*=========================================
    Tabla
=========================================*/

table{

    width:100%;

    border-collapse:collapse;

    margin-top:20px;

}

table th{

    background:#2874A6;

    color:white;

    padding:10px;

}

table td{

    padding:8px;

    text-align:center;

    border:1px solid #cccccc;

}

table tr:nth-child(even){

    background:#F4F6F7;

}

/*=========================================
    Mensajes
=========================================*/

#mensaje{

    margin-top:20px;

    font-weight:bold;

    color:#C0392B;

}
```

---

## Resumen: 3 cosas a vigilar para que no truene

1. **`data/usuario.txt` debe existir antes de correr el servidor.** El DAO no lo crea automáticamente (a diferencia del DAO de estudiantes, que sí tiene `inicializarArchivo()`). Si el archivo no existe, `fs.readFileSync` lanza error al primer intento de login.
2. **El `require` de `authController.js` → `authService.js`** debe respetar minúsculas (`../services/authService`, no `AuthService`) para que funcione también fuera de Windows.
3. **La línea de redirección en `public/js/login.js`** (`/estudiantes/pagina`) hay que cambiarla a la ruta de tu propia página principal una vez que tengas tus rutas de Videojuego/Competencia listas — si no, el login "pasa" pero cae en un 404.

## Checklist para probar que quedó bien

- [ ] `npm install` corrido, `express` en `node_modules`
- [ ] Carpetas y archivos creados en el orden de este documento
- [ ] `data/usuario.txt` tiene al menos un usuario de prueba
- [ ] `node app.js` (o `npm run dev`) levanta sin errores en consola
- [ ] Entrar a `http://localhost:2000/` muestra el formulario de login
- [ ] Con credenciales incorrectas aparece el mensaje en rojo
- [ ] Con credenciales correctas aparece "Autenticación correcta..." (el redirect fallará hasta que existan tus rutas nuevas — es esperado en este punto)
