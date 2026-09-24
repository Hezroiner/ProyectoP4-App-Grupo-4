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
// CRUD COMPETENCIAS
// ==========================================

const obtenerCompetencias = async (req, res) => {
    try {
        // CARGA EAGER - APOYO DE VISTA 2:
        // Se carga la competencia junto con el videojuego relacionado.
        const resultado = await pool.query(
            `SELECT c.id, c.videojuego_id, c.nombre_competencia,
                    c.fecha_inicio, c.fecha_final, c.sede_competencia,
                    c.premio_total, c.formato_torneo, c.estado_competencia,
                    c.banner_competencia, v.titulo AS videojuego
             FROM competencias c
             INNER JOIN videojuegos v
                ON c.videojuego_id = v.id
             ORDER BY c.id`
        );

        const datos = resultado.rows.map(item => ({
            ...item,
            banner_competencia: serializarImagen(item.banner_competencia)
        }));

        res.json(datos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al obtener las competencias" });
    }
};

const crearCompetencia = async (req, res) => {
    try {
        const {
            videojuego_id,
            nombre_competencia,
            fecha_inicio,
            fecha_final,
            sede_competencia,
            premio_total,
            formato_torneo,
            estado_competencia,
            banner_competencia
        } = req.body;

        const imagenBinaria = convertirImagenABinario(banner_competencia);

        const resultado = await pool.query(
            `INSERT INTO competencias
             (videojuego_id, nombre_competencia, fecha_inicio, fecha_final,
              sede_competencia, premio_total, formato_torneo,
              estado_competencia, banner_competencia)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING id, videojuego_id, nombre_competencia, fecha_inicio,
                       fecha_final, sede_competencia, premio_total,
                       formato_torneo, estado_competencia, banner_competencia`,
            [
                videojuego_id,
                nombre_competencia,
                fecha_inicio,
                fecha_final,
                sede_competencia,
                premio_total,
                formato_torneo,
                estado_competencia,
                imagenBinaria
            ]
        );

        const dato = resultado.rows[0];
        dato.banner_competencia = serializarImagen(dato.banner_competencia);
        res.status(201).json(dato);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al crear la competencia" });
    }
};

const actualizarCompetencia = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            videojuego_id,
            nombre_competencia,
            fecha_inicio,
            fecha_final,
            sede_competencia,
            premio_total,
            formato_torneo,
            estado_competencia,
            banner_competencia
        } = req.body;

        const imagenBinaria = convertirImagenABinario(banner_competencia);

        const resultado = await pool.query(
            `UPDATE competencias
             SET videojuego_id = $1,
                 nombre_competencia = $2,
                 fecha_inicio = $3,
                 fecha_final = $4,
                 sede_competencia = $5,
                 premio_total = $6,
                 formato_torneo = $7,
                 estado_competencia = $8,
                 banner_competencia = COALESCE($9, banner_competencia)
             WHERE id = $10
             RETURNING id, videojuego_id, nombre_competencia, fecha_inicio,
                       fecha_final, sede_competencia, premio_total,
                       formato_torneo, estado_competencia, banner_competencia`,
            [
                videojuego_id,
                nombre_competencia,
                fecha_inicio,
                fecha_final,
                sede_competencia,
                premio_total,
                formato_torneo,
                estado_competencia,
                imagenBinaria,
                id
            ]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({ mensaje: "Competencia no encontrada" });
        }

        const dato = resultado.rows[0];
        dato.banner_competencia = serializarImagen(dato.banner_competencia);
        res.json(dato);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al actualizar la competencia" });
    }
};

const eliminarCompetencia = async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await pool.query(
            "DELETE FROM competencias WHERE id = $1 RETURNING id",
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({ mensaje: "Competencia no encontrada" });
        }

        res.json({ mensaje: "Competencia eliminada correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al eliminar la competencia" });
    }
};

// ==========================================
// CRUD ENCUENTROS
// ==========================================

const obtenerEncuentros = async (req, res) => {
    try {
        // CARGA EAGER - VISTA 2:
        // Los INNER JOIN cargan en una sola consulta el encuentro,
        // la competencia y los nombres de los dos equipos relacionados.
        const resultado = await pool.query(
            `SELECT en.id, en.competencia_id, en.equipo_1_id, en.equipo_2_id,
                    en.ronda_encuentro, en.fecha_encuentro, en.hora_encuentro,
                    en.puntaje_equipo_1, en.puntaje_equipo_2, en.formato_serie,
                    en.estado_encuentro, en.imagen_encuentro,
                    c.nombre_competencia AS competencia,
                    e1.nombre_equipo AS equipo_1,
                    e2.nombre_equipo AS equipo_2
             FROM encuentros en
             INNER JOIN competencias c
                ON en.competencia_id = c.id
             INNER JOIN equipos e1
                ON en.equipo_1_id = e1.id
             INNER JOIN equipos e2
                ON en.equipo_2_id = e2.id
             ORDER BY en.id`
        );

        const datos = resultado.rows.map(item => ({
            ...item,
            imagen_encuentro: serializarImagen(item.imagen_encuentro)
        }));

        res.json(datos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al obtener los encuentros" });
    }
};

const crearEncuentro = async (req, res) => {
    try {
        const {
            competencia_id,
            equipo_1_id,
            equipo_2_id,
            ronda_encuentro,
            fecha_encuentro,
            hora_encuentro,
            puntaje_equipo_1,
            puntaje_equipo_2,
            formato_serie,
            estado_encuentro,
            imagen_encuentro
        } = req.body;

        const imagenBinaria = convertirImagenABinario(imagen_encuentro);

        const resultado = await pool.query(
            `INSERT INTO encuentros
             (competencia_id, equipo_1_id, equipo_2_id, ronda_encuentro,
              fecha_encuentro, hora_encuentro, puntaje_equipo_1,
              puntaje_equipo_2, formato_serie, estado_encuentro,
              imagen_encuentro)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
             RETURNING id, competencia_id, equipo_1_id, equipo_2_id,
                       ronda_encuentro, fecha_encuentro, hora_encuentro,
                       puntaje_equipo_1, puntaje_equipo_2, formato_serie,
                       estado_encuentro, imagen_encuentro`,
            [
                competencia_id,
                equipo_1_id,
                equipo_2_id,
                ronda_encuentro,
                fecha_encuentro,
                hora_encuentro,
                puntaje_equipo_1,
                puntaje_equipo_2,
                formato_serie,
                estado_encuentro,
                imagenBinaria
            ]
        );

        const dato = resultado.rows[0];
        dato.imagen_encuentro = serializarImagen(dato.imagen_encuentro);
        res.status(201).json(dato);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al crear el encuentro" });
    }
};

const actualizarEncuentro = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            competencia_id,
            equipo_1_id,
            equipo_2_id,
            ronda_encuentro,
            fecha_encuentro,
            hora_encuentro,
            puntaje_equipo_1,
            puntaje_equipo_2,
            formato_serie,
            estado_encuentro,
            imagen_encuentro
        } = req.body;

        const imagenBinaria = convertirImagenABinario(imagen_encuentro);

        const resultado = await pool.query(
            `UPDATE encuentros
             SET competencia_id = $1,
                 equipo_1_id = $2,
                 equipo_2_id = $3,
                 ronda_encuentro = $4,
                 fecha_encuentro = $5,
                 hora_encuentro = $6,
                 puntaje_equipo_1 = $7,
                 puntaje_equipo_2 = $8,
                 formato_serie = $9,
                 estado_encuentro = $10,
                 imagen_encuentro = COALESCE($11, imagen_encuentro)
             WHERE id = $12
             RETURNING id, competencia_id, equipo_1_id, equipo_2_id,
                       ronda_encuentro, fecha_encuentro, hora_encuentro,
                       puntaje_equipo_1, puntaje_equipo_2, formato_serie,
                       estado_encuentro, imagen_encuentro`,
            [
                competencia_id,
                equipo_1_id,
                equipo_2_id,
                ronda_encuentro,
                fecha_encuentro,
                hora_encuentro,
                puntaje_equipo_1,
                puntaje_equipo_2,
                formato_serie,
                estado_encuentro,
                imagenBinaria,
                id
            ]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({ mensaje: "Encuentro no encontrado" });
        }

        const dato = resultado.rows[0];
        dato.imagen_encuentro = serializarImagen(dato.imagen_encuentro);
        res.json(dato);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al actualizar el encuentro" });
    }
};

const eliminarEncuentro = async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await pool.query(
            "DELETE FROM encuentros WHERE id = $1 RETURNING id",
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({ mensaje: "Encuentro no encontrado" });
        }

        res.json({ mensaje: "Encuentro eliminado correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al eliminar el encuentro" });
    }
};

module.exports = {
    obtenerCompetencias,
    crearCompetencia,
    actualizarCompetencia,
    eliminarCompetencia,
    obtenerEncuentros,
    crearEncuentro,
    actualizarEncuentro,
    eliminarEncuentro
};
