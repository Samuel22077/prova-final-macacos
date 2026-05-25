const express = require('express');
const router  = express.Router();
const { criarUsuario, buscarPorLogin } = require('../models/Usuario');

// GET /usuario/cadastro
router.get('/cadastro', (req, res) => {
    res.render('cadastro', { erro: null, sucesso: null });
});

// POST /usuario/cadastro
router.post('/cadastro', async (req, res) => {
    const { nome, login, senha } = req.body;
    try {
        await criarUsuario({ nome, login, senha });
        res.render('login', { erro: null, sucesso: 'Usuário cadastrado! Faça login.' });
    } catch (err) {
        res.render('cadastro', { erro: err.message, sucesso: null });
    }
});

// GET /usuario/login
router.get('/login', (req, res) => {
    res.render('login', { erro: null, sucesso: null });
});

// POST /usuario/login
router.post('/login', async (req, res) => {
    const { login, senha } = req.body;
    try {
        const usuario = await buscarPorLogin(login);
        if (!usuario || usuario.senha !== senha) {
            return res.render('login', { erro: 'Login ou senha incorretos', sucesso: null });
        }
        req.session.usuario = { id: usuario._id, nome: usuario.nome, login: usuario.login };
        res.redirect('/usuario/painel');
    } catch (err) {
        res.render('login', { erro: 'Erro interno. Tente novamente.', sucesso: null });
    }
});

// GET /usuario/painel
router.get('/painel', (req, res) => {
    if (!req.session.usuario) return res.redirect('/usuario/login');
    res.render('painel', { usuario: req.session.usuario });
});

// GET /usuario/logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/usuario/login');
});

module.exports = router;
