const { obterColecao } = require('../database');

function colecao() {
    return obterColecao('usuarios');
}

async function criarUsuario({ nome, login, senha }) {
    const existente = await colecao().findOne({ login: login.toLowerCase().trim() });
    if (existente) throw new Error('Login já cadastrado');
    return colecao().insertOne({
        nome:     nome.trim(),
        login:    login.toLowerCase().trim(),
        senha,
        criadoEm: new Date()
    });
}

async function buscarPorLogin(login) {
    return colecao().findOne({ login: login.toLowerCase().trim() });
}

module.exports = { criarUsuario, buscarPorLogin };