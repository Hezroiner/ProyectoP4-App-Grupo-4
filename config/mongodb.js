const { MongoClient } = require("mongodb");
 
require("dotenv").config();
 
const client = new MongoClient(
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
 
module.exports = conectarMongoDB;