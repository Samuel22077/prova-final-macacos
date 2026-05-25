// ─────────────────────────────────────────────────────────
// server.js — Servidor completo
// ─────────────────────────────────────────────────────────

const express    = require('express');
const session    = require('express-session');
const { MongoClient, ObjectId } = require('mongodb');
const path       = require('path');

const app  = express();
const PORTA = 3000;

// ── URI DO MONGODB ATLAS ──────────────────────────────────
const MONGO_URI = 'mongodb+srv://samuelmtonon_db_user:Samuel123@cluster0.tak3xve.mongodb.net/prova?appName=Cluster0';

// ── CONEXÃO ───────────────────────────────────────────────
let db;

async function conectar() {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    db = client.db();
    console.log('MongoDB conectado');
}

// ── EJS ───────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ── MIDDLEWARES ───────────────────────────────────────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── SESSÃO ────────────────────────────────────────────────
app.use(session({
    secret: 'segredo123',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 }
}));

// ── ROTA RAIZ ─────────────────────────────────────────────
app.get('/', (req, res) => {
    res.redirect('/login');
});

// ── GET /cadastro ─────────────────────────────────────────
app.get('/cadastro', (req, res) => {
    res.render('cadastro', { erro: null, sucesso: null });
});

// ── POST /cadastro ────────────────────────────────────────
app.post('/cadastro', async (req, res) => {
    const { nome, login, senha } = req.body;
    try {
        const existente = await db.collection('usuarios').findOne({ login: login.toLowerCase().trim() });
        if (existente) throw new Error('Login já cadastrado');

        await db.collection('usuarios').insertOne({
            nome:     nome.trim(),
            login:    login.toLowerCase().trim(),
            senha,
            criadoEm: new Date()
        });

        res.render('login', { erro: null, sucesso: 'Usuário cadastrado! Faça login.' });
    } catch (err) {
        res.render('cadastro', { erro: err.message, sucesso: null });
    }
});

// ── GET /login ────────────────────────────────────────────
app.get('/login', (req, res) => {
    res.render('login', { erro: null, sucesso: null });
});

// ── POST /login ───────────────────────────────────────────
app.post('/login', async (req, res) => {
    const { login, senha } = req.body;
    try {
        const usuario = await db.collection('usuarios').findOne({ login: login.toLowerCase().trim() });

        if (!usuario || usuario.senha !== senha) {
            return res.render('login', { erro: 'Login ou senha incorretos', sucesso: null });
        }

        req.session.usuario = { id: usuario._id, nome: usuario.nome, login: usuario.login };

        res.redirect('/painel');
    } catch (err) {
        res.render('login', { erro: 'Erro interno. Tente novamente.', sucesso: null });
    }
});

// ── GET /painel ───────────────────────────────────────────
app.get('/painel', (req, res) => {
    if (!req.session.usuario) return res.redirect('/login');
    res.render('painel', { usuario: req.session.usuario });
});

// ── GET /logout ───────────────────────────────────────────
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

// ── INICIALIZAÇÃO ─────────────────────────────────────────
conectar()
    .then(() => {
        app.listen(PORTA, () => {
            console.log(`Servidor rodando na porta ${PORTA}`);
        });
    })
    .catch((erro) => {
        console.log('Erro ao conectar no MongoDB');
        console.log(erro);
        process.exit(1);
    });
