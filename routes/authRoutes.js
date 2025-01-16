// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route per la pagina di login
router.get('/login', (req, res) => {
    res.render('auth/login', {
        pageTitle: 'Login',
        layout: 'layouts/auth'
    });
});

router.post('/login', authController.login);
router.post('/logout', authController.logout);

module.exports = router;