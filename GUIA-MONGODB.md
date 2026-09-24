# Conexión y manejo de MongoDB (Node.js + Express + `mongodb`)

Guía de cómo está conectado y cómo se utiliza MongoDB en este proyecto (Proyecto 1 – Parte 3: Juegos de videos y competencias, EIF509).

> Esta parte utiliza el driver oficial `mongodb` para Node.js. La comunicación con la base de datos se organiza mediante DAO, Service y Controller. No se utiliza Mongoose ni Sequelize para MongoDB.

---

## 1. Resumen rápido

| Pieza                | Archivo                                                                   | Qué hace                                                                     |
| -------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Variables de entorno | `.env` / `.env.example`                                                   | Guarda la dirección de MongoDB y el nombre de la base                        |
| Conexión             | `config/mongodb.js`                                                       | Crea el `MongoClient` y devuelve la conexión a la base                       |
| Colección            | `CollMongoDB`                                                             | Almacena tanto los documentos de Juegos como los de Competencias             |
| DAO Juegos           | `dao/JuegoVDAO.js`                                                        | Realiza directamente el CRUD de Juegos en MongoDB                            |
| DAO Competencias     | `dao/CompetenciaDAO.js`                                                   | Realiza directamente el CRUD de Competencias en MongoDB                      |
| Services             | `services/JuegoVService.js`, `services/CompetenciaService.js`             | Comunican Controller con DAO                                                 |
| Controllers          | `controllers/JuegoVController.js`, `controllers/CompetenciaController.js` | Reciben las peticiones, utilizan los Services y preparan las respuestas JSON |
| Routes               | `routes/JuegoVRoutes.js`, `routes/CompetenciaRoutes.js`                   | Enlazan las URL con las funciones de los Controllers                         |
| Arranque             | `app.js`                                                                  | Integra MongoDB dentro de la aplicación Express                              |
| Vistas               | `views/juegosM.html`, `views/competenciaM.html`                           | Formularios para Juegos y Competencias                                       |
| JavaScript navegador | `public/js/juegosM.js`, `public/js/competenciasM.js`                      | Utilizan `fetch` para consumir la API                                        |

**Idea central:**

```text
Vista
   ↓
Route
   ↓
Controller
   ↓
Service
   ↓
DAO
   ↓
MongoDB
```

El DAO es la capa que realiza directamente las operaciones sobre la colección `CollMongoDB`.

---

## 2. Dependencias

Para la parte MongoDB se necesita principalmente:

```bash
npm install mongodb
```

Dentro de la aplicación también se utilizan:

```bash
npm install express dotenv
```

| Paquete   | Para qué sirve                                                  |
| --------- | --------------------------------------------------------------- |
| `express` | Servidor HTTP y manejo de rutas                                 |
| `mongodb` | Driver oficial utilizado para conectarse y trabajar con MongoDB |
| `dotenv`  | Permite leer las variables configuradas en `.env`               |

La parte PostgreSQL utiliza además `pg`, pero este paquete no es necesario para realizar las operaciones MongoDB.

---

## 3. Variables de entorno y conexión

### 3.1 Variables de entorno

La configuración MongoDB se encuentra en el archivo `.env`.

```env
MONGO_URI=mongodb://localhost:27017
MONGO_DATABASE=ProyectoJC
```

Dentro del proyecto integrado también se encuentran las variables correspondientes a PostgreSQL.

Ejemplo:

```env
PORT=3000

MONGO_URI=mongodb://localhost:27017
MONGO_DATABASE=ProyectoJC
```

### Puntos importantes

* `MONGO_URI` indica dónde se encuentra ejecutándose MongoDB.
* `MONGO_DATABASE` indica qué base de datos utilizará la aplicación.
* La base utilizada para esta parte es `ProyectoJC`.
* Los documentos se almacenan dentro de la colección `CollMongoDB`.
* El archivo `.env` no debe subirse al repositorio cuando contiene datos privados de configuración.
* `.env.example` puede utilizarse como plantilla.

---

## 4. La conexión: `config/mongodb.js`

La conexión se encuentra en:

```text
config/mongodb.js
```

La estructura utilizada es:

```js
const { MongoClient } =
    require("mongodb");

require("dotenv").config();

const client =
    new MongoClient(
        process.env.MONGO_URI
    );

let db = null;

async function conectarMongoDB() {

    if (!db) {

        await client.connect();

        db = client.db(
            process.env.MONGO_DATABASE
        );

        console.log(
            "MongoDB conectado"
        );
    }

    return db;
}

module.exports =
    conectarMongoDB;
```

### Cómo funciona

1. Se importa `MongoClient` desde el paquete `mongodb`.

2. `dotenv` carga las variables del archivo `.env`.

3. Se crea un cliente utilizando:

```js
new MongoClient(
    process.env.MONGO_URI
);
```

4. La variable:

```js
let db = null;
```

permite conservar la conexión después de crearla.

5. Cuando un DAO necesita utilizar MongoDB ejecuta:

```js
const db =
    await conectarMongoDB();
```

6. Si todavía no existe conexión, se ejecuta:

```js
await client.connect();
```

7. Después se selecciona la base:

```js
client.db(
    process.env.MONGO_DATABASE
);
```

8. Finalmente se devuelve `db` para que el DAO pueda utilizar la colección.

---

## 5. Base de datos, colección y documentos

La base utilizada es:

```text
ProyectoJC
```

La colección obligatoria es:

```text
CollMongoDB
```

Dentro de la misma colección se almacenan dos tipos de documentos.

### 5.1 Juegos de Video

Se almacenan 60 documentos.

Cada documento posee 15 campos:

```text
1. JuegoId
2. titulo
3. genero
4. plataforma
5. desarrollador
6. distribuidor
7. fechaLanzamiento
8. clasificacionEdad
9. modoJuego
10. numeroJugadores
11. precio
12. idioma
13. paisOrigen
14. descripcion
15. imagen
```

MongoDB genera además `_id`, pero este identificador no forma parte de los 15 campos solicitados para el proyecto.

### 5.2 Competencias

Se almacenan 120 documentos.

Cada documento posee 25 campos:

```text
1. CompetenciaId
2. nombreCompetencia
3. JuegoRelacionadoId
4. organizador
5. tipoCompetencia
6. modalidad
7. categoria
8. pais
9. ciudad
10. lugar
11. fechaInicio
12. fechaFin
13. horaInicio
14. cupoEquipos
15. participantesPorEquipo
16. totalParticipantes
17. premioPrimerLugar
18. premioSegundoLugar
19. premioTercerLugar
20. costoInscripcion
21. estado
22. formatoTorneo
23. plataformaCompetencia
24. patrocinador
25. imagen
```

---

## 6. Relación lógica entre Juegos y Competencias

MongoDB no utiliza en este proyecto una llave foránea como PostgreSQL.

La relación se mantiene mediante:

```text
Juego.JuegoId
          ↑
          |
Competencia.JuegoRelacionadoId
```

Ejemplo:

```text
Juego:
JuegoId = JUEGO-02

Competencia:
CompetenciaId = COMP-001
JuegoRelacionadoId = JUEGO-02
```

Esto permite saber que `COMP-001` está relacionada con el juego `JUEGO-02`.

El campo se almacena directamente dentro del documento de competencia:

```js
JuegoRelacionadoId:
    competencia.JuegoRelacionadoId
```

No se crea una segunda colección para realizar esta relación.

---

## 7. Organización del código

### Juegos

```text
views/juegosM.html
        ↓
public/js/juegosM.js
        ↓
routes/JuegoVRoutes.js
        ↓
controllers/JuegoVController.js
        ↓
services/JuegoVService.js
        ↓
dao/JuegoVDAO.js
        ↓
CollMongoDB
```

### Competencias

```text
views/competenciaM.html
        ↓
public/js/competenciasM.js
        ↓
routes/CompetenciaRoutes.js
        ↓
controllers/CompetenciaController.js
        ↓
services/CompetenciaService.js
        ↓
dao/CompetenciaDAO.js
        ↓
CollMongoDB
```

Cada capa tiene una responsabilidad diferente.

---

## 8. DAO: acceso directo a MongoDB

Los archivos:

```text
dao/JuegoVDAO.js
dao/CompetenciaDAO.js
```

son los encargados de realizar directamente las operaciones sobre MongoDB.

Las operaciones principales son:

### Crear

```js
insertOne(documento)
```

### Consultar todos

```js
find(...).toArray()
```

### Consultar uno

```js
findOne(...)
```

### Actualizar

```js
updateOne(...)
```

### Eliminar

```js
deleteOne(...)
```

---

## 9. Cómo se diferencian Juegos y Competencias dentro de la misma colección

Como ambos tipos de documentos se encuentran en `CollMongoDB`, los DAO utilizan campos propios de cada documento para distinguirlos.

### Juegos

```js
.find({
    JuegoId: {
        $exists: true
    }
})
.toArray();
```

Esto obtiene solamente documentos que contienen:

```text
JuegoId
```

### Competencias

```js
.find({
    CompetenciaId: {
        $exists: true
    }
})
.toArray();
```

Esto obtiene solamente documentos que contienen:

```text
CompetenciaId
```

Por eso es posible almacenar ambos grupos dentro de la misma colección sin mezclarlos al realizar los listados.

---

## 10. Services

Los Services se encuentran en:

```text
services/JuegoVService.js
services/CompetenciaService.js
```

Su función es comunicar el Controller con el DAO.

Por ejemplo:

```js
async obtenerPorIdMongo(id) {

    return await dao.obtenerPorId(
        id
    );
}
```

El Service no realiza directamente consultas MongoDB.

La consulta real queda en el DAO.

---

## 11. Controllers

Los Controllers se encuentran en:

```text
controllers/JuegoVController.js
controllers/CompetenciaController.js
```

Cada Controller:

1. recibe la petición;
2. llama al Service;
3. comprueba el resultado;
4. convierte la imagen cuando es necesario;
5. devuelve JSON al navegador;
6. maneja posibles errores.

Ejemplo de consulta:

```js
let juegoV =
    await service.obtenerPorIdMongo(
        req.params.id
    );
```

Si no existe:

```js
return res.status(404).json({
    mensaje:
        "Juego no encontrado en MongoDB"
});
```

Si existe, se devuelve:

```js
res.json({
    mensaje:
        "MongoDB: juego encontrado",
    juegoV
});
```

---

## 12. Routes y endpoints

### Juegos

Las rutas están en:

```text
routes/JuegoVRoutes.js
```

Endpoints:

| Operación       | Método | Endpoint                |
| --------------- | ------ | ----------------------- |
| Crear           | POST   | `/api/juegos/mongo`     |
| Consultar todos | GET    | `/api/juegos/mongo`     |
| Consultar uno   | GET    | `/api/juegos/mongo/:id` |
| Actualizar      | PUT    | `/api/juegos/mongo/:id` |
| Eliminar        | DELETE | `/api/juegos/mongo/:id` |

### Competencias

Las rutas están en:

```text
routes/CompetenciaRoutes.js
```

Endpoints:

| Operación       | Método | Endpoint                      |
| --------------- | ------ | ----------------------------- |
| Crear           | POST   | `/api/competencias/mongo`     |
| Consultar todos | GET    | `/api/competencias/mongo`     |
| Consultar uno   | GET    | `/api/competencias/mongo/:id` |
| Actualizar      | PUT    | `/api/competencias/mongo/:id` |
| Eliminar        | DELETE | `/api/competencias/mongo/:id` |

Las rutas `/mongo` permiten mantenerlas separadas de las rutas PostgreSQL aunque ambas tecnologías formen parte de la misma aplicación.

---

## 13. Las vistas y `fetch`

Las vistas actuales de MongoDB son:

```text
views/juegosM.html
views/competenciaM.html
```

Sus JavaScript son:

```text
public/js/juegosM.js
public/js/competenciasM.js
```

El navegador utiliza `fetch` para comunicarse con el backend.

Ejemplo para consultar un documento:

```js
const respuesta =
    await fetch(
        `${API}/mongo/${id}`
    );

const datos =
    await respuesta.json();
```

Ejemplo para crear:

```js
await fetch(
    `${API}/mongo`,
    {
        method: "POST",
        headers: {
            "Content-Type":
                "application/json"
        },
        body:
            JSON.stringify(datos)
    }
);
```

Para actualizar se utiliza:

```text
PUT
```

y para eliminar:

```text
DELETE
```

---

## 14. Manejo de imágenes

Uno de los requerimientos del proyecto es almacenar las imágenes dentro de MongoDB en formato binario y manejarlas de forma serializada desde la vista.

### 14.1 Desde la vista

En el JavaScript del navegador se utiliza:

```js
const lector =
    new FileReader();
```

y:

```js
lector.readAsDataURL(
    archivo
);
```

`FileReader` convierte la imagen seleccionada en una representación Base64.

El resultado tiene una forma similar a:

```text
data:image/png;base64,iVBORw0KGgo...
```

Esta información viaja mediante JSON hacia el backend.

### 14.2 Conversión en el DAO

En los DAO se elimina primero el prefijo de la cadena:

```js
const base64 =
    imagen.includes(",")
        ? imagen.split(",")[1]
        : imagen;
```

Luego se crea un `Buffer`:

```js
const buffer =
    Buffer.from(
        base64,
        "base64"
    );
```

Finalmente se convierte en un valor `Binary` de MongoDB:

```js
imagenBinaria =
    new Binary(
        buffer
    );
```

Y se almacena dentro del documento:

```js
imagen:
    imagenBinaria
```

### Flujo para guardar

```text
<input type="file">
        ↓
FileReader
        ↓
Base64
        ↓
JSON / fetch
        ↓
DAO
        ↓
Buffer
        ↓
Binary
        ↓
CollMongoDB
```

---

## 15. Recuperación de imágenes

Cuando MongoDB devuelve un documento, el campo imagen se encuentra en formato `Binary`.

El Controller comprueba:

```js
if (
    juegoV.imagen &&
    juegoV.imagen._bsontype === "Binary"
)
```

y posteriormente convierte el contenido nuevamente a Base64:

```js
juegoV.imagen =
    `data:image/png;base64,${
        juegoV.imagen.toString("base64")
    }`;
```

Después el navegador puede utilizar directamente ese valor:

```js
document.getElementById(
    "vistaPreviaImagen"
).src =
    datos.juegoV.imagen || "";
```

### Flujo para leer

```text
CollMongoDB
        ↓
Binary
        ↓
Controller
        ↓
Base64
        ↓
JSON
        ↓
<img src="...">
```

---

## 16. Carga Lazy

La Carga Lazy se utiliza para evitar consultar automáticamente toda la información relacionada.

En la vista de Competencias, cuando se consulta por ejemplo:

```text
COMP-001
```

el documento contiene:

```text
JuegoRelacionadoId = JUEGO-02
```

En este primer momento se carga la información correspondiente a la competencia.

Aunque aparece `JuegoRelacionadoId`, todavía no se realiza una segunda consulta para obtener los datos completos del documento del videojuego.

La consulta del videojuego se realiza posteriormente, cuando el usuario selecciona:

```text
Cargar juego relacionado
```

El sistema toma:

```text
JuegoRelacionadoId
```

y realiza una consulta independiente a:

```text
/api/juegos/mongo/JUEGO-02
```

Entonces se pueden obtener datos del juego que no forman parte del documento de Competencia, por ejemplo:

```text
JuegoId
titulo
desarrollador
```

### Flujo

```text
Consultar COMP-001
        ↓
Se obtiene documento de Competencia
        ↓
JuegoRelacionadoId = JUEGO-02
        ↓
NO se consulta todavía el documento completo del juego
        ↓
Usuario presiona "Cargar juego relacionado"
        ↓
GET /api/juegos/mongo/JUEGO-02
        ↓
Se obtiene el documento del Juego
        ↓
Se muestran ID, título y desarrollador
```

Esta segunda consulta ocurre solamente cuando la información relacionada es solicitada.

---

## 17. Diferencia entre el identificador relacionado y la Carga Lazy

Es importante no confundir:

```text
JuegoRelacionadoId
```

con los datos completos del juego.

`JuegoRelacionadoId` sí forma parte de los 25 campos de Competencias.

Por ejemplo:

```text
JuegoRelacionadoId = JUEGO-02
```

Esto solamente indica cuál juego está relacionado.

Datos como:

```text
titulo
desarrollador
genero
plataforma
descripcion
```

pertenecen al documento de Juegos.

Por eso esos datos pueden obtenerse mediante una segunda consulta cuando el usuario los necesita.

---

## 18. `app.js` e integración con PostgreSQL

MongoDB no funciona como una segunda aplicación independiente.

La parte Mongo se encuentra integrada en el mismo servidor Express que PostgreSQL.

Las rutas Mongo se montan utilizando:

```js
app.use(
    "/api/juegos",
    JuegoVRoutes
);

app.use(
    "/api/competencias",
    CompetenciaRoutes
);
```

Las vistas se encuentran disponibles mediante rutas como:

```text
/mongo/juegos
/mongo/competencias
```

Por lo tanto, el usuario puede navegar entre:

```text
Videojuegos PostgreSQL
Competencias PostgreSQL
Juegos MongoDB
Competencias MongoDB
```

sin ejecutar aplicaciones diferentes.

Aunque los Controllers, Services y DAO de MongoDB se mantuvieron en archivos separados, forman parte del mismo `app.js` y del mismo servidor.

---

## 19. ¿Por qué MongoDB se mantuvo separado de los archivos PostgreSQL?

La parte PostgreSQL existente utiliza una estructura basada directamente en funciones de Controller y `pool.query()`.

La parte MongoDB fue implementada utilizando:

```text
Controller
↓
Service
↓
DAO
```

Para integrar ambas tecnologías sin reescribir código que ya se encontraba funcionando, se conservaron sus archivos correspondientes y se integraron mediante el mismo `app.js` y la misma navegación.

Por lo tanto:

```text
Archivos separados
≠
Aplicaciones separadas
```

Ambas partes forman una sola aplicación.

---

## 20. Ejecución del proyecto

Primero deben estar disponibles:

```text
PostgreSQL
MongoDB
```

Después:

```bash
npm install
```

y:

```bash
npm start
```

Al iniciar correctamente se observa:

```text
PostgreSQL conectado
Servidor ejecutandose en http://localhost:3000
```

Cuando MongoDB es utilizado por primera vez, la conexión imprime:

```text
MongoDB conectado
```

Esto ocurre porque `conectarMongoDB()` realiza la conexión cuando uno de los DAO necesita acceder a la base.

---

## 21. Cómo probar Juegos MongoDB

Entrar a:

```text
/mongo/juegos
```

Probar:

```text
CREAR
CONSULTAR
ACTUALIZAR
ELIMINAR
MOSTRAR TODOS
```

Para consultar puede utilizarse un identificador como:

```text
JUEGO-01
```

Al consultar deben cargarse los 15 campos correspondientes y la imagen almacenada.

---

## 22. Cómo probar Competencias MongoDB

Entrar a:

```text
/mongo/competencias
```

Probar:

```text
CREAR
CONSULTAR
ACTUALIZAR
ELIMINAR
MOSTRAR TODOS
CARGAR JUEGO RELACIONADO
```

Puede utilizarse un identificador como:

```text
COMP-001
```

Después de consultar debe observarse:

```text
JuegoRelacionadoId
```

y posteriormente utilizar el botón:

```text
Cargar juego relacionado
```

para demostrar la consulta adicional del juego.

---

## 23. Errores comunes

| Problema                                    | Posible causa                                                                       |
| ------------------------------------------- | ----------------------------------------------------------------------------------- |
| `MongoServerSelectionError`                 | MongoDB no está ejecutándose o `MONGO_URI` es incorrecto                            |
| No aparece `MongoDB conectado`              | Todavía no se ha realizado ninguna operación Mongo o existe un problema de conexión |
| La vista abre pero los botones no funcionan | El HTML apunta a un archivo JavaScript incorrecto                                   |
| `404` al consultar                          | El `JuegoId` o `CompetenciaId` indicado no existe                                   |
| La tabla aparece vacía                      | No se cargaron los documentos o el campo utilizado por `$exists` no coincide        |
| Las imágenes no aparecen                    | La imagen no fue convertida correctamente de `Binary` a Base64                      |
| Error por tamaño de petición                | La imagen enviada supera el límite configurado en `express.json()`                  |
| `/mongo/competencias` muestra `ENOENT`      | El nombre configurado en `app.js` no coincide con el nombre real del HTML           |
| Cargar juego relacionado no encuentra juego | `JuegoRelacionadoId` no coincide con un `JuegoId` existente                         |

---

## 24. Estructura de archivos MongoDB

Dentro del proyecto integrado:

```text
ProyectoP4-App-Grupo-4/
│
├── app.js
├── .env
├── .env.example
│
├── config/
│   ├── postgres.js
│   └── mongodb.js
│
├── controllers/
│   ├── juegosController.js
│   ├── competenciasController.js
│   ├── JuegoVController.js
│   └── CompetenciaController.js
│
├── services/
│   ├── authService.js
│   ├── JuegoVService.js
│   └── CompetenciaService.js
│
├── dao/
│   ├── usuarioDAO.js
│   ├── JuegoVDAO.js
│   └── CompetenciaDAO.js
│
├── routes/
│   ├── juegosRoutes.js
│   ├── competenciasRoutes.js
│   ├── JuegoVRoutes.js
│   └── CompetenciaRoutes.js
│
├── views/
│   ├── videojuegos.html
│   ├── competencias.html
│   ├── juegosM.html
│   └── competenciaM.html
│
└── public/
    ├── css/
    │   └── estilos.css
    │
    └── js/
        ├── videojuegos.js
        ├── competencias.js
        ├── juegosM.js
        └── competenciasM.js
```

---

## 25. Resumen para explicar al profesor

Si se necesita explicar rápidamente el funcionamiento:

```text
La vista realiza un fetch.
        ↓
La Route recibe la petición.
        ↓
El Controller maneja la respuesta.
        ↓
El Service comunica con el DAO.
        ↓
El DAO realiza la operación en CollMongoDB.
```

Para las imágenes:

```text
Vista
→ FileReader
→ Base64
→ DAO
→ Buffer
→ Binary
→ MongoDB
```

Para recuperarlas:

```text
MongoDB
→ Binary
→ Controller
→ Base64
→ Vista
```

Para la relación:

```text
Competencia.JuegoRelacionadoId
        ↓
Juego.JuegoId
```

Para Carga Lazy:

```text
Consultar competencia
→ obtener JuegoRelacionadoId
→ todavía no consultar Juego
→ usuario solicita juego relacionado
→ segunda consulta
→ mostrar datos del Juego
```
