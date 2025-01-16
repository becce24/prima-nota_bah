// app.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const hbs = require('hbs');
const mongoose = require('mongoose');
const session = require('express-session');
const transactionRouter = require('./routes/transactionRoutes');
const authRouter = require('./routes/authRoutes');
const { protect } = require('./middleware/auth');
const { connect } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// View engine setup
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.set('view options', { layout: 'layouts/main' });
hbs.registerPartials(path.join(__dirname, 'views/partials'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'super-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Handlebars helpers
hbs.registerHelper('formatDate', function(date, format) {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(date).toLocaleDateString('it-IT', options);
});

hbs.registerHelper('formatCurrency', function(amount) {
    return new Intl.NumberFormat('it-IT', {
        style: 'currency',
        currency: 'EUR'
    }).format(amount);
});

hbs.registerHelper('eq', function(a, b) {
    return a === b;
});

// Routes pubbliche
app.use('/auth', authRouter);

// Routes protette
app.get('/', protect, (req, res) => {
    res.redirect('/home');
});

app.get('/home', protect, (req, res) => {
    res.render('home', {
        pageTitle: 'Home',
        layout: 'layouts/main'
    });
});

app.get('/settings', protect, (req, res) => {
    res.render('settings', {
        pageTitle: 'Impostazioni',
        layout: 'layouts/main'
    });
});

app.use('/transactions', protect, transactionRouter);

// Connect to database and start server
const startServer = async () => {
    try {
        await connect();

        // Create initial admin user
        const authController = require('./controllers/authController');
        await authController.createInitialAdmin();

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to connect to database:', error);
        process.exit(1);
    }
};

startServer();