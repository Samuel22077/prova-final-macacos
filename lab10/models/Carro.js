const { obterColecao } = require('../database');
const { ObjectId }     = require('mongodb');

function colecao() {
    return obterColecao('carros');
}

async function criarCarro({ marca, modelo, ano, quantidade_disponivel }) {
    return colecao().insertOne({
        marca: marca.trim(),
        modelo: modelo.trim(),
        ano: Number(ano),
        quantidade_disponivel: Number(quantidade_disponivel),
        criadoEm: new Date()
    });
}

async function listarCarros() {
    return colecao().find().sort({ marca: 1 }).toArray();
}

async function buscarPorId(id) {
    return colecao().findOne({ _id: new ObjectId(id) });
}

async function atualizarCarro(id, { marca, modelo, ano, quantidade_disponivel }) {
    return colecao().updateOne(
        { _id: new ObjectId(id) },
        { $set: { marca: marca.trim(), modelo: modelo.trim(), ano: Number(ano), quantidade_disponivel: Number(quantidade_disponivel) } }
    );
}

async function removerCarro(id) {
    return colecao().deleteOne({ _id: new ObjectId(id) });
}

async function venderCarro(id) {
    const c = await buscarPorId(id);
    if (!c) throw new Error('Nao encontrado');
    if (c.quantidade_disponivel <= 0) throw new Error('Esgotado');
    return colecao().updateOne(
        { _id: new ObjectId(id) },
        { $inc: { quantidade_disponivel: -1 } }
    );
}

module.exports = { criarCarro, listarCarros, buscarPorId, atualizarCarro, removerCarro, venderCarro };