const { MongoClient } = require('mongodb');

let client;
let db;

async function conectar() {
    const uri = process.env.MONGO_URI; // lê DEPOIS do dotenv carregar
    client = new MongoClient(uri);
    await client.connect();
    db = client.db();
    console.log('MongoDB conectado');
}

function obterColecao(nome) {
    return db.collection(nome);
}

module.exports = { conectar, obterColecao };
