const TxtDAO = require("./TxtDAO");

// data/competencias.txt - mismos campos que la tabla competencias de PostgreSQL.
// videojuego_id referencia el id de data/videojuegos.txt.
// banner_competencia se guarda como Base64 (sin el prefijo data:image/png;base64,).
module.exports = new TxtDAO(
    "competencias.txt",
    [
        "id",
        "videojuego_id",
        "nombre_competencia",
        "fecha_inicio",
        "fecha_final",
        "sede_competencia",
        "premio_total",
        "formato_torneo",
        "estado_competencia",
        "banner_competencia"
    ],
    ["id", "videojuego_id"]
);
