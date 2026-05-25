// ─────────────────────────────────────────────────────────
//  routes/rotas-usuario.js — Rotas de autenticação
//  Responsável por: cadastro de novos usuários, login,
//  e encerramento de sessão (logout).
// ─────────────────────────────────────────────────────────

const express  = require('express');
const roteador = express.Router();
const path     = require('path');
const Usuario  = require('../models/Usuario');

// ── GET /usuario/cadastro ────────────────────────────────
// Exibe a página estática de cadastro de novo usuário
roteador.get('/cadastro', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/cadastro.html'));
});

// ── POST /usuario/cadastro ───────────────────────────────
// Recebe os dados do formulário e salva o novo usuário no banco
// Operação: CREATE (inserir documento na coleção "usuarios")
roteador.post('/cadastro', async (req, res) => {
    try {
        const { nome, login, senha } = req.body;

        // Cria uma nova instância do modelo com os dados do formulário
        const novoUsuario = new Usuario({ nome, login, senha });

        // Salva no MongoDB
        await novoUsuario.save();

        // Redireciona para o login com aviso de sucesso
        res.redirect('/usuario/login?sucesso=cadastro');

    } catch (erro) {
        console.error('Erro ao cadastrar usuário:', erro);

        // Login duplicado ou outro erro de validação
        res.redirect('/usuario/cadastro?erro=1');
    }
});

// ── GET /usuario/login ───────────────────────────────────
// Exibe a página estática de login
roteador.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/login.html'));
});

// ── POST /usuario/login ──────────────────────────────────
// Verifica as credenciais e inicia a sessão do usuário
// Operação: READ (buscar usuário pelo login e senha)
roteador.post('/login', async (req, res) => {
    try {
        const { login, senha } = req.body;

        // Busca o usuário no banco com o login e senha informados
        const usuario = await Usuario.findOne({ login, senha });

        if (!usuario) {
            // Credenciais inválidas — redireciona com aviso de erro
            return res.redirect('/usuario/login?erro=credenciais');
        }

        // Salva os dados do usuário na sessão para manter o login ativo
        req.session.usuarioId   = usuario._id;
        req.session.usuarioNome = usuario.nome;

        // Redireciona para a listagem de carros
        res.redirect('/carros/lista');

    } catch (erro) {
        console.error('Erro ao fazer login:', erro);
        res.redirect('/usuario/login?erro=1');
    }
});

// ── GET /usuario/sair ────────────────────────────────────
// Encerra a sessão do usuário e redireciona para o login
roteador.get('/sair', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/usuario/login');
    });
});

module.exports = roteador;

