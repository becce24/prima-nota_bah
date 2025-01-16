

// routes/transactionRoutes.js
const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

// Route principali
router.get('/', transactionController.getAllTransactions);
router.post('/add', transactionController.addTransaction);
router.post('/delete/:id', transactionController.deleteTransaction);
router.get('/edit/:id', transactionController.getTransaction);
router.post('/edit/:id', transactionController.updateTransaction);

// Route per i suggerimenti
router.get('/clients', transactionController.getClientSuggestions);
router.get('/suppliers', transactionController.getSupplierSuggestions);

module.exports = router;