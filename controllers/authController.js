// controllers/authController.js
const User = require('../models/User');

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1) Verifica campi
        if (!username || !password) {
            return res.status(400).render('auth/login', {
                error: 'Per favore inserisci username e password'
            });
        }

        // 2) Verifica utente e password
        const user = await User.findOne({ username }).select('+password');
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).render('auth/login', {
                error: 'Username o password non corretti'
            });
        }

        // 3) Salva l'ID utente nella sessione
        req.session.userId = user._id;
        
        res.redirect('/');
    } catch (err) {
        console.error('Login error:', err);
        res.status(400).render('auth/login', {
            error: 'Si è verificato un errore durante il login'
        });
    }
};

exports.logout = async (req, res) => {
    // Distruggi la sessione
    req.session.destroy(err => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/auth/login');
    });
};

exports.createInitialAdmin = async () => {
    try {
        const adminExists = await User.findOne({ username: 'admin' });
        
        if (!adminExists) {
            await User.create({
                username: 'admin',
                password: 'Admin123!',
                role: 'admin',
                active: true
            });
            console.log('Utente admin creato con successo');
        }
    } catch (err) {
        console.error('Errore creazione utente admin:', err);
    }
};