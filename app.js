// app.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const hbs = require('hbs');
const mongoose = require('mongoose');
const session = require('express-session');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const rateLimit = require('express-rate-limit');
const transactionRouter = require('./routes/transactionRoutes');
const authRouter = require('./routes/authRoutes');
const { protect } = require('./middleware/auth');
const { connect } = require('./config/db');

// Validazione variabili d'ambiente
const requiredEnvVars = ['MONGO_URI', 'SESSION_SECRET', 'NODE_ENV'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error('Errore: Variabili d\'ambiente mancanti:', missingEnvVars.join(', '));
    process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

// View engine setup
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.set('view options', { layout: 'layouts/main' });
hbs.registerPartials(path.join(__dirname, 'views/partials'));

// Security Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https:", "cdn.tailwindcss.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https:", "cdn.tailwindcss.com"],
            fontSrc: ["'self'", "https:", "cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 ore
        sameSite: 'lax'
    },
    name: 'sessionId',
}));

// Rate limiting
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minuti
    max: 5, // limite tentativi
    message: 'Troppi tentativi di accesso. Riprova più tardi.'
});

// CSRF Protection
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

// Rendi disponibile il token CSRF nei template
app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
});

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

// Routes pubbliche con rate limiting per auth
app.use('/auth', authLimiter, authRouter);

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

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', {
        message: 'Si è verificato un errore',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

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