const { MongoClient } = require('mongodb');

const uri    = process.env.MONGO_URI;
const client = new MongoClient(uri);

let db;

async function conectar() {
    await client.connect();
    db = client.db();
    console.log('MongoDB conectado');
}

function obterColecao(nome) {
    return db.collection(nome);
}

module.exports = { conectar, obterColecao };