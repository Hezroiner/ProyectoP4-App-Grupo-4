# Conexión y manejo de PostgreSQL (Node.js + Express + `pg`)

Guía de cómo está conectado y cómo se usa PostgreSQL en este proyecto (Proyecto 1 – Parte 2: videojuegos y competencias, EIF509).

> Este proyecto usa el driver oficial `pg` con **SQL escrito a mano** y `dotenv` para leer la configuración desde `.env`. No usa ORM (Sequelize) ni MongoDB.

---

## 1. Resumen rápido

| Pieza | Archivo | Qué hace |
|---|---|---|
| Variables de entorno | `.env` (plantilla: `.env.example`) | Guarda el puerto del servidor y los datos de conexión a PostgreSQL |
| Conexión | `config/postgres.js` | Crea **un solo** `Pool` de `pg` con esas variables y lo exporta |
| Esquema | `database/ScriptCrearBaseDatos.sql` | Crea la base `BDPostgreSQL` y las 4 tablas |
| Datos de prueba | `database/ScriptPopularBaseDatos.sql` | Inserta 5 videojuegos, 10 equipos, 5 competencias y 10 encuentros |
| Controladores | `controllers/juegosController.js`, `controllers/competenciasController.js` | Ejecutan las consultas SQL con `pool.query(...)` y responden JSON |
| Rutas | `routes/juegosRoutes.js`, `routes/competenciasRoutes.js` | Enlazan cada URL con su función del controlador |
| Arranque | `app.js` | Configura Express, verifica PostgreSQL y levanta el servidor |
| Vistas + JS del navegador | `views/*.html`, `public/js/*.js` | Consumen la API con `fetch` |

**Idea central:** el `Pool` es lo único que "habla" con PostgreSQL. Los controladores reciben la petición HTTP, ejecutan SQL con parámetros y devuelven JSON. **No hay capa de servicios ni de modelos** para estas dos vistas.

**Login:** es independiente de PostgreSQL. `dao/usuarioDAO.js` lee los usuarios del archivo `data/usuario.txt` (formato `usuario;password`). Ver `GUIA-LOGIN.md`.

---

## 2. Dependencias

```bash
npm install express pg dotenv
```

| Paquete | Para qué sirve |
|---|---|
| `express` | Servidor HTTP y rutas (`^5.2.1`) |
| `pg` | Driver oficial de PostgreSQL: `Pool`, consultas parametrizadas (`^8.23.0`) |
| `dotenv` | Carga las variables del archivo `.env` en `process.env` (`^18.0.3`) |

Scripts de `package.json`:

| Comando | Qué hace |
|---|---|
| `npm start` | `node app.js` |
| `npm run dev` | `node --watch app.js` (reinicia al guardar cambios; viene incluido en Node, no requiere `nodemon`) |

`package.json` no define `"type"`, así que Node usa CommonJS por defecto: todo el código usa `require` / `module.exports`.

---

## 3. Variables de entorno y conexión

### 3.1 Variables de entorno (`.env`)

```env
PORT=3000

PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=BDPostgreSQL
PG_USER=postgres
PG_PASSWORD=tu_contraseña
```

- `PORT` es del servidor Express, no de la base. Si no existe, `app.js` usa `3000`.
- Puerto por defecto de PostgreSQL: `5432`.
- Los nombres de las variables deben coincidir **exactamente** con los que lee `config/postgres.js`.
- **`.env` contiene credenciales y no se sube al repositorio** (está en `.gitignore`). Lo que se comparte es `.env.example`, que trae las mismas variables sin la contraseña. Quien clone el proyecto copia `.env.example` a `.env` y completa `PG_PASSWORD`.
- El `.env` del proyecto viene con `PG_PASSWORD=SUSTITUIR_PASSWORD`: **hay que reemplazarlo por la contraseña real** del usuario `postgres` de cada máquina.
- Si se cambia el `.env`, hay que reiniciar el servidor (las variables se leen una sola vez al arrancar).

### 3.2 La conexión: `config/postgres.js`

```js
const { Pool } = require("pg");

require("dotenv").config({ quiet: true });

const pool = new Pool({
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    database: process.env.PG_DATABASE,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD
});

module.exports = pool;
```

### Cómo funciona

1. **`require("dotenv").config()`** lee `.env` y llena `process.env`. Se llama aquí (además de en `app.js`) para que este archivo funcione aunque se importe solo. Volver a cargarlo es inofensivo. `quiet: true` evita el mensaje informativo que `dotenv` 18 imprime en consola en cada carga.
2. **`new Pool({...})`** recibe los datos de conexión: host, puerto, nombre de la base, usuario y contraseña.
3. **`module.exports = pool`** exporta la instancia. Node cachea los módulos, así que cualquier archivo que haga `require` de este módulo obtiene **el mismo pool** (singleton).

### Puntos importantes

- **Crear el `Pool` no abre conexiones.** El pool conecta de forma perezosa, en la primera consulta. Por eso `app.js` ejecuta una consulta de prueba antes de levantar el servidor (ver sección 5).
- **Cada controlador obtiene el pool con** `const pool = require("../config/postgres");`.
- **Pool de conexiones.** Con los valores por defecto de `pg`: máximo 10 conexiones y 10 s de inactividad antes de cerrar una conexión ociosa. No se configura nada adicional.
- **`pool.query(sql, valores)`** toma una conexión del pool, ejecuta la consulta y la devuelve automáticamente. Por eso los controladores no abren ni cierran conexiones.
- **El nombre de la base es `BDPostgreSQL`** (con mayúsculas, exigido por el enunciado). En PostgreSQL los nombres con mayúsculas solo se conservan si se crean entre comillas dobles: `CREATE DATABASE "BDPostgreSQL";`.

---

## 4. Base de datos y tablas

Los scripts están en `database/` y se ejecutan **una sola vez**, en este orden.

### 4.1 Crear la base y las tablas: `ScriptCrearBaseDatos.sql`

PostgreSQL no tiene `USE`, por eso se ejecuta en dos pasos desde pgAdmin:

1. Conectado a la base `postgres`: ejecutar solo `CREATE DATABASE "BDPostgreSQL";`
2. Abrir Query Tool sobre `BDPostgreSQL` y ejecutar los `CREATE TABLE`.

### 4.2 Poblar: `ScriptPopularBaseDatos.sql`

Ejecutarlo conectado a `BDPostgreSQL`. Las imágenes van como texto Base64 dentro de `decode('...', 'base64')`, que PostgreSQL convierte a `BYTEA`. Los IDs de los videojuegos quedan así: 1 Dota 2, 2 VALORANT, 3 Rocket League, 4 Counter-Strike 2, 5 League of Legends.

### 4.3 Las 4 tablas y sus relaciones

```
videojuegos (1) ──< equipos          (equipos.videojuego_id → videojuegos.id)
videojuegos (1) ──< competencias     (competencias.videojuego_id → videojuegos.id)
competencias (1) ──< encuentros      (encuentros.competencia_id → competencias.id)
equipos (1) ──< encuentros           (encuentros.equipo_1_id y equipo_2_id → equipos.id)
```

| Tabla | Vista | Columnas (además de `id SERIAL PRIMARY KEY`) |
|---|---|---|
| `videojuegos` | 1 | `titulo`, `categoria`, `desarrolladora`, `fecha_lanzamiento` (DATE), `clasificacion_edad`, `modalidad_juego`, `estado_videojuego`, `portada_videojuego` (BYTEA) |
| `equipos` | 1 | `videojuego_id` (FK), `nombre_equipo`, `siglas`, `region_equipo`, `entrenador`, `fecha_fundacion` (DATE), `ranking_equipo` (INTEGER), `patrocinador_equipo`, `logo_equipo` (BYTEA) |
| `competencias` | 2 | `videojuego_id` (FK), `nombre_competencia`, `fecha_inicio`, `fecha_final` (DATE), `sede_competencia`, `premio_total` (NUMERIC(12,2)), `formato_torneo`, `estado_competencia`, `banner_competencia` (BYTEA) |
| `encuentros` | 2 | `competencia_id`, `equipo_1_id`, `equipo_2_id` (FK), `ronda_encuentro`, `fecha_encuentro` (DATE), `hora_encuentro` (TIME), `puntaje_equipo_1`, `puntaje_equipo_2` (INTEGER), `formato_serie`, `estado_encuentro`, `imagen_encuentro` (BYTEA) |

### Puntos importantes

- **Las tablas se crean con los scripts SQL**, no desde Node. No existe `sync()` ni nada equivalente: si se cambia una tabla, hay que modificarla en la base (y actualizar el script).
- **Las llaves foráneas no tienen `ON DELETE CASCADE`.** No se puede borrar un videojuego que tenga equipos o competencias, ni un equipo/competencia que tenga encuentros: PostgreSQL rechaza el `DELETE` por violación de llave foránea. Hay que borrar primero los registros hijos (orden: `encuentros` → `equipos` / `competencias` → `videojuegos`).
- Los campos de imagen son opcionales (`BYTEA` sin `NOT NULL`); el resto de columnas son obligatorias.

---

## 5. El arranque: `app.js`

```js
require("dotenv").config({ quiet: true });

const pool = require("./config/postgres");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/", authRoutes);
app.use("/api/juegos", juegosRoutes);
app.use("/api/competencias", competenciasRoutes);

app.get("/videojuegos", ...);   // views/videojuegos.html
app.get("/competencias", ...);  // views/competencias.html

async function iniciarServidor() {
    try {
        await pool.query("SELECT 1");
        console.log("PostgreSQL conectado");

        app.listen(PORT, () => {
            console.log(`Servidor ejecutandose en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Error iniciando servidor:", error);
        process.exit(1);
    }
}

iniciarServidor();
```

- **`dotenv` se carga en la primera línea** de `app.js`, antes de importar el pool y las rutas, para que `process.env` ya esté lleno cuando se usa.
- **`PORT`** sale del `.env`; si no está definido se usa `3000`.
- **`express.json({ limit: "10mb" })`**: el límite se amplía porque las imágenes viajan en el JSON como Base64 (el límite por defecto de Express es 100 KB).
- **`pool.query("SELECT 1")`** es la prueba de conexión. Como el pool conecta de forma perezosa, esta consulta obliga a abrir la conexión **antes** de aceptar peticiones. Si falla (base caída, contraseña incorrecta, base inexistente), se imprime el error y el proceso termina con código 1.
- **`app.listen` está dentro del `try`**: el servidor solo se levanta si PostgreSQL respondió. Así nunca queda una API corriendo sin base de datos.
- **La prueba solo verifica la conexión**, no que las tablas existan. Si se olvidó ejecutar los scripts SQL, el servidor arranca pero las consultas responden 500 (`relation "..." does not exist`).
- Los controladores se cargan al importar las rutas, y son ellos quienes importan el pool.

### Orden de ejecución al arrancar

```
node app.js
   ├─ 1. Se cargan las variables del .env
   ├─ 2. require("./config/postgres")      → se crea el pool (aún sin conexión real)
   ├─ 3. Se importan rutas → controladores  (cada controlador reutiliza el mismo pool)
   ├─ 4. Se registran middlewares y rutas
   ├─ 5. iniciarServidor()
   │        ├─ pool.query("SELECT 1")     → abre la conexión y la prueba
   │        └─ app.listen(PORT)           → recién aquí el servidor acepta peticiones
   └─ Si la consulta de prueba falla: se imprime el error, el servidor NO se levanta
      y el proceso termina (código de salida 1)
```

---

## 6. Los controladores y sus consultas

Cada función es un manejador de Express (`async (req, res) => {...}`) con la misma estructura:

```js
const obtenerVideojuegos = async (req, res) => {
    try {
        const resultado = await pool.query("SELECT ... FROM videojuegos ORDER BY id");
        res.json(resultado.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al obtener los videojuegos" });
    }
};
```

- **`resultado.rows`** es el arreglo de filas devuelto por la consulta.
- **Consultas parametrizadas (`$1`, `$2`, …)**: los valores viajan aparte del texto SQL, en un arreglo. Así se evita la inyección SQL; nunca se concatena `req.body` dentro del SQL.
- **`RETURNING ...`** en `INSERT` / `UPDATE` / `DELETE` devuelve el registro afectado sin hacer una segunda consulta.
- **404 vs 500:** en `PUT` y `DELETE`, si `resultado.rows.length === 0` no existía ese `id` y se responde **404**. Cualquier excepción (base caída, error de SQL, violación de llave foránea, etc.) cae en el `catch` y responde **500**.

### Endpoints

Las rutas se montan bajo un prefijo en `app.js`, y luego repiten el nombre del recurso:

| Recurso | GET | POST | PUT | DELETE |
|---|---|---|---|---|
| Videojuegos | `/api/juegos/videojuegos` | `/api/juegos/videojuegos` | `/api/juegos/videojuegos/:id` | `/api/juegos/videojuegos/:id` |
| Equipos | `/api/juegos/equipos` | `/api/juegos/equipos` | `/api/juegos/equipos/:id` | `/api/juegos/equipos/:id` |
| Competencias | `/api/competencias/competencias` | `/api/competencias/competencias` | `/api/competencias/competencias/:id` | `/api/competencias/competencias/:id` |
| Encuentros | `/api/competencias/encuentros` | `/api/competencias/encuentros` | `/api/competencias/encuentros/:id` | `/api/competencias/encuentros/:id` |

Códigos de respuesta: `GET` 200, `POST` 201, `PUT` 200/404, `DELETE` 200/404, y 500 ante cualquier error.

### Carga eager con `INNER JOIN`

Las consultas de listado traen en **una sola consulta** los datos relacionados, para mostrar nombres en lugar de IDs:

| Función | Tablas unidas | Columnas agregadas |
|---|---|---|
| `obtenerEquipos` | `equipos` ⨝ `videojuegos` | `videojuego` (título) |
| `obtenerCompetencias` | `competencias` ⨝ `videojuegos` | `videojuego` (título) |
| `obtenerEncuentros` | `encuentros` ⨝ `competencias` ⨝ `equipos e1` ⨝ `equipos e2` | `competencia`, `equipo_1`, `equipo_2` |

`encuentros` se une **dos veces** a `equipos` (con alias `e1` y `e2`) porque cada encuentro enfrenta a dos equipos. Los `INSERT` / `UPDATE` **no** devuelven esas columnas extra; solo las del propio registro.

---

## 7. Manejo de imágenes (`BYTEA` ↔ Base64)

Las imágenes se guardan en la base como binario (`BYTEA`), pero viajan por la API como texto Base64. Ambos controladores tienen las mismas dos funciones auxiliares (están duplicadas en cada archivo):

```js
function convertirImagenABinario(imagen) {
    if (!imagen) return null;
    const base64 = imagen.includes(",") ? imagen.split(",")[1] : imagen;
    return Buffer.from(base64, "base64");
}

function serializarImagen(imagen) {
    if (!imagen) return "";
    return `data:image/png;base64,${imagen.toString("base64")}`;
}
```

### Flujo completo

```
Guardar:  <input type="file"> → FileReader.readAsDataURL() → "data:image/png;base64,AAAA..."
          → JSON (fetch) → convertirImagenABinario() → Buffer → parámetro $n → columna BYTEA

Leer:     columna BYTEA → pg la entrega como Buffer → serializarImagen()
          → "data:image/png;base64,AAAA..." → JSON → <img src="...">
```

### Puntos importantes

- **`convertirImagenABinario`** quita el prefijo `data:image/...;base64,` (todo lo anterior a la coma) y decodifica el resto a un `Buffer`, que `pg` envía como `BYTEA`.
- **`serializarImagen`** siempre antepone `data:image/png;base64,`, sin importar el formato original. Si la fila no tiene imagen, devuelve cadena vacía `""` (no `null`).
- **En los `UPDATE` se usa `COALESCE($n, columna_imagen)`**: si la petición no trae imagen nueva (`null`), se conserva la que ya estaba. Consecuencia: **por la API no se puede borrar una imagen**, solo reemplazarla.
- **Por eso se amplía el límite de `express.json`** a 10 MB: una imagen en Base64 pesa aproximadamente un 33 % más que el archivo original.
- Las listas (`GET`) incluyen la imagen completa de cada fila, así que las respuestas pueden ser pesadas.

---

## 8. Tipos de datos: cómo llegan a JavaScript

| Tipo en PostgreSQL | Cómo lo entrega `pg` | Consecuencia |
|---|---|---|
| `NUMERIC(12,2)` (`premio_total`) | `string` (por ejemplo `"150000.00"`) | Para cálculos hay que convertirlo con `Number()` / `parseFloat()` |
| `DATE` | Objeto `Date` de JS, que `res.json` serializa como ISO (`"2013-07-09T06:00:00.000Z"`) | El frontend recorta con `String(fecha).substring(0, 10)` (función `fechaCorta`). La fecha depende de la zona horaria del servidor |
| `TIME` | `string` (`"18:00:00"`) | Sin conversión |
| `INTEGER` / `SERIAL` | `number` | Sin conversión |
| `BYTEA` | `Buffer` | Se convierte con `serializarImagen()` (sección 7) |

Otros detalles:

- `req.params.id` llega como texto. Si no es numérico, PostgreSQL rechaza la consulta y el controlador responde 500 (no 404).
- Los valores de `req.body` (fechas, números) se pasan tal cual como parámetros: **no hay validación en el servidor**; si falta un campo obligatorio, la base rechaza el `INSERT` y se responde 500.

---

## 9. Pasos para llevarlo a otra máquina o proyecto

### 9.1 En otra máquina (el mismo proyecto)

1. Instalar PostgreSQL y Node.js.
2. `npm install`.
3. Copiar `.env.example` a `.env` y completar `PG_PASSWORD` con la contraseña local de `postgres` (ajustar `PG_HOST` / `PG_PORT` si no son los por defecto).
4. Ejecutar `ScriptCrearBaseDatos.sql` (en dos pasos, sección 4.1) y luego `ScriptPopularBaseDatos.sql`.
5. `npm start` y abrir `http://localhost:3000`. Debe aparecer `PostgreSQL conectado` en la consola.

### 9.2 Como base de otro proyecto

1. `npm install express pg dotenv`.
2. Crear el `.env` y `.env.example` con las variables `PG_*` (sección 3.1) y agregar `.env` al `.gitignore`.
3. Copiar `config/postgres.js` **sin cambios**.
4. Crear la base y las tablas con un script SQL propio.
5. En cada controlador: `const pool = require("../config/postgres");` y usar `pool.query(sql, [valores])` con parámetros `$1, $2, …`.
6. En `app.js`: cargar `dotenv` en la primera línea y mantener `iniciarServidor()` con la consulta de prueba antes de `app.listen` (sección 5).
7. Montar las rutas con `app.use("/api/...", router)`.

---

## 10. Errores comunes y su causa

| Mensaje / síntoma | Causa probable |
|---|---|
| `Error iniciando servidor: ... ECONNREFUSED 127.0.0.1:5432` | PostgreSQL no está corriendo, o `PG_HOST` / `PG_PORT` son incorrectos. El servidor no se levanta |
| `password authentication failed for user "postgres"` | `PG_PASSWORD` sigue siendo `SUSTITUIR_PASSWORD` o es incorrecta |
| `SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string` | `PG_PASSWORD` llegó como `undefined`: el `.env` no existe, está en otra carpeta o la variable tiene otro nombre |
| `database "BDPostgreSQL" does not exist` | No se ejecutó el `CREATE DATABASE`, o se creó sin comillas dobles (queda como `bdpostgresql`), o `PG_DATABASE` tiene otro nombre |
| `Cannot find module 'dotenv'` | Falta ejecutar `npm install` |
| `relation "videojuegos" does not exist` | Se ejecutó el script de creación sobre otra base (por ejemplo `postgres`) en lugar de `BDPostgreSQL` |
| `violates foreign key constraint` (respuesta 500 al eliminar o crear) | Se borra un registro que tiene hijos, o se crea uno con un `videojuego_id` / `competencia_id` / `equipo_id` inexistente |
| `null value in column "..." violates not-null constraint` | Falta un campo obligatorio en el cuerpo de la petición |
| `PayloadTooLargeError: request entity too large` | La imagen supera el límite de 10 MB de `express.json` |
| La lista responde 200 pero vacía `[]` | La tabla está vacía (no se ejecutó el script de poblado) o el `INNER JOIN` no encuentra relaciones |
| Las fechas aparecen un día antes/después | Diferencia de zona horaria entre el servidor y el valor `DATE` serializado como ISO (ver sección 8) |

---

## 11. Estructura de carpetas

```
ProyectoP4-App-Grupo-4/
├── .env                         (credenciales locales; no se sube al repositorio)
├── .env.example                 (plantilla de .env sin contraseña)
├── .gitignore                   (node_modules/ y .env)
├── app.js
├── package.json
├── config/
│   └── postgres.js              (Pool de pg configurado con las variables PG_*)
├── controllers/
│   ├── juegosController.js      (videojuegos + equipos, SQL con pool.query)
│   ├── competenciasController.js (competencias + encuentros, SQL con pool.query)
│   └── authController.js        (login)
├── routes/
│   ├── juegosRoutes.js
│   ├── competenciasRoutes.js
│   └── authRoutes.js
├── services/
│   └── authService.js           (solo login)
├── dao/
│   └── usuarioDAO.js            (lee data/usuario.txt; no usa base de datos)
├── models/
│   └── usuario.js               (clase simple de usuario; no es un modelo de base de datos)
├── data/
│   └── usuario.txt              (usuario;password)
├── database/
│   ├── ScriptCrearBaseDatos.sql
│   └── ScriptPopularBaseDatos.sql
├── views/                       (login.html, videojuegos.html, competencias.html)
└── public/
    ├── css/estilos.css
    └── js/                      (login.js, videojuegos.js, competencias.js)
```
