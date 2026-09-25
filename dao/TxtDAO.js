const fs = require("fs");
const path = require("path");

const carpetaDatos = path.join(__dirname, "..", "data");

// ==========================================
// Formato del archivo: un registro por linea y campos separados por ";"
// (igual que data/usuario.txt). Para que el texto escrito por el usuario no
// rompa el formato, "\", ";" y los saltos de linea se guardan escapados.
// ==========================================

function escapar(valor) {
    return String(valor ?? "")
        .replace(/\\/g, "\\\\")
        .replace(/;/g, "\\;")
        .replace(/\r/g, "\\r")
        .replace(/\n/g, "\\n");
}

function desescapar(texto) {
    return texto.replace(/\\(.)/gs, (_, caracter) => {
        if (caracter === "n") {
            return "\n";
        }

        if (caracter === "r") {
            return "\r";
        }

        return caracter;
    });
}

// Un ";" separa campos solo si lo antecede una cantidad par de "\".
function separarCampos(linea) {
    const campos = [];
    let actual = "";

    linea.split(";").forEach((parte, indice, partes) => {
        actual += parte;

        let barras = 0;
        while (barras < actual.length && actual[actual.length - 1 - barras] === "\\") {
            barras++;
        }

        const escapado = barras % 2 === 1 && indice < partes.length - 1;

        if (escapado) {
            actual += ";";
        } else {
            campos.push(desescapar(actual));
            actual = "";
        }
    });

    return campos;
}

// ==========================================
// DAO generico para un archivo txt.
// "columnas" define el orden de los campos en cada linea (la primera es "id")
// y "numericas" las columnas que se devuelven como numero.
// ==========================================

class TxtDAO {
    constructor(archivo, columnas, numericas = ["id"]) {
        this.archivo = path.join(carpetaDatos, archivo);
        this.columnas = columnas;
        this.numericas = numericas;
    }

    obtenerTodos() {
        if (!fs.existsSync(this.archivo)) {
            return [];
        }

        const contenido = fs.readFileSync(this.archivo, "utf8");
        const registros = [];

        for (const linea of contenido.split("\n")) {
            if (linea.trim() === "") {
                continue;
            }

            const campos = separarCampos(linea.replace(/\r$/, ""));
            const registro = {};

            this.columnas.forEach((columna, indice) => {
                const valor = campos[indice] ?? "";
                registro[columna] = this.numericas.includes(columna) ? Number(valor) : valor;
            });

            registros.push(registro);
        }

        return registros;
    }

    obtenerPorId(id) {
        return this.obtenerTodos().find(registro => registro.id === id) || null;
    }

    crear(datos) {
        const registros = this.obtenerTodos();
        const id = registros.reduce((mayor, registro) => Math.max(mayor, registro.id), 0) + 1;
        const nuevo = { ...datos, id };

        registros.push(nuevo);
        this.guardar(registros);

        return nuevo;
    }

    actualizar(id, datos) {
        const registros = this.obtenerTodos();
        const indice = registros.findIndex(registro => registro.id === id);

        if (indice === -1) {
            return null;
        }

        registros[indice] = { ...registros[indice], ...datos, id };
        this.guardar(registros);

        return registros[indice];
    }

    eliminar(id) {
        const registros = this.obtenerTodos();
        const restantes = registros.filter(registro => registro.id !== id);

        if (restantes.length === registros.length) {
            return false;
        }

        this.guardar(restantes);
        return true;
    }

    // Se escribe en un archivo temporal y luego se renombra para no dejar el
    // txt a medias si el proceso se interrumpe mientras escribe.
    guardar(registros) {
        const lineas = registros.map(registro =>
            this.columnas.map(columna => escapar(registro[columna])).join(";")
        );
        const contenido = lineas.map(linea => linea + "\n").join("");
        const temporal = this.archivo + ".tmp";

        fs.mkdirSync(carpetaDatos, { recursive: true });
        fs.writeFileSync(temporal, contenido, "utf8");
        fs.renameSync(temporal, this.archivo);
    }
}

module.exports = TxtDAO;
