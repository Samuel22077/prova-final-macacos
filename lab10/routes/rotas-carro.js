// ─────────────────────────────────────────────────────────
//  routes/rotas-carro.js — Rotas de gerenciamento de carros
//  Responsável por: listar, cadastrar, atualizar, remover
//  e vender carros. Todas as rotas exigem login ativo.
// ─────────────────────────────────────────────────────────

const express  = require('express');
const roteador = express.Router();
const path     = require('path');
const multer   = require('multer');
const Carro    = require('../models/Carro');

// Configuração do multer — define onde e como salvar as fotos
const armazenamento = multer.diskStorage({

    // Pasta onde as fotos serão salvas
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },

    // Nome do arquivo: timestamp + nome original para evitar duplicatas
    filename: function (req, file, cb) {
        const nomeUnico = Date.now() + '-' + file.originalname;
        cb(null, nomeUnico);
    }
});

// Filtro — aceita apenas imagens
const filtroImagem = function (req, file, cb) {
    const tiposPermitidos = /jpeg|jpg|png|webp/;
    const tipoValido = tiposPermitidos.test(file.mimetype);
    if (tipoValido) {
        cb(null, true);
    } else {
        cb(new Error('Apenas imagens são permitidas (jpeg, jpg, png, webp)'));
    }
};

const upload = multer({
    storage: armazenamento,
    fileFilter: filtroImagem,
    limits: { fileSize: 5 * 1024 * 1024 } // limite de 5MB
});


// ── MIDDLEWARE DE AUTENTICAÇÃO ───────────────────────────
// Executado antes de qualquer rota de carro.
// Se o usuário não estiver logado, redireciona para o login.
function verificarLogin(req, res, next) {
    if (!req.session.usuarioId) {
        return res.redirect('/usuario/login');
    }
    next(); // usuário logado — continua para a rota
}

// ════════════════════════════════════════════════════════
//  READ — Leitura de dados
// ════════════════════════════════════════════════════════

// ── GET /carros/lista ────────────────────────────────────
// Página pública de listagem de carros disponíveis (EJS dinâmico)
// Busca todos os carros no banco e envia para o template
roteador.get('/lista', verificarLogin, async (req, res) => {
    try {
        // Busca todos os carros ordenados por marca (A→Z)
        const carros = await Carro.find().sort({ marca: 1 });

        // Renderiza a view EJS passando a lista de carros e o nome do usuário logado
        res.render('lista-carros', {
            carros,
            usuarioNome: req.session.usuarioNome
        });
    } catch (erro) {
        console.error('Erro ao listar carros:', erro);
        res.status(500).send('Erro interno ao carregar os carros.');
    }
});

// ── GET /carros/gerencia ─────────────────────────────────
// Painel administrativo de gerenciamento dos carros (EJS dinâmico)
roteador.get('/gerencia', verificarLogin, async (req, res) => {
    try {
        const carros = await Carro.find().sort({ marca: 1 });

        res.render('gerencia-carros', {
            carros,
            usuarioNome: req.session.usuarioNome
        });
    } catch (erro) {
        console.error('Erro ao carregar gerência:', erro);
        res.status(500).send('Erro interno ao carregar o painel.');
    }
});

// ════════════════════════════════════════════════════════
//  CREATE — Cadastro de novo carro
// ════════════════════════════════════════════════════════

// ── GET /carros/cadastrar ────────────────────────────────
// Exibe o formulário estático de cadastro de novo carro
roteador.get('/cadastrar', verificarLogin, (req, res) => {
    res.sendFile(path.join(__dirname, '../views/cadastrar-carro.html'));
});

// ── POST /carros/cadastrar ───────────────────────────────
// Recebe os dados do formulário e salva o novo carro no banco
roteador.post('/cadastrar', verificarLogin, async (req, res) => {
    try {
        const { marca, modelo, ano, quantidade_disponivel } = req.body;

        const novoCarro = new Carro({ marca, modelo, ano, quantidade_disponivel });
        await novoCarro.save();

        res.redirect('/carros/gerencia?sucesso=cadastro');
    } catch (erro) {
        console.error('Erro ao cadastrar carro:', erro);
        res.redirect('/carros/cadastrar?erro=1');
    }
});

// ════════════════════════════════════════════════════════
//  UPDATE — Atualização de carro existente
// ════════════════════════════════════════════════════════

// ── GET /carros/atualizar/:id ────────────────────────────
// Busca o carro pelo ID e exibe o formulário já preenchido (EJS)
roteador.get('/atualizar/:id', verificarLogin, async (req, res) => {
    try {
        // Busca o carro específico pelo ID da URL
        const carro = await Carro.findById(req.params.id);

        if (!carro) return res.redirect('/carros/gerencia');

        // Renderiza o formulário de edição passando os dados atuais do carro
        res.render('atualizar-carro', { carro });
    } catch (erro) {
        console.error('Erro ao buscar carro para atualizar:', erro);
        res.redirect('/carros/gerencia');
    }
});

// ── PUT /carros/atualizar/:id ────────────────────────────
// Salva as alterações do formulário no banco de dados
// O method-override converte POST → PUT via ?_method=PUT
roteador.put('/atualizar/:id', verificarLogin, async (req, res) => {
    try {
        const { marca, modelo, ano, quantidade_disponivel } = req.body;

        // Atualiza o documento no MongoDB com os novos dados
        await Carro.findByIdAndUpdate(req.params.id, {
            marca,
            modelo,
            ano,
            quantidade_disponivel
        });

        res.redirect('/carros/gerencia?sucesso=atualizacao');
    } catch (erro) {
        console.error('Erro ao atualizar carro:', erro);
        res.redirect('/carros/gerencia?erro=1');
    }
});

// ════════════════════════════════════════════════════════
//  DELETE — Remoção de carro
// ════════════════════════════════════════════════════════

// ── GET /carros/remover/:id ──────────────────────────────
// Busca o carro e exibe uma página de confirmação antes de deletar (EJS)
roteador.get('/remover/:id', verificarLogin, async (req, res) => {
    try {
        const carro = await Carro.findById(req.params.id);

        if (!carro) return res.redirect('/carros/gerencia');

        res.render('remover-carro', { carro });
    } catch (erro) {
        console.error('Erro ao buscar carro para remover:', erro);
        res.redirect('/carros/gerencia');
    }
});

// ── DELETE /carros/remover/:id ───────────────────────────
// Remove definitivamente o carro do banco de dados
// O method-override converte POST → DELETE via ?_method=DELETE
roteador.delete('/remover/:id', verificarLogin, async (req, res) => {
    try {
        await Carro.findByIdAndDelete(req.params.id);

        res.redirect('/carros/gerencia?sucesso=remocao');
    } catch (erro) {
        console.error('Erro ao remover carro:', erro);
        res.redirect('/carros/gerencia?erro=1');
    }
});

// ════════════════════════════════════════════════════════
//  VENDER — Decrementa o estoque do carro
// ════════════════════════════════════════════════════════

// ── POST /carros/vender/:id ──────────────────────────────
// Diminui em 1 a quantidade_disponivel do carro selecionado.
// Se já for zero, não faz nada (não vai negativo).
// O status "Esgotado" é exibido no EJS quando quantidade = 0.
roteador.post('/vender/:id', verificarLogin, async (req, res) => {
    try {
        const carro = await Carro.findById(req.params.id);

        if (!carro) return res.redirect('/carros/lista');

        // Só decrementa se ainda houver unidades em estoque
        if (carro.quantidade_disponivel > 0) {
            carro.quantidade_disponivel -= 1;
            await carro.save();
        }

        // Redireciona de volta para a lista — o EJS mostrará "Esgotado" se = 0
        res.redirect('/carros/lista');
    } catch (erro) {
        console.error('Erro ao registrar venda:', erro);
        res.redirect('/carros/lista?erro=1');
    }
});

module.exports = roteador;