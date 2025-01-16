// middleware/auth.js
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    try {
        // Verifica se l'utente è autenticato
        if (!req.session.userId) {
            return res.redirect('/auth/login');
        }

        // Verifica se l'utente esiste ancora nel database
        const user = await User.findById(req.session.userId);
        if (!user) {
            req.session.destroy();
            return res.redirect('/auth/login');
        }

        // Passa l'utente alle route successive
        req.user = user;
        res.locals.user = user;
        next();
    } catch (err) {
        console.error('Auth error:', err);
        res.redirect('/auth/login');
    }
};