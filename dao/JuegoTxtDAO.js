const TxtDAO = require("./TxtDAO");

// data/videojuegos.txt - mismos campos que la tabla videojuegos de PostgreSQL.
// portada_videojuego se guarda como Base64 (sin el prefijo data:image/png;base64,).
module.exports = new TxtDAO("videojuegos.txt", [
    "id",
    "titulo",
    "categoria",
    "desarrolladora",
    "fecha_lanzamiento",
    "clasificacion_edad",
    "modalidad_juego",
    "estado_videojuego",
    "portada_videojuego"
]);
