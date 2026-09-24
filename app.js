require("dotenv").config({ quiet: true });

const express = require("express");
const path = require("path");

const pool = require("./config/postgres");

const authRoutes = require("./routes/authRoutes");
const juegosRoutes = require("./routes/juegosRoutes");
const competenciasRoutes = require("./routes/competenciasRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// Permitir recibir JSON. El limite se amplia porque la imagen viaja en Base64.
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Servir archivos estaticos.
app.use(express.static(path.join(__dirname, "public")));

// Autenticacion: GET / (login), POST /login y GET /logout.
app.use("/", authRoutes);

// Rutas de la Parte 2.
app.use("/api/juegos", juegosRoutes);
app.use("/api/competencias", competenciasRoutes);

// Vista 1 - Videojuegos y equipos.
app.get("/videojuegos", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "videojuegos.html"));
});

// Vista 2 - Competencias y encuentros.
app.get("/competencias", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "competencias.html"));
});

async function iniciarServidor() {
    try {
        // PostgreSQL: el pool conecta de forma perezosa, por eso se prueba
        // la conexion antes de aceptar peticiones.
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
