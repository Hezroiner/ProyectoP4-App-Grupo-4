const pool = require("../config/postgres");

function convertirImagenABinario(imagen) {
    if (!imagen) {
        return null;
    }

    const base64 = imagen.includes(",") ? imagen.split(",")[1] : imagen;
    return Buffer.from(base64, "base64");
}

function serializarImagen(imagen) {
    if (!imagen) {
        return "";
    }

    return `data:image/png;base64,${imagen.toString("base64")}`;
}

// ==========================================
// CRUD VIDEOJUEGOS
// ==========================================

const obtenerVideojuegos = async (req, res) => {
    try {
        const resultado = await pool.query(
            `SELECT id, titulo, categoria, desarrolladora, fecha_lanzamiento,
                    clasificacion_edad, modalidad_juego, estado_videojuego,
                    portada_videojuego
             FROM videojuegos
             ORDER BY id`
        );

        const datos = resultado.rows.map(item => ({
            ...item,
            portada_videojuego: serializarImagen(item.portada_videojuego)
        }));

        res.json(datos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al obtener los videojuegos" });
    }
};

const crearVideojuego = async (req, res) => {
    try {
        const {
            titulo,
            categoria,
            desarrolladora,
            fecha_lanzamiento,
            clasificacion_edad,
            modalidad_juego,
            estado_videojuego,
            portada_videojuego
        } = req.body;

        const imagenBinaria = convertirImagenABinario(portada_videojuego);

        const resultado = await pool.query(
            `INSERT INTO videojuegos
             (titulo, categoria, desarrolladora, fecha_lanzamiento,
              clasificacion_edad, modalidad_juego, estado_videojuego,
              portada_videojuego)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING id, titulo, categoria, desarrolladora, fecha_lanzamiento,
                       clasificacion_edad, modalidad_juego, estado_videojuego,
                       portada_videojuego`,
            [
                titulo,
                categoria,
                desarrolladora,
                fecha_lanzamiento,
                clasificacion_edad,
                modalidad_juego,
                estado_videojuego,
                imagenBinaria
            ]
        );

        const dato = resultado.rows[0];
        dato.portada_videojuego = serializarImagen(dato.portada_videojuego);
        res.status(201).json(dato);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al crear el videojuego" });
    }
};

const actualizarVideojuego = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            titulo,
            categoria,
            desarrolladora,
            fecha_lanzamiento,
            clasificacion_edad,
            modalidad_juego,
            estado_videojuego,
            portada_videojuego
        } = req.body;

        const imagenBinaria = convertirImagenABinario(portada_videojuego);

        const resultado = await pool.query(
            `UPDATE videojuegos
             SET titulo = $1,
                 categoria = $2,
                 desarrolladora = $3,
                 fecha_lanzamiento = $4,
                 clasificacion_edad = $5,
                 modalidad_juego = $6,
                 estado_videojuego = $7,
                 portada_videojuego = COALESCE($8, portada_videojuego)
             WHERE id = $9
             RETURNING id, titulo, categoria, desarrolladora, fecha_lanzamiento,
                       clasificacion_edad, modalidad_juego, estado_videojuego,
                       portada_videojuego`,
            [
                titulo,
                categoria,
                desarrolladora,
                fecha_lanzamiento,
                clasificacion_edad,
                modalidad_juego,
                estado_videojuego,
                imagenBinaria,
                id
            ]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({ mensaje: "Videojuego no encontrado" });
        }

        const dato = resultado.rows[0];
        dato.portada_videojuego = serializarImagen(dato.portada_videojuego);
        res.json(dato);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al actualizar el videojuego" });
    }
};

const eliminarVideojuego = async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await pool.query(
            "DELETE FROM videojuegos WHERE id = $1 RETURNING id",
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({ mensaje: "Videojuego no encontrado" });
        }

        res.json({ mensaje: "Videojuego eliminado correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al eliminar el videojuego" });
    }
};

// ==========================================
// CRUD EQUIPOS
// ==========================================

const obtenerEquipos = async (req, res) => {
    try {
        // CARGA EAGER - VISTA 1:
        // El INNER JOIN trae en una sola consulta el equipo y su videojuego.
        const resultado = await pool.query(
            `SELECT e.id, e.videojuego_id, e.nombre_equipo, e.siglas,
                    e.region_equipo, e.entrenador, e.fecha_fundacion,
                    e.ranking_equipo, e.patrocinador_equipo, e.logo_equipo,
                    v.titulo AS videojuego
             FROM equipos e
             INNER JOIN videojuegos v
                ON e.videojuego_id = v.id
             ORDER BY e.id`
        );

        const datos = resultado.rows.map(item => ({
            ...item,
            logo_equipo: serializarImagen(item.logo_equipo)
        }));

        res.json(datos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al obtener los equipos" });
    }
};

const crearEquipo = async (req, res) => {
    try {
        const {
            videojuego_id,
            nombre_equipo,
            siglas,
            region_equipo,
            entrenador,
            fecha_fundacion,
            ranking_equipo,
            patrocinador_equipo,
            logo_equipo
        } = req.body;

        const imagenBinaria = convertirImagenABinario(logo_equipo);

        const resultado = await pool.query(
            `INSERT INTO equipos
             (videojuego_id, nombre_equipo, siglas, region_equipo,
              entrenador, fecha_fundacion, ranking_equipo,
              patrocinador_equipo, logo_equipo)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING id, videojuego_id, nombre_equipo, siglas,
                       region_equipo, entrenador, fecha_fundacion,
                       ranking_equipo, patrocinador_equipo, logo_equipo`,
            [
                videojuego_id,
                nombre_equipo,
                siglas,
                region_equipo,
                entrenador,
                fecha_fundacion,
                ranking_equipo,
                patrocinador_equipo,
                imagenBinaria
            ]
        );

        const dato = resultado.rows[0];
        dato.logo_equipo = serializarImagen(dato.logo_equipo);
        res.status(201).json(dato);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al crear el equipo" });
    }
};

const actualizarEquipo = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            videojuego_id,
            nombre_equipo,
            siglas,
            region_equipo,
            entrenador,
            fecha_fundacion,
            ranking_equipo,
            patrocinador_equipo,
            logo_equipo
        } = req.body;

        const imagenBinaria = convertirImagenABinario(logo_equipo);

        const resultado = await pool.query(
            `UPDATE equipos
             SET videojuego_id = $1,
                 nombre_equipo = $2,
                 siglas = $3,
                 region_equipo = $4,
                 entrenador = $5,
                 fecha_fundacion = $6,
                 ranking_equipo = $7,
                 patrocinador_equipo = $8,
                 logo_equipo = COALESCE($9, logo_equipo)
             WHERE id = $10
             RETURNING id, videojuego_id, nombre_equipo, siglas,
                       region_equipo, entrenador, fecha_fundacion,
                       ranking_equipo, patrocinador_equipo, logo_equipo`,
            [
                videojuego_id,
                nombre_equipo,
                siglas,
                region_equipo,
                entrenador,
                fecha_fundacion,
                ranking_equipo,
                patrocinador_equipo,
                imagenBinaria,
                id
            ]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({ mensaje: "Equipo no encontrado" });
        }

        const dato = resultado.rows[0];
        dato.logo_equipo = serializarImagen(dato.logo_equipo);
        res.json(dato);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al actualizar el equipo" });
    }
};

const eliminarEquipo = async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await pool.query(
            "DELETE FROM equipos WHERE id = $1 RETURNING id",
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({ mensaje: "Equipo no encontrado" });
        }

        res.json({ mensaje: "Equipo eliminado correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al eliminar el equipo" });
    }
};

module.exports = {
    obtenerVideojuegos,
    crearVideojuego,
    actualizarVideojuego,
    eliminarVideojuego,
    obtenerEquipos,
    crearEquipo,
    actualizarEquipo,
    eliminarEquipo
};
