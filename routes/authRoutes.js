// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route per la pagina di login
router.get('/login', (req, res) => {
    // Se l'utente è già loggato, redirect alla home
    if (req.session.userId) {
        return res.redirect('/');
    }
    
    res.render('auth/login', {
        pageTitle: 'Login',
        layout: false, // Importante: non usare il layout principale
        currentYear: new Date().getFullYear()
    });
});

router.post('/login', authController.login);
router.post('/logout', authController.logout);

module.exports = router;