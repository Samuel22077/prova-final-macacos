require('dotenv').config();

const express     = require('express');
const session     = require('express-session');
const metodoExtra = require('method-override');
const path        = require('path');

const { conectar }  = require('./database');
const rotasUsuario  = require('./routes/rotas-usuario');
const rotasCarro    = require('./routes/rotas-carro');

const app   = express();
const PORTA = process.env.PORTA || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(metodoExtra('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: process.env.SEGREDO_SESSAO || 'segredo-local',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 }
}));

app.get('/', (req, res) => {
    res.redirect('/usuario/login');
});

app.use('/usuario', rotasUsuario);
app.use('/carros',  rotasCarro);

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