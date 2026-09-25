// Funciones compartidas por los controladores del CRUD en archivos txt.

// Recibe la imagen como llega del navegador (data URL o Base64 puro) y devuelve
// solo el Base64. Devuelve "" si no se envio imagen y null si no es Base64 valido.
function extraerBase64(imagen) {
    if (typeof imagen !== "string" || imagen === "") {
        return "";
    }

    const base64 = imagen.includes(",") ? imagen.split(",")[1] : imagen;

    return /^[A-Za-z0-9+/]*={0,2}$/.test(base64) ? base64 : null;
}

function serializarImagen(base64) {
    if (!base64) {
        return "";
    }

    return `data:image/png;base64,${base64}`;
}

function esFecha(valor) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
        return false;
    }

    const [anio, mes, dia] = valor.split("-").map(Number);
    const fecha = new Date(Date.UTC(anio, mes - 1, dia));

    return fecha.getUTCFullYear() === anio
        && fecha.getUTCMonth() === mes - 1
        && fecha.getUTCDate() === dia;
}

// Copia solo los campos indicados, como texto y sin espacios sobrantes.
function leerCampos(body, campos) {
    const datos = {};

    campos.forEach(campo => {
        datos[campo] = String(body?.[campo] ?? "").trim();
    });

    return datos;
}

module.exports = {
    extraerBase64,
    serializarImagen,
    esFecha,
    leerCampos
};
